package app

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"github.com/squeed/bfon/server/pkg/app/store"
	pgame "github.com/squeed/bfon/server/pkg/game"
	"github.com/squeed/bfon/server/pkg/types"
)

var UserID = "1111-2222"
var ConnID = uuid.MustParse("667fe2c0-435f-11eb-a4bb-002b67441478")
var GameName = "My Awesome Game"
var GameID = pgame.ParseGameID(GameName)

type FakeConn struct {
	ConnID   uuid.UUID
	Messages []types.Messageable
}

func (fc *FakeConn) ID() uuid.UUID {
	return fc.ConnID
}
func (fc *FakeConn) Run() {}

func (fc *FakeConn) Enqueue(msg types.Messageable) {
	fc.Messages = append(fc.Messages, msg)
}

// Kind of a monolithic test - run through a game sequence
func TestProcess(t *testing.T) {
	store := store.NewMemStore()
	app := NewApp(store)

	conn := FakeConn{
		ConnID: ConnID,
	}

	app.conns[ConnID] = &conn

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindRegister,
			Register: &types.MessageRegister{
				ID: UserID,
			},
		},
	)

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindCreateGame,
			Create: &types.MessageCreateGame{
				GameName: GameName,
			},
		},
	)

	gameShouldEqual := func(expected *types.MessageGameState) {
		t.Helper()
		g, err := store.GetGame(GameID)
		if err != nil {
			t.Fatal(err)
		}
		assert.Equal(t, expected, &g.MessageGameState)
	}

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 0,

		Teams: []types.Team{},

		Round:       0,
		CurrentTeam: -1,

		Words:          []string{},
		RemainingWords: []string{},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindAddTeam,
			AddTeam: &types.MessageAddTeam{
				Name: "A",
			},
		},
	)

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindAddTeam,
			AddTeam: &types.MessageAddTeam{
				Name: "B",
			},
		},
	)

	for _, w := range []string{"a", "b", "c"} {
		app.processCommand(
			&types.GameCommand{
				ConnID: ConnID,
				Kind:   types.KindAddWord,
				AddWord: &types.MessageAddWord{
					Word: w,
				},
			},
		)
	}

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 0,

		Teams: []types.Team{
			{Name: "A"},
			{Name: "B"},
		},

		Round:       0,
		CurrentTeam: -1,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindStartGame,
		},
	)

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 0,

		Teams: []types.Team{
			{Name: "A"},
			{Name: "B"},
		},

		Round:       1,
		CurrentTeam: 0,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"a", "b", "c"},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID:    ConnID,
			Kind:      types.KindStartTurn,
			StartTurn: &types.MessageStartTurn{SeqNumber: 0},
		},
	)

	// hack: hard-code the deadline
	game, err := store.GetGame(GameID)
	if err != nil {
		t.Fatal(err)
	}
	game.Deadline = 1707980688
	if err := store.SetGame(game); err != nil {
		t.Fatal(err)
	}

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 1,

		Teams: []types.Team{
			{Name: "A"},
			{Name: "B"},
		},

		Round:       1,
		CurrentTeam: 0,

		Deadline:     1707980688,
		UserGuessing: UserID,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"a", "b", "c"},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindGuess,
			Guess: &types.MessageGuess{
				SeqNumber: 1,
				Word:      "c"},
		},
	)

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 2,

		Teams: []types.Team{
			{Name: "A", Score: 1},
			{Name: "B"},
		},

		Round:       1,
		CurrentTeam: 0,

		Deadline:     1707980688,
		UserGuessing: UserID,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"a", "b"},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindGuess,
			Guess: &types.MessageGuess{
				SeqNumber: 2,
				Word:      "a"},
		},
	)

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 3,

		Teams: []types.Team{
			{Name: "A", Score: 2},
			{Name: "B"},
		},

		Round:       1,
		CurrentTeam: 0,

		Deadline:     1707980688,
		UserGuessing: UserID,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"b"},
	})

	app.processCommand(
		&types.GameCommand{
			Kind: "Deadline",
			Deadline: &types.CommandDeadline{
				GameID: GameID,
				Round:  1,
			},
		},
	)

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 4,

		Teams: []types.Team{
			{Name: "A", Score: 2},
			{Name: "B"},
		},

		Round:       1,
		CurrentTeam: 1,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"b"},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID:    ConnID,
			Kind:      types.KindStartTurn,
			StartTurn: &types.MessageStartTurn{SeqNumber: 4},
		},
	)

	// hack: hard-code the deadline
	game, err = store.GetGame(GameID)
	if err != nil {
		t.Fatal(err)
	}
	game.Deadline = 1707980688
	if err := store.SetGame(game); err != nil {
		t.Fatal(err)
	}

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 5,

		Teams: []types.Team{
			{Name: "A", Score: 2},
			{Name: "B"},
		},

		Round:       1,
		CurrentTeam: 1,

		UserGuessing: UserID,
		Deadline:     1707980688,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"b"},
	})

	// This should roll over the round
	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindGuess,
			Guess: &types.MessageGuess{
				SeqNumber: 5,
				Word:      "b"},
		},
	)

	// timeremaining is non-deterministic
	// so patch it up
	game, err = store.GetGame(GameID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Greater(t, game.TimeRemaining, 0)
	game.TimeRemaining = 25
	if err := store.SetGame(game); err != nil {
		t.Fatal(err)
	}

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 6,

		Teams: []types.Team{
			{Name: "A", Score: 2},
			{Name: "B", Score: 1},
		},

		Round:         2,
		CurrentTeam:   1,
		TimeRemaining: 25,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"a", "b", "c"},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID:    ConnID,
			Kind:      types.KindStartTurn,
			StartTurn: &types.MessageStartTurn{SeqNumber: 6},
		},
	)

	// hack: hard-code the deadline
	game, err = store.GetGame(GameID)
	if err != nil {
		t.Fatal(err)
	}
	game.Deadline = 1707980688
	if err := store.SetGame(game); err != nil {
		t.Fatal(err)
	}

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 7,

		Teams: []types.Team{
			{Name: "A", Score: 2},
			{Name: "B", Score: 1},
		},

		Round:        2,
		CurrentTeam:  1,
		Deadline:     1707980688,
		UserGuessing: UserID,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"a", "b", "c"},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindGuess,
			Guess: &types.MessageGuess{
				SeqNumber: 7,
				Word:      "a"},
		},
	)

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 8,

		Teams: []types.Team{
			{Name: "A", Score: 2},
			{Name: "B", Score: 2},
		},

		Round:        2,
		CurrentTeam:  1,
		Deadline:     1707980688,
		UserGuessing: UserID,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"b", "c"},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindGuess,
			Guess: &types.MessageGuess{
				SeqNumber: 8,
				Word:      "c"},
		},
	)

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 9,

		Teams: []types.Team{
			{Name: "A", Score: 2},
			{Name: "B", Score: 3},
		},

		Round:        2,
		CurrentTeam:  1,
		Deadline:     1707980688,
		UserGuessing: UserID,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"b"},
	})

	app.processCommand(
		&types.GameCommand{
			ConnID: ConnID,
			Kind:   types.KindGuess,
			Guess: &types.MessageGuess{
				SeqNumber: 9,
				Word:      "b"},
		},
	)

	// timeremaining is non-deterministic
	// so patch it up
	game, err = store.GetGame(GameID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Greater(t, game.TimeRemaining, 0)
	game.TimeRemaining = 25
	if err := store.SetGame(game); err != nil {
		t.Fatal(err)
	}

	gameShouldEqual(&types.MessageGameState{
		Name:      GameName,
		ID:        GameID,
		SeqNumber: 10,

		Teams: []types.Team{
			{Name: "A", Score: 2},
			{Name: "B", Score: 4},
		},

		Round:         3,
		CurrentTeam:   1,
		TimeRemaining: 25,

		Words:          []string{"a", "b", "c"},
		RemainingWords: []string{"a", "b", "c"},
	})
}
