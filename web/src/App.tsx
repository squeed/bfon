import React from "react";
import "./Game.css";
import * as types from "./Types";
import { Connection } from "./Conn";

type AppState = {
  connected: boolean;
  gameName: string | undefined;
  gameState: types.MessageGameState | undefined;
  userID: string | undefined;
};

const DEBUG_MODE = true;

class App extends React.Component<{}, AppState> {
  conn: Connection | undefined;

  componentDidMount() {
    if (DEBUG_MODE) {
      this.setState({
        connected: true,
        gameName: "Crazy Llama",
        userID: "1111-2222",
        gameState: new types.MessageGameState({
          name: "Crazy Llama",
          ID: "crazyllama",

          round: 1,

          teams: [
            {
              id: "asdf1",
              name: "team one",
              score: 5,
            },
            {
              id: "asdf2",
              name: "team two",
              score: 2,
            },
            {
              id: "asdf3",
              name: "team three",
              score: 55,
            },
            {
              id: "asdf4",
              name: "team four",
              score: 8,
            },
          ],

          // set to 0 - 3 to make a certain team active
          currentTeam: -1,

          //userGuessing: "1111-2222"
          //deadline: 1707980688

          words: ["poopoo", "caca"],
          remainingWords: ["caca"],
        }),
      });
      return;
    }

    this.conn = new Connection(
      "ws://127.0.0.1:8080/ws",
      () => this.onConnect(),
      (s) => this.onNewState(s)
    );
  }

  onConnect() {
    this.setState({
      connected: true,
    });
  }

  onNewState(st: any) {
    console.log("got new server state", st);

    this.setState({
      gameState: st,
      gameName: st.name,
      userID: this.conn?.uid(),
    });
  }

  addWord(word: string) {
    if (DEBUG_MODE) {
      let st = {
        gameName: this.state.gameName,
        connected: this.state.connected,
        gameState: this.state.gameState,
      };
      if (st.gameState) {
        st.gameState.words.push(word);
        st.gameState.remainingWords.push(word);
      }
      this.setState(st);
      return;
    }


    if (!this.conn) {
      console.log("not connected");
      return;
    }

    console.log("sending move");

    this.conn.sendCommand("addWord", {
      word: word,
    });
  }

  createGame(name: string) {
    this.setState({
      gameState: undefined,
      gameName: name,
    });
    if (!this.conn) {
      console.log("not connected");
      return;
    }

    this.conn.sendCommand("createGame", { gameName: name });
  }

  render() {
    if ( !this.state || !this.state.connected ) {
      return <div> Connecting...</div>;
    }
    if (!this.state.gameName) {
      return (
        <div>
          <button onClick={() => this.createGame("pants")}>
            {" "}
            Create Pants Game
          </button>
        </div>
      );
    }
    if (!this.state.gameState) {
      return <div>Joining game...</div>;
    }
    return (
      <div>
        <Game
          serverState={this.state.gameState}
          addWord={(word: string) => this.addWord(word)}
        />
      </div>
    );
  }
}

export default App;

type GameProps = {
  serverState: types.MessageGameState;
  addWord: (word: string) => void;
};

class Game extends React.Component<GameProps> {
  

  render() {
    const ss = this.props.serverState;
    
    return (
      <div id="game">
        <div>Hey, it's game {ss.name} </div>
        {
          ss.round === -1 &&
          <div>Team picker goes here</div>
        }
        {
          ss.round === 0 &&
          <WordList words={ss.words} addWord={this.props.addWord} />
        }
        {
          ss.round > 0 && ss.round <= 3 &&
          <div>
            <TeamList serverState={ss} />
            <div>Guessing widget goes here</div>
          </div>
        }
      </div>
    );
  }
}

class WordList extends React.Component<{words: string[], addWord: (word: string) => void}>{
  inputRef = React.createRef<HTMLInputElement>();

  addWord(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const node = this.inputRef.current;
    if (node) {
      this.props.addWord(node.value);
    }
  }

  render(){
    const wordsList = this.props.words.map((word) => (
      <li key={word}>{word}</li>
    ));

    return (
      <div>
        Words in this game:
        <ul>{wordsList}</ul>
        <form onSubmit={(e) => this.addWord(e)}>
          <label>
            Add a word: <input type="text" ref={this.inputRef} />
          </label>
          <input type="submit" value="Submit" />
        </form>

      </div>
    )
  };
}

class TeamList extends React.Component<{serverState: types.MessageGameState}> {
  render(){
    const ss = this.props.serverState;
    const teams = ss.teams.map((team) => (
      <Team team={team} />
    ));
    return (<div>{teams}</div>);
  }

}

class Team extends React.Component<{team: types.Team}> {
  render() {
    const t = this.props.team;
    return (
      <div>
        Team "{t.name}" has score {t.score}.
      </div>
    );
  }
}
