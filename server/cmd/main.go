package main

import (
	"flag"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/squeed/bfon/server/pkg/app"
	"github.com/squeed/bfon/server/pkg/app/store"
)

var addr = flag.String("addr", ":5000", "websocket address")
var dbFile = flag.String("db", "db.sqlite", "path to sqlite db")

func main() {
	flag.Parse()
	rand.Seed(time.Now().Unix())

	var err error

	//st := store.NewMemStore()
	st, err := store.NewDBStore(*dbFile)
	if err != nil {
		log.Fatal(err)
		os.Exit(2)
	}
	defer st.Close()

	a := app.NewApp(st)

	http.HandleFunc("/ws", a.HandleWS)

	go a.Run()

	log.Printf("Listening on %s", *addr)
	err = http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
