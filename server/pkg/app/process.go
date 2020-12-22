package app

import (
	"log"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/squeed/bfon/server/pkg/conn"
	pgame "github.com/squeed/bfon/server/pkg/game"
	"github.com/squeed/bfon/server/pkg/types"
)

func (a *App) processCommand(cmd *types.GameCommand) {
	log.Printf("processing cmd %s", spew.Sdump(cmd))

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
		game.EndTurn(cmd.Deadline.Round)
		if err := a.store.SetGame(game); err != nil {
			log.Printf("failed to save game: %v", err)
			return
		}

		a.broadcastGameState(game)
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

	// At this point, must have valid game
	game, err = a.store.GetUserGame(userID)
	if err != nil {
		log.Printf("User %s game is null %v", userID, err)
		return
	}

	if cmd.Kind == types.KindLeaveGame {
		a.leaveGame(userID)
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

	if cmd.Kind == types.KindStartTurn {
		msg := game.StartTurn(userID, cmd.StartTurn.SeqNumber)
		if msg == nil {
			return
		}
		if err := a.store.SetGame(game); err != nil {
			log.Printf("startguess failed: %v", err)
			return
		}
		a.broadcastGameState(game)
		t := game.DeadlineTime()
		if t == nil {
			return
		}

		time.AfterFunc(time.Until(*t), func() {
			log.Printf("Deadline expired, queuing...")
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
		game.GuessWord(cmd.Guess.SeqNumber, cmd.Guess.Word)
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
	if _, err := a.store.GetGame(cmd.Create.GameName); err == nil {
		log.Printf("error: create existing game %s", cmd.Create.GameName)
		return
	}

	game := pgame.NewGame(cmd.Create.GameName, userID)
	if err := a.store.SetGame(game); err != nil {
		log.Printf("failed to join game: %v", err)
		return
	}

	a.joinGame(conn, userID, game.Name)
}

func (a *App) joinGame(conn conn.Conn, userID string, name string) {
	gameID := pgame.ParseGameID(name)
	game, err := a.store.GetGame(gameID)

	if err != nil {
		log.Printf("Join nonexistent game %s", gameID)
		conn.Enqueue(&types.MessageInvalidGame{
			GameName: string(gameID),
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
