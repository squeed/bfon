player connects
allocate conn

player generates id
look up connection
if new, then insert in to game
if existing, replace connection


for simplicity's sake, we have single event loop (though resyncs are a problem)

just reflect game state every time