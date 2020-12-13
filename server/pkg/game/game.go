package game

import "github.com/squeed/bfon/server/pkg/types"

func ParseGameID(in string) string {
	// TODO canonicalize
	return in
}

type Game struct {
	types.MessageGameState
}

func NewGame(name string) *Game {
	g := &Game{
		MessageGameState: types.MessageGameState{
			Name: name,
			ID:   string(ParseGameID(name)),

			Round: -1,

			Teams:       []types.Team{},
			CurrentTeam: -1,

			Words:          []string{},
			RemainingWords: []string{},
		},
	}

	return g
}

func (g *Game) GetState() *types.MessageGameState {
	return &g.MessageGameState
}

func (g *Game) AddTeam(name string) {}

func (g *Game) StartGuessing(playerID string) {}

func (g *Game) AddWord(word string) {
	// TODO, canonicalize, dedup
	g.Words = append(g.Words, word)
}
