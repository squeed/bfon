package types

const (
	KindRegister    = "register"
	KindJoinGame    = "joinGame"
	KindInvalidGame = "invalidGame"
	KindGameState   = "gameState"
	KindLeaveGame   = "leaveGame"
	KindAddWord     = "addWord"
)

var AllMessageKinds = []MessageKind{
	KindRegister,
	KindJoinGame,
	KindInvalidGame,
	KindGameState,
	KindLeaveGame,
	KindAddWord,
}

func (k MessageKind) TSName() string {
	return string(k)
}
