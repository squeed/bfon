package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/gorilla/websocket"

	"github.com/squeed/bfon/server/pkg/app"
)

var addr = flag.String("addr", ":8080", "websocket address")

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(_ *http.Request) bool { return true },
}

func main() {

	flag.Parse()

	a := app.NewApp()

	http.HandleFunc("/ws", a.HandleWS)

	go a.Run()

	log.Printf("Listening on %s", *addr)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
