package game

import (
	"log"
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

func NewGame(name, adminUser string) *Game {
	g := &Game{
		MessageGameState: types.MessageGameState{
			Name: name,
			ID:   ParseGameID(name),

			AdminUser: adminUser,

			Round: 0, // add words and teams

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
	d = d.Add(2 * time.Second) // grace period
	return &d
}

func (g *Game) Finished() bool {
	return g.Round == 4
}

func (g *Game) Reset() {
	g.MessageGameState = types.MessageGameState{
		Name: g.Name,
		ID:   g.ID,

		AdminUser: g.AdminUser,

		Round: 0, // add words and teams

		Teams:       []types.Team{},
		CurrentTeam: -1,

		Words:          []string{},
		RemainingWords: []string{},
	}
}

func (g *Game) AddTeam(name string) {
	if name == "" {
		log.Printf("rejecting emtpy team")
		return
	}

	if g.Round > 0 {
		log.Printf("rejecting AddTeam, round %d", g.Round)
		return
	}
	for _, t := range g.Teams {
		if t.Name == name {
			return
		}
	}
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
		GameID:   g.ID,
		Round:    g.Round,
		Deadline: g.Deadline,
	}
}

func (g *Game) EndUserTurn(seqNumber int) {
	log.Println("EndTurn")
	if g.SeqNumber != seqNumber {
		log.Println("EndTurn out of sequence")
		return
	}

	g.SeqNumber++
	g.Deadline = 0
	g.UserGuessing = ""
	g.CurrentTeam = (g.CurrentTeam + 1) % len(g.Teams)
}

func (g *Game) EndTurn(round int, deadline int64) {
	log.Println("EndTurn")
	if g.Round != round {
		log.Println("round advanced; ignoring deadline")
		return
	}

	if g.Deadline != deadline {
		log.Println("Deadline changed; ignoring deadline")
		return
	}

	g.SeqNumber++
	g.Deadline = 0
	g.UserGuessing = ""
	g.CurrentTeam = (g.CurrentTeam + 1) % len(g.Teams)
}

func (g *Game) GuessWord(seqNo int, words []string) {
	log.Println("GuessWord")
	if g.SeqNumber != seqNo {
		log.Println("weird - word guess had incorrect seqno")
		return
	}
	if len(g.RemainingWords) == 0 {
		log.Println("BUG: RemainingWords empty")
		return
	}

	if g.UserGuessing == "" {
		log.Print("Ignoring guess after deadline")
		return
	}

	g.SeqNumber++

	for _, word := range words {
		found := false
		for _, w := range g.RemainingWords {
			if w == word {
				found = true
				break
			}
		}
		if !found {
			log.Printf("Weird - word guess of nonexistent word %s", word)
			return
		}

		g.Teams[g.CurrentTeam].Score++

		if len(g.RemainingWords) == 1 {
			g.RemainingWords = []string{}
			// compute clock remaining
			remaining := time.Until(*g.DeadlineTime()).Seconds()
			if remaining < 5 {
				remaining = 0
				g.EndTurn(g.Round, g.Deadline)
			}
			g.NextRound(int(remaining))
			return
		}

		words := make([]string, 0, len(g.RemainingWords)-1)
		for _, w := range g.RemainingWords {
			if w != word {
				words = append(words, w)
			}
		}
		g.RemainingWords = words
	}
}

// EndRound moves to the next round - called when the bowl is empty
func (g *Game) NextRound(remainingTime int) {
	g.Round++
	g.UserGuessing = ""
	g.Deadline = 0
	if g.Round == 4 {
		// game over
		return
	}

	// shuffle words
	g.RemainingWords = append([]string{}, g.Words...)

	// Stop guessing
	g.TimeRemaining = remainingTime

	if g.CurrentTeam == -1 {
		g.CurrentTeam = 0
	}
}
