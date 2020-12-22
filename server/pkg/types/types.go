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

type MessageAddTeam struct {
	Name string `json:"name"`
}

type MessageAddWord struct {
	Word string `json:"word"`
}

type MessageStartTurn struct {
	SeqNumber int `json:"seqNumber"`
}

type MessageGuess struct {
	SeqNumber int    `json:"seqNumber"`
	Word      string `json:"word"`
}

type MessageGameState struct {
	Name      string `json:"name"`
	ID        string `json:"ID"`
	SeqNumber int    `json:"seqNumber"`

	AdminUser string `json:"adminUser"`

	Round int `json:"round"`

	Teams       []Team `json:"teams"`
	CurrentTeam int    `json:"currentTeam"`

	Words          []string `json:"words"`
	RemainingWords []string `json:"remainingWords"`

	UserGuessing string `json:"userGuessing,omitempty"`
	Deadline     int64  `json:"deadline,omitempty"`

	// if there's a round overshot
	TimeRemaining int `json:"timeRemaining,omitempty"`
}

type Team struct {
	Name  string `json:"name"`
	Score uint   `json:"score"`
}
