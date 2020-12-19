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
			RemainingWords: []string{"b", "a"},
		},
	}

	msg := g.StartTurn("1111-2222", 42)

	assert.Equal(t, 43, g.SeqNumber)
	assert.Equal(t, g.CurrentTeam, 1)
	assert.Less(t, time.Now().Unix(), g.Deadline)
	assert.Equal(t, &types.CommandDeadline{
		GameID: "funkychicken",
		Round:  1,
	}, msg)

	// false guess
	g.GuessWord(43, false)

	assert.Equal(t, uint(3), g.Teams[1].Score)
	assert.Equal(t, []string{"a", "b"}, g.RemainingWords)

	// correct guess
	g.GuessWord(44, true)

	assert.Equal(t, uint(4), g.Teams[1].Score)
	assert.Equal(t, []string{"b"}, g.RemainingWords)
	assert.Equal(t, 45, g.SeqNumber)

	// End the turn

	g.EndTurn(1)

	assert.Equal(t,
		Game{
			MessageGameState: types.MessageGameState{
				Name:      "Funky Chicken",
				ID:        "funkychicken",
				SeqNumber: 46,

				Round: 1,

				Teams: []types.Team{
					{Name: "A", Score: 1},
					{Name: "B", Score: 4},
				},
				CurrentTeam: 0,

				Words:          []string{"a", "b", "c"},
				RemainingWords: []string{"b"},
			},
		}, g,
	)

	// Start next turn
	g.StartTurn("4141", 46)

	// Guess last word
	g.GuessWord(47, true)

	assert.Len(t, g.RemainingWords, 3)
	assert.Len(t, g.Words, 3)
	assert.ElementsMatch(t, g.RemainingWords, g.Words)
	assert.Greater(t, g.TimeRemaining, 0)

	// Undo the randomness so we can test
	g.RemainingWords = g.Words
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
					{Name: "B", Score: 4},
				},
				CurrentTeam: 0,

				Words:          []string{"a", "b", "c"},
				RemainingWords: []string{"a", "b", "c"},
				TimeRemaining:  80,
			},
		}, g,
	)
}
