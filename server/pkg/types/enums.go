package types

const (
	KindGameState   = "gameState"
	KindRegister    = "register"
	KindJoinGame    = "joinGame"
	KindAddTeam     = "addTeam"
	KindAddWord     = "addWord"
	KindCreateGame  = "createGame"
	KindInvalidGame = "invalidGame"
	KindLeaveGame   = "leaveGame"
	KindStartTurn   = "startTurn"
	KindEndTurn     = "endTurn"
	KindGuess       = "guess"
	KindStartGame   = "startGame"
)

var AllMessageKinds = []MessageKind{
	KindGameState,
	KindRegister,
	KindJoinGame,
	KindAddTeam,
	KindAddWord,
	KindCreateGame,
	KindInvalidGame,
	KindLeaveGame,
	KindStartTurn,
	KindEndTurn,
	KindGuess,
	KindStartGame,
}

func (k MessageKind) TSName() string {
	return string(k)
}
