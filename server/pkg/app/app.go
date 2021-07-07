package app

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/squeed/bfon/server/pkg/app/store"
	"github.com/squeed/bfon/server/pkg/conn"
	"github.com/squeed/bfon/server/pkg/types"
)

type App struct {
	cmds chan types.GameCommand

	store store.Store

	// conn id -> connection
	conns map[uuid.UUID]conn.Conn

	// player id -> connection
	userToConn map[string]conn.Conn
	connToUser map[uuid.UUID]string
}

func NewApp(db store.Store) *App {
	return &App{
		store: db,

		cmds:  make(chan types.GameCommand, 10),
		conns: map[uuid.UUID]conn.Conn{},

		userToConn: map[string]conn.Conn{},
		connToUser: map[uuid.UUID]string{},
	}
}

func (a *App) Run() {
	for {
		cmd, ok := <-a.cmds
		if !ok {
			log.Printf("closed cmd q")
			return
		}
		time.Sleep(time.Second * 2)
		a.processCommand(&cmd)
		log.Printf("processsing done")
	}
}

func (a *App) HandleWS(w http.ResponseWriter, r *http.Request) {
	log.Printf("serve?")
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to websocketify: %v", err)
		return
	}
	log.Println("Got a new connection")
	id := uuid.New()
	c := conn.NewConnection(
		ws, id,
		a.cmds,
	)
	a.conns[id] = c
	c.Run()
	metricTotalConns.Inc()
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,

	CheckOrigin: func(req *http.Request) bool {
		if strings.HasPrefix(req.Host, "localhost") || strings.HasPrefix(req.Host, "127.0.0.1") || strings.HasPrefix(req.Host, "bfon.club") {
			return true
		}
		log.Printf("Rejecting request from %s", req.Host)
		return false
	},
}
