package app

import (
	"fmt"
	"log"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/squeed/bfon/server/pkg/conn"
	"github.com/squeed/bfon/server/pkg/game"
	pgame "github.com/squeed/bfon/server/pkg/game"
	"github.com/squeed/bfon/server/pkg/types"
)

func (a *App) processCommand(cmd *types.GameCommand) {
	log.Printf("processing cmd %s", spew.Sdump(cmd))
	metricTotalCommands.With(prometheus.Labels{"command_kind": cmd.Kind}).Inc()

	var connID = cmd.ConnID
	var userID string

	var conn conn.Conn
	var game *pgame.Game

	var err error

	// synthetic event sent on alarmclock
	if cmd.Kind == "Deadline" {
		game, err := a.store.GetGame(cmd.Deadline.GameID)
		if err != nil {
			log.Printf("error getting game: %v", err)
			return
		}
		game.EndTurn(cmd.Deadline.Round, cmd.Deadline.Deadline)
		if err := a.store.SetGame(game); err != nil {
			log.Printf("failed to save game: %v", err)
			return
		}

		a.broadcastGameState(game)
		return
	}

	if cmd.Kind == "disconnect" {
		delete(a.conns, connID)
		if userID, ok := a.connToUser[connID]; ok {
			otherConn, ok := a.userToConn[userID]
			if ok && otherConn.ID() == connID {
				delete(a.userToConn, userID)
				delete(a.connToUser, connID)
			}
		}
		return
	}

	conn = a.conns[connID]

	if conn == nil {
		log.Printf("ERROR: message from disconnected / missing conn %s", connID)
		return
	}

	if cmd.Kind == types.KindRegister {
		userID = cmd.Register.ID

		a.userToConn[userID] = conn
		a.connToUser[connID] = userID

		game, err := a.store.GetUserGame(userID)
		if err == nil {
			a.sendGameState(game.GetState(), userID)
		}
		return
	}

	// At this point, must have a valid user ID
	userID = a.connToUser[connID]
	if userID == "" {
		log.Printf("%s by invalid / unregistered user, %s", cmd.Kind, connID)
		return
	}

	if cmd.Kind == types.KindJoinGame {
		a.joinGame(conn, userID, cmd.Join.GameName)
		return
	}

	if cmd.Kind == types.KindCreateGame {
		a.createGame(conn, userID, cmd)
		return
	}

	if cmd.Kind == types.KindLeaveGame {
		a.leaveGame(userID)
		return
	}

	// At this point, must have valid game
	game, err = a.store.GetUserGame(userID)
	if err != nil {
		log.Printf("User %s game is null %v", userID, err)
		return
	}

	if cmd.Kind == types.KindAddTeam {
		game.AddTeam(cmd.AddTeam.Name)
		if err := a.store.SetGame(game); err != nil {
			log.Printf("AddTeam failed: %v", err)
			return
		}

		a.broadcastGameState(game)
		return
	}

	if cmd.Kind == types.KindAddWord {
		game.AddWord(cmd.AddWord.Word)
		if err := a.store.SetGame(game); err != nil {
			log.Printf("addword failed: %v", err)
			return
		}

		a.broadcastGameState(game)
		return
	}

	if cmd.Kind == types.KindStartGame {
		if game.Round != 0 {
			log.Println("starting already started game")
			return
		}
		game.NextRound(0)

		if err := a.store.SetGame(game); err != nil {
			log.Printf("StartGame failed: %v", err)
			return
		}

		a.broadcastGameState(game)
		return
	}

	if cmd.Kind == types.KindResetGame {
		if !game.Finished() {
			log.Println("reset unfinished game")
			return
		}
		game.Reset()

		if err := a.store.SetGame(game); err != nil {
			log.Printf("ResetGame failed: %v", err)
			return
		}

		a.broadcastGameState(game)
		return
	}

	if cmd.Kind == types.KindStartTurn {
		msg := game.StartTurn(userID, cmd.StartTurn.SeqNumber)
		if msg == nil {
			return
		}
		if err := a.store.SetGame(game); err != nil {
			log.Printf("StartTurn failed: %v", err)
			return
		}
		a.broadcastGameState(game)
		t := game.DeadlineTime()
		if t == nil {
			return
		}

		time.AfterFunc(time.Until(*t), func() {
			log.Printf("Deadline for game %s expired, queuing...", game.ID)
			a.cmds <- types.GameCommand{
				Kind:     "Deadline",
				Deadline: msg,
			}
		})
		return
	}

	if cmd.Kind == types.KindEndTurn {
		game.EndUserTurn(cmd.EndTurn.SeqNumber)
		if err := a.store.SetGame(game); err != nil {
			log.Printf("startguess failed: %v", err)
			return
		}
		a.broadcastGameState(game)
		return
	}

	if cmd.Kind == types.KindGuess {
		game.GuessWord(cmd.Guess.SeqNumber, cmd.Guess.Words)
		if err := a.store.SetGame(game); err != nil {
			log.Printf("Guess failed: %v", err)
			return
		}
		a.broadcastGameState(game)
		return
	}

	log.Printf("Unhandled kind %s", cmd.Kind)
}

func (a *App) broadcastGameState(game *pgame.Game) {
	msg := game.GetState()
	userIDs, err := a.store.GetGameUsers(game.ID)
	if err != nil {
		log.Printf("ERROR broadcast game state: %v", err)
		return
	}

	for _, userID := range userIDs {
		a.sendGameState(msg, userID)
	}
}

func (a *App) sendGameState(state *types.MessageGameState, userID string) {
	conn := a.userToConn[userID]
	if conn == nil {
		return
	}
	if state == nil {
		conn.Enqueue(&types.MessageLeftGame{})
		return
	}
	conn.Enqueue(state)
}

func (a *App) createGame(conn conn.Conn, userID string, cmd *types.GameCommand) {
	gameName := cmd.Create.GameName

	if gameName == "" {
		var err error
		gameName, err = a.pickGameName()
		if err != nil {
			log.Printf("error: can't create game: %v", err)
			return
		}
	}

	gameID := game.ParseGameID(gameName)
	if gameID == "" {
		log.Printf("Invalid empty game name")
		conn.Enqueue(&types.MessageError{
			Error: "Game creation failed",
		})
		return
	}

	log.Printf("Creating game %s", gameName)

	if _, err := a.store.GetGame(gameID); err == nil {
		log.Printf("error: create existing game %s", cmd.Create.GameName)
		conn.Enqueue(&types.MessageError{
			Error: fmt.Sprintf("Game %s already exists", cmd.Create.GameName),
		})
		return
	}

	game := pgame.NewGame(gameName, userID)
	if err := a.store.SetGame(game); err != nil {
		log.Printf("failed to join game: %v", err)
		return
	}

	a.joinGame(conn, userID, game.ID)
}

func (a *App) joinGame(conn conn.Conn, userID string, name string) {
	gameID := pgame.ParseGameID(name)
	game, err := a.store.GetGame(gameID)

	if err != nil {
		log.Printf("Join nonexistent game %s", gameID)
		conn.Enqueue(&types.MessageError{
			Error: fmt.Sprintf("Game %s doesn't exist", name),
		})
		return
	}
	err = a.store.SetUserGame(userID, gameID)
	if err != nil {
		log.Printf("Game join failed: %v", err)
		return
	}

	a.sendGameState(game.GetState(), userID)
}

func (a *App) leaveGame(userID string) {
	_ = a.store.SetUserGame(userID, "")
	a.sendGameState(nil, userID)
}
