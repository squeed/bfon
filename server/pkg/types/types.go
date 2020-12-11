package types

import (
	"encoding/json"
)

type MessageKind string

type Message struct {
	Kind MessageKind     `json:"kind"`
	Data json.RawMessage `json:"data" ts_type:"string"`
}

type MessageRegister struct {
	ID string `json:"id"`
}

type MessageJoinGame struct {
	GameName string `json:"gameName"`
}

type MessageInvalidGame struct {
	GameName string `json:"gameName"`
}

type MessageGameState struct {
	Teams       []Team `json:"teams"`
	CurrentTeam int    `json:"currentTeam"`

	Words          []string `json:"words"`
	RemainingWords []string `json:"remainingWords"`

	Round int `json:"round"`
}

type Team struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Score uint   `json:"score"`
}

type MessageAddWord struct {
	Word string `json:"word"`
}
