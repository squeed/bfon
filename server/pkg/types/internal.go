package types

import "github.com/google/uuid"

type GameCommand struct {
	// metadata
	ConnID uuid.UUID

	Kind string

	// messages from the web side
	Register *MessageRegister
	Join     *MessageJoinGame
	Create   *MessageCreateGame
	AddWord  *MessageAddWord

	// internal / synthetic messages
	Disconnect *CommandDisconnect
}

type CommandDisconnect struct{}
