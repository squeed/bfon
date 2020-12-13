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

type MessageCreateGame struct {
	GameName string `json:"gameName"`
}

type MessageInvalidGame struct {
	GameName string `json:"gameName"`
}

type MessageAddWord struct {
	Word string `json:"word"`
}

type MessageGameState struct {
	Name string `json:"name"`
	ID   string `json:"ID"`

	Round int `json:"round"`

	Teams       []Team `json:"teams"`
	CurrentTeam int    `json:"currentTeam"`

	Words          []string `json:"words"`
	RemainingWords []string `json:"remainingWords"`

	Deadline int `json:"deadline,omitempty"`
}

type Team struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Score uint   `json:"score"`
}
