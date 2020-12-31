package types

const (
	KindGameState  = "gameState"
	KindRegister   = "register"
	KindJoinGame   = "joinGame"
	KindAddTeam    = "addTeam"
	KindAddWord    = "addWord"
	KindCreateGame = "createGame"
	KindError      = "error"
	KindLeaveGame  = "leaveGame"
	KindStartTurn  = "startTurn"
	KindEndTurn    = "endTurn"
	KindGuess      = "guess"
	KindStartGame  = "startGame"
	KindResetGame  = "resetGame"
)

var AllMessageKinds = []MessageKind{
	KindGameState,
	KindRegister,
	KindJoinGame,
	KindAddTeam,
	KindAddWord,
	KindCreateGame,
	KindError,
	KindLeaveGame,
	KindStartTurn,
	KindEndTurn,
	KindGuess,
	KindStartGame,
	KindResetGame,
}

func (k MessageKind) TSName() string {
	return string(k)
}
