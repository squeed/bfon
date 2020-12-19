package store

import (
	"encoding/json"
	"fmt"

	"github.com/squeed/bfon/server/pkg/game"
	"github.com/squeed/bfon/server/pkg/types"
)

type MemStore struct {
	games map[string][]byte

	// player ID -> Game ID
	userToGame map[string]string
}

func NewMemStore() Store {
	return &MemStore{
		games:      map[string][]byte{},
		userToGame: map[string]string{},
	}
}

func (s *MemStore) SetGame(g *game.Game) error {
	b, err := json.Marshal(g.GetState())
	if err != nil {
		panic(err)
	}

	s.games[g.ID] = b
	return nil
}

func (s *MemStore) GetGame(gameID string) (*game.Game, error) {
	if b, ok := s.games[gameID]; ok {
		st := types.MessageGameState{}
		err := json.Unmarshal(b, &st)
		if err != nil {
			panic(err)
		}

		g := game.NewFromState(&st)
		return g, nil
	}
	return nil, fmt.Errorf("not found")
}

func (s *MemStore) GetUserGame(userID string) (*game.Game, error) {
	gid := s.userToGame[userID]
	if gid == "" {
		return nil, fmt.Errorf("userid not found")
	}

	return s.GetGame(gid)
}

func (s *MemStore) SetUserGame(userID, gameID string) error {
	s.userToGame[userID] = gameID
	return nil
}

func (s *MemStore) GetGameUsers(gameID string) ([]string, error) {
	out := []string{}

	for uid, gid := range s.userToGame {
		if gid == gameID {
			out = append(out, uid)
		}
	}

	return out, nil
}
