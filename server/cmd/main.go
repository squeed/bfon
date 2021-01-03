package main

import (
	"flag"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"

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
	stopCh := make(chan struct{})
	st, err := store.NewDBStore(*dbFile, stopCh)
	if err != nil {
		log.Fatal(err)
		os.Exit(2)
	}
	defer st.Close()

	a := app.NewApp(st)
	a.RegisterMetrics()

	http.HandleFunc("/ws", a.HandleWS)
	http.Handle("/metrics", promhttp.Handler())

	go a.Run()

	log.Printf("Listening on %s", *addr)
	err = http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
	close(stopCh)
}
