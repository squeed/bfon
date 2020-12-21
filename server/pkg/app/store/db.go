package store

import (
	"database/sql"
	"encoding/json"
	"fmt"

	_ "github.com/mattn/go-sqlite3"

	"github.com/squeed/bfon/server/pkg/game"
	"github.com/squeed/bfon/server/pkg/types"
)

type DBStore struct {
	db *sql.DB
}

func NewDBStore(dbFile string) (*DBStore, error) {
	db, err := sql.Open("sqlite3", fmt.Sprintf("file:%s", dbFile))

	if err != nil {
		return nil, fmt.Errorf("failed to open DB file: %w", err)
	}

	s := &DBStore{
		db: db,
	}

	if err := s.ensureTables(); err != nil {
		return nil, err
	}

	return s, nil
}

func (s *DBStore) GetGame(gameID string) (*game.Game, error) {
	blob := []byte{}
	err := s.db.QueryRow(
		"SELECT state FROM game WHERE id=?",
		gameID,
	).Scan(&blob)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("game %s does not exist", gameID)
		}
		return nil, fmt.Errorf("Could not get game: %w", err)
	}

	state := types.MessageGameState{}
	if err := json.Unmarshal(blob, &state); err != nil {
		return nil, fmt.Errorf("failed to parse game %s: %w", gameID, err)
	}

	g := game.NewFromState(&state)

	return g, nil
}

func (s *DBStore) SetGame(game *game.Game) error {
	blob, err := json.Marshal(game.GetState())
	if err != nil {
		return fmt.Errorf("failed to marshal game: %w", err)
	}

	query := `INSERT INTO game(id, state) values (?, ?)
		ON CONFLICT(id) DO UPDATE SET state=excluded.state;
	`

	_, err = s.db.Exec(query, game.ID, blob)
	if err != nil {
		return fmt.Errorf("failed to insert game: %w", err)
	}
	return nil
}

func (s *DBStore) GetUserGame(userID string) (*game.Game, error) {
	gameid := ""

	err := s.db.QueryRow(
		"SELECT gameid FROM user2game WHERE userid=?",
		userID,
	).Scan(&gameid)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user %s does not have a game", userID)
		}
		return nil, fmt.Errorf("Could not GetUserGame: %w", err)
	}
	return s.GetGame(gameid)
}

func (s *DBStore) SetUserGame(userID, gameID string) error {
	query := `INSERT INTO user2game(userid, gameid) values (?, ?)
		ON CONFLICT(userid) DO UPDATE SET gameid=excluded.gameid;
	`

	_, err := s.db.Exec(query, userID, gameID)
	if err != nil {
		return fmt.Errorf("failed to SetUserGame: %w", err)
	}
	return nil
}

func (s *DBStore) GetGameUsers(gameID string) ([]string, error) {
	query := `SELECT userid from user2game where gameid = ?;`

	rows, err := s.db.Query(query, gameID)
	if err != nil {
		return nil, fmt.Errorf("failed to GetGameUsers: %w", err)
	}

	out := []string{}
	defer rows.Close()
	for rows.Next() {
		var uid string
		err := rows.Scan(&uid)
		if err != nil {
			return nil, fmt.Errorf("failed to scan GetGameUsers: %w", err)
		}
		out = append(out, uid)
	}

	return out, nil
}

func (s *DBStore) ensureTables() error {
	schemas := []string{
		`game (
			id text not null primary key,
			state blob
		)`,

		`user2game (
			userid text not null primary key,
			gameid text not null
		)`,
	}
	for idx, schema := range schemas {
		stmt := fmt.Sprintf(
			"CREATE TABLE IF NOT EXISTS %s;",
			schema)
		_, err := s.db.Exec(stmt)
		if err != nil {
			return fmt.Errorf("Failed to create table %d: %w", idx, err)
		}
	}

	return nil
}

func (s *DBStore) Close() {
	if s.db != nil {
		s.db.Close()
	}
}
