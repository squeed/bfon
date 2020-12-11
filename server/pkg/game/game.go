package game

import "github.com/squeed/bfon/server/pkg/types"

type GameID string

func ParseGameID(in string) GameID {
	// TODO canonicalize
	return GameID(in)
}

type Game struct {
	ID        GameID
	GameState types.MessageGameState
}

func (g *Game) GetState() *types.MessageGameState {

	return &g.GameState
}

func (g *Game) AddTeam(name string) {}

func (g *Game) StartGuessing(playerID string) {}

func (g *Game) AddWord(word string) {}
