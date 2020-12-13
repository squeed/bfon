package app

import (
	"log"

	"github.com/davecgh/go-spew/spew"
	"github.com/squeed/bfon/server/pkg/conn"
	pgame "github.com/squeed/bfon/server/pkg/game"
	"github.com/squeed/bfon/server/pkg/types"
)

func (a *App) processCommand(cmd *types.GameCommand) {
	log.Printf("processing cmd %s", spew.Sdump(cmd))

	var connID = cmd.ConnID
	var userID string
	var gameID string

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

		if gameID, ok := a.userToGame[userID]; ok {
			game := a.games[gameID]
			if game == nil {
				log.Printf("User's game non-existent", gameID)
				delete(a.userToGame, gameID)
				return
			}
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
	gameID = a.userToGame[userID]
	game = a.games[gameID]
	if game == nil {
		log.Printf("User %s game %s is null", userID, gameID)
		return
	}

	if cmd.Kind == types.KindLeaveGame {
		a.leaveGame(conn, userID)
	}

	if cmd.Kind == types.KindAddWord {
		game.AddWord(cmd.AddWord.Word)
		a.broadcastGameState(game)
		return
	}

	log.Printf("Unhandled kind %s", cmd.Kind)
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

func (a *App) createGame(conn *conn.Conn, userID string, cmd *types.GameCommand) {
	if _, ok := a.games[pgame.ParseGameID(cmd.Create.GameName)]; ok {
		log.Printf("error: create existing game %s", cmd.Create.GameName)
		return
	}

	game := pgame.NewGame(cmd.Create.GameName)
	a.games[game.ID] = game

	a.joinGame(conn, userID, game.Name)

}

func (a *App) joinGame(conn *conn.Conn, userID string, name string) {
	gameID := pgame.ParseGameID(name)
	game := a.games[gameID]
	if game == nil {
		log.Printf("Join nonexistent game %s", gameID)
		conn.Enqueue(&types.MessageInvalidGame{
			GameName: string(gameID),
		})
		return
	}

	a.userToGame[userID] = gameID
	a.sendGameState(game.GetState(), userID)
	return
}

func (a *App) leaveGame(conn *conn.Conn, userID string) {
	delete(a.userToGame, userID)
	// TODO: send left-game state
	return
}
