import "./styles/Game.scss";
import bowl from "./img/bowl.svg";

import * as types from "./Types";
import React from "react";

import * as extras from "./Extras";

type GameProps = {
  serverState: types.MessageGameState;
  addWord: (word: string) => void;
  myUserID: string;
};

class Game extends React.Component<GameProps> {
  render() {
    const ss = this.props.serverState;

    return (
      <div id="game">
        <extras.GameHeader gameName={ss.name} />
        {ss.round === -1 && <div>Team picker goes here</div>}
        {ss.round <= 0 && (
          <WordList words={ss.words} addWord={this.props.addWord} />
        )}
        {ss.round > 0 && ss.round <= 3 && (
          <div>
            <TeamList serverState={ss} />
            <Guess serverState={ss} myUserID={this.props.myUserID} />
            <Bowl
              words={ss.words.length}
              remainingWords={ss.remainingWords.length}
            />
          </div>
        )}
        {ss.round >= 4 && (
          <div>
            Game is over!
            <TeamList serverState={ss} />
          </div>
        )}
      </div>
    );
  }
}

export default Game;

class WordList extends React.Component<{
  words: string[];
  addWord: (word: string) => void;
}> {
  inputRef = React.createRef<HTMLInputElement>();

  addWord(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const node = this.inputRef.current;
    if (node) {
      this.props.addWord(node.value);
      node.value = "";
    }
  }

  render() {
    return (
      <div>
        Time to add some words!
        <br />
        There are {this.props.words.length} words in the bowl.
        <form onSubmit={(e) => this.addWord(e)}>
          <label>
            Add a word: <input type="text" ref={this.inputRef} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

class TeamList extends React.Component<{
  serverState: types.MessageGameState;
}> {
  render() {
    const ss = this.props.serverState;
    const teams = ss.teams.map((team, index) => (
      <Team team={team} active={index === ss.currentTeam} />
    ));
    return <div>{teams}</div>;
  }
}

class Team extends React.Component<{ team: types.Team; active: boolean }> {
  render() {
    const t = this.props.team;
    return (
      <div className="teamRow">
        <p className="teamName">{t.name}</p>
        {this.props.active && <div>Yer' Up</div>}
        <p className="teamScore"> {t.score}</p>
      </div>
    );
  }
}

class Bowl extends React.Component<{ words: number; remainingWords: number }> {
  render() {
    return (
      <div className="bowl">
        <p className="remainingWords">{this.props.remainingWords}</p> /{" "}
        <p className="words">{this.props.words}</p>
        <img src={bowl}></img>
      </div>
    );
  }
}

class Guess extends React.Component<{
  serverState: types.MessageGameState;
  myUserID: string;
}> {
  render() {
    return <div>TODO</div>;
  }
}
