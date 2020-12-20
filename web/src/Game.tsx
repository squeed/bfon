import "./styles/Game.scss";
import bowl from "./img/bowl.svg";

import * as types from "./Types";
import React from "react";

import * as extras from "./Extras";

type GameProps = {
  serverState: types.MessageGameState;
  addWord: (word: string) => void;
  addTeam: (name: string) => void;
  guess: (word: string) => void;
  startGame: () => void;
  startGuessing: () => void;
  myUserID: string;
};

class Game extends React.Component<GameProps> {
  render() {
    const ss = this.props.serverState;

    return (
      <div id="game">
        <extras.GameHeader gameName={ss.name} />

        {ss.round === 0 && (
          <div>
            <TeamList serverState={ss} addTeam={this.props.addTeam} />
            <WordList words={ss.words} addWord={this.props.addWord} />

            {/* TODO: only show this when there are enough teams & words */}
            <div>
              <button onClick={() => this.props.startGame()}>
                Start Game!
                <i className="fa fa-plus" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        )}
        {ss.round > 0 && ss.round <= 3 && (
          <div>
            <TeamList serverState={ss} addTeam={this.props.addTeam} />
            <Guess
              serverState={ss}
              myUserID={this.props.myUserID}
              submitGuess={(c) => this.props.guess(c)}
              startGuessing={() => this.props.startGuessing()}
            />
            <Bowl
              words={ss.words.length}
              remainingWords={ss.remainingWords.length}
            />
          </div>
        )}
        {ss.round >= 4 && (
          <div>
            Game is over!
            <TeamList serverState={ss} addTeam={(w) => undefined} />
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
  addTeam: (teamName: string) => void;
}> {
  teamNameRef = React.createRef<HTMLInputElement>();

  addTeam() {
    const node = this.teamNameRef.current;
    if (node) {
      this.props.addTeam(node.value);
      node.value = "";
    }
  }

  render() {
    const ss = this.props.serverState;

    const addTeamForm = (
      <div>
        <label htmlFor="teamNameInput">Add a team:</label>
        <input id="teamNameInput" ref={this.teamNameRef}></input>
        <button onClick={() => this.addTeam()}>
          <i className="fa fa-plus" aria-hidden="true"></i>
        </button>
      </div>
    );

    const teams = ss.teams.map((team, index) => (
      <Team
        team={team}
        active={ss.round > 0 && ss.round < 3 && index === ss.currentTeam}
        key={team.name}
      />
    ));
    return (
      <div>
        {teams}
        {ss.round === 0 && addTeamForm}
      </div>
    );
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
        <img src={bowl} alt=""></img>
      </div>
    );
  }
}

type GuessProps = {
  serverState: types.MessageGameState;
  myUserID: string;
  submitGuess: (word: string) => void;
  startGuessing: () => void;
};

type GuessState = {
  len: number;
  wordIdx: number; // index into array
};

class Guess extends React.Component<GuessProps, GuessState> {
  constructor(props: GuessProps) {
    super(props)

    this.state = {
      wordIdx: Math.floor(
        Math.random() * props.serverState.remainingWords.length
      ),
      len: props.serverState.remainingWords.length

    };
  }

  static getDerivedStateFromProps(props: GuessProps, state: GuessState): GuessState | null {
    if (state.len === props.serverState.remainingWords.length) {
      return null;
    }

    return {
      wordIdx: Math.floor(
        Math.random() * props.serverState.remainingWords.length
      ),
      len: props.serverState.remainingWords.length
    };
  }

  guess(correct: boolean) {
    const numWords = this.props.serverState.remainingWords.length;
    if (!correct) {
      // reshuffle word
      if (numWords <= 1) {
        return;
      }

      let newIdx = Math.floor(Math.random() * numWords);
      while (newIdx === this.state.wordIdx) {
        newIdx = Math.floor(Math.random() * numWords);
      }

      this.setState({
        wordIdx: newIdx,
        len: this.state.len,
      });
      return;
    }

    const word = this.props.serverState.remainingWords[this.state.wordIdx];
    this.props.submitGuess(word);
  }

  render() {
    const ss = this.props.serverState;
    if (!ss.userGuessing || !ss.deadline) {
      return (
        <div>
          <button onClick={() => this.props.startGuessing()}>Start guessing</button>
        </div>
      );
    }

    if (ss.userGuessing === this.props.myUserID && !!ss.deadline) {
      return (
        <div>
          <p>You're guessing</p>
          <p>Word is: {ss.remainingWords[this.state.wordIdx]}</p>
          <button onClick={() => this.guess(true)}>Correct!</button>
          <button onClick={() => this.guess(false)}>Incorrect!</button>
          <Countdown deadline={ss.deadline} />
        </div>
      );
    }

    return (
      <div>
        <p>Someone else is guessing.</p>
        <Countdown deadline={ss.deadline} />
      </div>
    );
  }
}

type CountdownProps = { deadline: number };
type CountdownState = { secondsLeft: number };
class Countdown extends React.Component<CountdownProps, CountdownState> {
  timerID: number | undefined;

  constructor(props: CountdownProps) {
    super(props);

    this.state = { secondsLeft: this.secondsLeft(props.deadline) };
  }

  secondsLeft(deadline: number): number {
    const dl = Math.floor(deadline - Date.now() / 1000);
    if (dl < 0) {
      return 0;
    }
    return dl;
  }

  tick() {
    this.setState((state, props) => ({
      secondsLeft: this.secondsLeft(props.deadline),
    }));
  }

  componentDidMount() {
    this.timerID = window.setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    window.clearInterval(this.timerID);
  }

  render() {
    return <div>{this.state.secondsLeft}s left</div>;
  }
}
