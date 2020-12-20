package types

import (
	"encoding/json"
	"fmt"
)

type Messageable interface {
	ToMessage() Message
}

func (ig *MessageInvalidGame) ToMessage() Message {
	msg, err := ToMessage(KindInvalidGame, ig)
	if err != nil {
		panic(err)
	}
	return *msg
}

func (ig *MessageGameState) ToMessage() Message {
	msg, err := ToMessage(KindGameState, ig)
	if err != nil {
		panic(err)
	}
	return *msg
}

func (m *Message) ToCommand() (*GameCommand, error) {
	switch m.Kind {
	case KindRegister:
		out := MessageRegister{}
		err := m.As(KindRegister, &out)
		if err != nil {
			return nil, err
		}
		return &GameCommand{
			Kind:     string(m.Kind),
			Register: &out,
		}, nil

	case KindJoinGame:
		out := MessageJoinGame{}
		err := m.As(KindJoinGame, &out)
		if err != nil {
			return nil, err
		}
		return &GameCommand{
			Kind: string(m.Kind),
			Join: &out,
		}, nil

	case KindAddTeam:
		out := MessageAddTeam{}
		err := m.As(KindAddTeam, &out)
		if err != nil {
			return nil, err
		}
		return &GameCommand{
			Kind:    string(m.Kind),
			AddTeam: &out,
		}, nil

	case KindAddWord:
		out := MessageAddWord{}
		err := m.As(KindAddWord, &out)
		if err != nil {
			return nil, err
		}
		return &GameCommand{
			Kind:    string(m.Kind),
			AddWord: &out,
		}, nil

	case KindCreateGame:
		out := MessageCreateGame{}
		err := m.As(KindCreateGame, &out)
		if err != nil {
			return nil, err
		}
		return &GameCommand{
			Kind:   string(m.Kind),
			Create: &out,
		}, nil

	case KindStartTurn:
		out := MessageStartTurn{}
		err := m.As(KindStartTurn, &out)
		if err != nil {
			return nil, err
		}
		return &GameCommand{
			Kind:      string(m.Kind),
			StartTurn: &out,
		}, nil

	case KindGuess:
		out := MessageGuess{}
		err := m.As(KindGuess, &out)
		if err != nil {
			return nil, err
		}
		return &GameCommand{
			Kind:  string(m.Kind),
			Guess: &out,
		}, nil

	case KindStartGame:
		return &GameCommand{
			Kind: string(m.Kind),
		}, nil
	}
	return nil, fmt.Errorf("ToCommand unknown kind %s", m.Kind)
}

func (m *Message) As(kind MessageKind, v interface{}) error {
	if m.Kind != kind {
		return fmt.Errorf("Incorrect kind %s, expected %s", m.Kind, kind)
	}

	err := json.Unmarshal(m.Data, v)
	if err != nil {
		return fmt.Errorf("failed to unmarshal register: %w", err)
	}

	return nil
}

func ToMessage(kind MessageKind, v interface{}) (*Message, error) {
	buf, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	out := &Message{
		Kind: kind,
		Data: json.RawMessage(buf),
	}
	return out, nil
}
