package types

import "github.com/google/uuid"

type GameCommand struct {
	// metadata
	ConnID uuid.UUID

	Kind string

	// messages from the web side
	Register  *MessageRegister
	Join      *MessageJoinGame
	Create    *MessageCreateGame
	AddWord   *MessageAddWord
	StartTurn *MessageStartTurn

	// internal / synthetic messages
	Disconnect *CommandDisconnect

	Deadline *CommandDeadline
}

type CommandDisconnect struct{}

type CommandDeadline struct {
	GameID string
	Round  int
}
