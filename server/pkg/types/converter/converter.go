package main

import (
	"fmt"

	"github.com/squeed/bfon/server/pkg/types"
	"github.com/tkrajina/typescriptify-golang-structs/typescriptify"
)

func main() {
	t := typescriptify.New()
	t.BackupDir = ""

	t.Add(types.Message{})
	t.Add(types.MessageGameState{})
	t.Add(types.MessageRegister{})
	t.AddEnum(types.AllMessageKinds)

	err := t.ConvertToFile("Types.ts")
	if err != nil {
		panic(err.Error())
	}
	fmt.Println("OK")
}
