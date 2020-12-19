package game

import (
	"log"
	"math/rand"
	"strings"
	"time"

	"github.com/squeed/bfon/server/pkg/types"
)

func ParseGameID(in string) string {
	return strings.ToLower(
		strings.ReplaceAll(in, " ", ""))
}

type Game struct {
	types.MessageGameState
}

func NewGame(name string) *Game {
	g := &Game{
		MessageGameState: types.MessageGameState{
			Name: name,
			ID:   ParseGameID(name),

			Round: -1,

			Teams:       []types.Team{},
			CurrentTeam: -1,

			Words:          []string{},
			RemainingWords: []string{},
		},
	}

	return g
}

func NewFromState(st *types.MessageGameState) *Game {
	g := &Game{
		MessageGameState: *st,
	}

	return g
}

func (g *Game) GetState() *types.MessageGameState {
	return &g.MessageGameState
}

func (g *Game) DeadlineTime() *time.Time {
	if g.Deadline == 0 {
		return nil
	}

	d := time.Unix(g.Deadline, 0)
	return &d
}

func (g *Game) AddTeam(name string) {
	g.Teams = append(g.Teams, types.Team{
		Name:  name,
		Score: 0,
	})
}

func (g *Game) AddWord(word string) {
	if g.Round > 0 {
		log.Printf("rejecting AddWord, round %d", g.Round)
		return
	}
	word = strings.TrimSpace(word)

	for _, w := range g.Words {
		if strings.EqualFold(w, word) {
			log.Printf("rejecting duplicate word %s", word)
			return
		}
	}
	g.Words = append(g.Words, word)
}

func (g *Game) StartTurn(userID string, seqNumber int) *types.CommandDeadline {
	if g.UserGuessing != "" {
		log.Printf("someone is already guessing, reject")
		return nil
	}

	if g.SeqNumber != seqNumber {
		log.Printf("StartTurn out of sequence")
		return nil
	}

	g.SeqNumber++

	g.UserGuessing = userID

	period := 90
	if g.TimeRemaining != 0 {
		period = g.TimeRemaining
		g.TimeRemaining = 0
	}

	g.Deadline = time.Now().Add(time.Duration(period) * time.Second).Unix()
	return &types.CommandDeadline{
		GameID: g.ID,
		Round:  g.Round,
	}
}

func (g *Game) EndTurn(round int) {
	log.Println("EndTurn")
	if g.Round != round {
		log.Println("round advanced; ignoring deadline")
		return
	}

	g.SeqNumber++
	g.Deadline = 0
	g.UserGuessing = ""
	g.CurrentTeam = (g.CurrentTeam + 1) % len(g.Teams)
}

func (g *Game) GuessWord(seqNo int, correct bool) {
	log.Println("guessWord")
	if g.SeqNumber != seqNo {
		log.Println("weird - word guess had incorrect seqno")
		return
	}
	if len(g.RemainingWords) == 0 {
		log.Println("BUG: RemainingWords empty")
		return
	}

	g.SeqNumber++

	if !correct {
		if len(g.RemainingWords) == 1 {
			return
		}

		// move beginning to end
		beginning := g.RemainingWords[0]
		g.RemainingWords = g.RemainingWords[1:]
		g.RemainingWords = append(g.RemainingWords, beginning)
	}

	if correct {
		g.Teams[g.CurrentTeam].Score++
	}

	if correct && len(g.RemainingWords) == 1 {
		g.RemainingWords = []string{}
		// compute clock remaining
		remaining := time.Until(*g.DeadlineTime()).Seconds()
		g.NextRound(int(remaining))
		return
	}

	if correct {
		g.RemainingWords = g.RemainingWords[1:]
	}
}

// EndRound moves to the next round - called when the bowl is empty
func (g *Game) NextRound(remainingTime int) {
	// team creation to word addition
	if g.Round == -1 {
		g.Round = 0
		return
	}

	g.Round++
	if g.Round == 4 {
		// game over
		return
	}

	// shuffle words
	g.RemainingWords = append([]string{}, g.Words...)

	rand.Shuffle(len(g.RemainingWords), func(i, j int) {
		g.RemainingWords[i], g.RemainingWords[j] = g.RemainingWords[j], g.RemainingWords[i]
	})

	// Stop guessing
	g.TimeRemaining = remainingTime
	g.UserGuessing = ""
	g.Deadline = 0
}
