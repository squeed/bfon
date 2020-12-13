package app

import (
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/squeed/bfon/server/pkg/conn"
	"github.com/squeed/bfon/server/pkg/game"
	"github.com/squeed/bfon/server/pkg/types"
)

type App struct {
	cmds chan types.GameCommand

	games map[string]*game.Game

	// conn id -> connection
	conns map[uuid.UUID]*conn.Conn

	// player id -> connection
	userToConn map[string]*conn.Conn
	connToUser map[uuid.UUID]string

	// player ID -> Game ID
	userToGame map[string]string
}

func NewApp() *App {

	return &App{
		cmds:  make(chan types.GameCommand, 10),
		games: map[string]*game.Game{},
		conns: map[uuid.UUID]*conn.Conn{},

		userToConn: map[string]*conn.Conn{},
		connToUser: map[uuid.UUID]string{},

		userToGame: map[string]string{},
	}
}

func (a *App) Run() {
	for {
		cmd, ok := <-a.cmds
		if !ok {
			log.Printf("closed cmd q")
			return
		}
		a.processCommand(&cmd)
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
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,

	// TODO: lol security
	CheckOrigin: func(_ *http.Request) bool { return true },
}
