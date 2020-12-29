package app

import (
	"math/rand"
	"strings"

	"github.com/squeed/bfon/server/pkg/app/store"
	"github.com/squeed/bfon/server/pkg/game"
)

func (a *App) pickGameName() (string, error) {
	var err error
	var gameName string

	for err == nil {
		gameName = permute()
		gameID := game.ParseGameID(gameName)

		_, err = a.store.GetGame(gameID)
	}
	if err == store.GameNotFound {
		return gameName, nil
	}
	return "", err
}

func permute() string {
	return strings.Title(adjectives[rand.Int()%len(adjectives)] +
		" " +
		animals[rand.Int()%len(animals)])
}

var adjectives = []string{
	"big",
	"stinky",
	"happy",
	"sleepy",
	"funky",
	"tall",
	"little",
	"new",
	"old",
	"pink",
	"green",
	"orange",
	"yellow",
	"cool",
	"singing",
	"dancing",
	"hot",
	"cold",
	"smug",
	"bouncy",
	"plastic",
	"forgetful",
	"tired",
	"hungry",
	"fast",
	"slow",
	"baby",
	"rude",
	"evil",
	"annoying",
	"loud",
	"quiet",
	"messy",
	"clean",
	"noisy",
	"helpful",
	"creative",
}

var animals = []string{
	"llama",
	"dog",
	"pig",
	"monkey",
	"donkey",
	"elephant",
	"emu",
	"seagull",
	"kangaroo",
	"ostrich",
	"penguin",
	"poodle",
	"badger",
	"hedgehog",
	"eagle",
	"duckling",
	"swan",
	"wallaby",
	"sheep",
	"goat",
	"duck",
	"goose",
	"otter",
	"seal",
	"walrus",
	"chicken",
	"rooster",
	"worm",
	"fly",
	"spider",
	"gorilla",
	"dolphin",
	"whale",
	"dinosaur",
	"cat",
	"kitten",
	"puppy",
	"crow",
	"magpie",
	"raven",
	"sparrow",
	"woodpecker",
	"moose",
	"elk",
	"lion",
	"tiger",
	"canary",
	"snake",
	"horse",
	"parrot",
}
