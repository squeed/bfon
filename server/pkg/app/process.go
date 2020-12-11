package app

import (
	"log"

	"github.com/squeed/bfon/server/pkg/conn"
	pgame "github.com/squeed/bfon/server/pkg/game"
	"github.com/squeed/bfon/server/pkg/types"
)

func (a *App) processCommand(cmd *types.GameCommand) {
	log.Printf("cmd kind %s", cmd.Kind)

	var connID = cmd.ConnID
	var userID string
	var gameID pgame.GameID

	var conn *conn.Conn
	var game *pgame.Game

	conn = a.conns[connID]

	if conn == nil {
		log.Printf("ERROR: message from disconnected / missing conn %s", connID)
		return
	}

	if cmd.Kind == types.KindRegister {
		userID = cmd.Register.ID

		a.userToConn[userID] = conn
		a.connToUser[connID] = userID

		return
	}

	// At this point, must have a valid user ID
	userID = a.connToUser[connID]
	if userID == "" {
		log.Printf("%s by invalid / unregistered user, %s", cmd.Kind, connID)
		return
	}

	if cmd.Kind == types.KindJoinGame {
		gameID = pgame.ParseGameID(cmd.Join.GameName)
		game := a.games[gameID]
		if game == nil {
			log.Printf("Join nonexistent game %s", gameID)
			// TODO: send response
			conn.Enqueue(&types.MessageInvalidGame{
				GameName: string(gameID),
			})
			return
		}

		a.userToGame[userID] = gameID
		a.sendGameState(game.GetState(), userID)
		return
	}

	// At this point, must have valid game
	gameID = a.userToGame[userID]
	game = a.games[gameID]
	if game == nil {
		log.Printf("User %s game %s is null", userID, gameID)
		return
	}

	if cmd.Kind == types.KindAddWord {
		game.AddWord(cmd.AddWord.Word)
		a.sendGameState(game.GetState(), userID)
		return
	}
}

func (a *App) broadcastGameState(game *pgame.Game) {
	msg := game.GetState()

	for userID, userGameID := range a.userToGame {
		if userGameID == game.ID {
			a.sendGameState(msg, userID)
		}
	}
}

func (a *App) sendGameState(state *types.MessageGameState, userID string) {
	conn := a.userToConn[userID]
	if conn == nil {
		return
	}
	conn.Enqueue(state)
}
