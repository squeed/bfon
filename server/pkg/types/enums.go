package types

const (
	KindRegister    = "register"
	KindJoinGame    = "joinGame"
	KindCreateGame  = "createGame"
	KindInvalidGame = "invalidGame"
	KindGameState   = "gameState"
	KindLeaveGame   = "leaveGame"
	KindAddWord     = "addWord"
	KindStartTurn   = "startTurn"
)

var AllMessageKinds = []MessageKind{
	KindRegister,
	KindJoinGame,
	KindCreateGame,
	KindInvalidGame,
	KindGameState,
	KindLeaveGame,
	KindAddWord,
	KindStartTurn,
}

func (k MessageKind) TSName() string {
	return string(k)
}
