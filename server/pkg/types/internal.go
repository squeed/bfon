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
	AddTeam   *MessageAddTeam
	AddWord   *MessageAddWord
	StartTurn *MessageStartTurn
	Guess     *MessageGuess

	// internal / synthetic messages
	Disconnect *CommandDisconnect

	Deadline *CommandDeadline
}

type CommandDisconnect struct{}

type CommandDeadline struct {
	GameID string
	Round  int
}
