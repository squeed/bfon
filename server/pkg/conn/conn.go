package conn

import (
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/squeed/bfon/server/pkg/types"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

type Conn interface {
	ID() uuid.UUID
	Run()
	Enqueue(msg types.Messageable)
}

type WSConn struct {
	ws    *websocket.Conn
	queue chan types.Messageable
	id    uuid.UUID

	// Where we direct parsed messages
	cmdq chan types.GameCommand
}

func NewConnection(ws *websocket.Conn, id uuid.UUID, cmdq chan types.GameCommand) *WSConn {
	c := &WSConn{
		ws:    ws,
		queue: make(chan types.Messageable, 100),
		id:    id,
		cmdq:  cmdq,
	}

	return c
}

func (c *WSConn) ID() uuid.UUID {
	return c.id
}

func (c *WSConn) Run() {
	go c.readPump()
	go c.writePump()
}

func (c *WSConn) Enqueue(msg types.Messageable) {

	c.queue <- msg
}

func (c *WSConn) readPump() {
	defer c.close()
	c.ws.SetReadLimit(maxMessageSize)
	_ = c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(c.pong)
	for {
		m := &types.Message{}
		err := c.ws.ReadJSON(m)
		if err != nil {
			log.Printf("websocket read error: %v", err)
			break
		}
		log.Printf("Got a message %#v", m)
		cmd, err := m.ToCommand()
		if err != nil {
			log.Printf("websocket toCommand error: %v", err)
			continue
		}
		cmd.ConnID = c.id

		c.cmdq <- *cmd
	}
	log.Printf("read pump done")
}
func (c *WSConn) pong(_ string) error {
	_ = c.ws.SetReadDeadline(time.Now().Add(pongWait))
	return nil
}

func (c *WSConn) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.close()
	}()
	for {
		select {
		case msg, ok := <-c.queue:
			_ = c.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.ws.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			message := msg.ToMessage()
			err := c.ws.WriteJSON(message)
			if err != nil {
				log.Printf("failed to write websocket: %v", err)
				return
			}
			log.Printf("Sent message %s to connection %s", message.Kind, c.id)

		case <-ticker.C:
			_ = c.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.ws.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("failed to send ws ping to conn %s: %v", c.id, err)
				return
			}
		}
	}
}

func (c *WSConn) close() {
	c.ws.Close()
	c.cmdq <- types.GameCommand{Kind: "disconnect", ConnID: c.id}
}
