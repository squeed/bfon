package store

import (
	"fmt"

	"github.com/squeed/bfon/server/pkg/game"
)

type Store interface {
	GetGame(gameID string) (*game.Game, error)
	SetGame(game *game.Game) error

	GetUserGame(userID string) (*game.Game, error)
	SetUserGame(userID, gameID string) error

	GetGameUsers(gameID string) ([]string, error)
}

type DBStore struct {
}

func (s *DBStore) GetGame(gameID string) (*game.Game, error) {

	return nil, fmt.Errorf("not implemented")
}
