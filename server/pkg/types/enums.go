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
	KindGuess,
	KindStartGame,
}

func (k MessageKind) TSName() string {
	return string(k)
}
