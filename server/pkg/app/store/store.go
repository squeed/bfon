package store

import (
	"errors"

	"github.com/squeed/bfon/server/pkg/game"
)

type Store interface {
	GetGame(gameID string) (*game.Game, error)
	SetGame(game *game.Game) error

	GetUserGame(userID string) (*game.Game, error)
	SetUserGame(userID, gameID string) error

	GetGameUsers(gameID string) ([]string, error)
}

var GameNotFound = errors.New("Game not found")
