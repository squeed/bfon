package game

import (
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/squeed/bfon/server/pkg/types"
)

func TestParseGameID(t *testing.T) {
	for idx, tc := range []struct {
		in  string
		out string
	}{
		{
			in:  "Funky Chicken",
			out: "funkychicken",
		},
		{
			in:  "funky         CHICKen",
			out: "funkychicken",
		},
	} {
		t.Run(strconv.Itoa(idx), func(t *testing.T) {
			res := ParseGameID(tc.in)
			if res != tc.out {
				t.Errorf("Expeted %s Actual %s", tc.out, res)
			}
		})

	}
}

func TestTurn(t *testing.T) {
	g := Game{
		MessageGameState: types.MessageGameState{
			Name:      "Funky Chicken",
			ID:        "funkychicken",
			SeqNumber: 42,

			Round: 1,

			Teams: []types.Team{
				{Name: "A", Score: 1},
				{Name: "B", Score: 3},
			},
			CurrentTeam: 1,

			Words:          []string{"a", "b", "c"},
			RemainingWords: []string{"a", "b", "c"},
		},
	}

	msg := g.StartTurn("1111-2222", 42)

	assert.Equal(t, 43, g.SeqNumber)
	assert.Equal(t, g.CurrentTeam, 1)
	assert.Less(t, time.Now().Unix(), g.Deadline)
	assert.Equal(t, &types.CommandDeadline{
		GameID:   "funkychicken",
		Round:    1,
		Deadline: g.Deadline,
	}, msg)

	// correct guess
	g.GuessWord(43, []string{"b"})

	assert.Equal(t, uint(4), g.Teams[1].Score)
	assert.Equal(t, []string{"a", "c"}, g.RemainingWords)
	assert.Equal(t, 44, g.SeqNumber)

	g.GuessWord(44, []string{"c"})

	assert.Equal(t, uint(5), g.Teams[1].Score)
	assert.Equal(t, []string{"a"}, g.RemainingWords)
	assert.Equal(t, 45, g.SeqNumber)

	// End the turn

	g.EndTurn(1, g.Deadline)

	assert.Equal(t,
		Game{
			MessageGameState: types.MessageGameState{
				Name:      "Funky Chicken",
				ID:        "funkychicken",
				SeqNumber: 46,

				Round: 1,

				Teams: []types.Team{
					{Name: "A", Score: 1},
					{Name: "B", Score: 5},
				},
				CurrentTeam: 0,

				Words:          []string{"a", "b", "c"},
				RemainingWords: []string{"a"},
			},
		}, g,
	)

	// Start next turn
	g.StartTurn("4141", 46)

	// Guess last word
	g.GuessWord(47, []string{"a"})

	assert.Greater(t, g.TimeRemaining, 0)

	// Undo the randomness so we can test
	g.TimeRemaining = 80

	assert.Equal(t,
		Game{
			MessageGameState: types.MessageGameState{
				Name:      "Funky Chicken",
				ID:        "funkychicken",
				SeqNumber: 48,

				Round: 2,

				Teams: []types.Team{
					{Name: "A", Score: 2},
					{Name: "B", Score: 5},
				},
				CurrentTeam: 0,

				Words:          []string{"a", "b", "c"},
				RemainingWords: []string{"a", "b", "c"},
				TimeRemaining:  80,
			},
		}, g,
	)

	// Start next turn
	g.StartTurn("4141", 48)

	// Guess last word
	g.GuessWord(49, []string{"a", "b"})

	assert.Equal(t, uint(4), g.Teams[0].Score)
	assert.Equal(t, []string{"c"}, g.RemainingWords)
	assert.Equal(t, 50, g.SeqNumber)
}
