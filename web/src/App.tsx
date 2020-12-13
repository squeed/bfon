import React from "react";
import "./Game.css";
import * as types from "./Types";
import { Connection } from "./Conn";

type AppState = {
  connected: boolean;
  gameName: string | undefined;
  gameState: types.MessageGameState | undefined;
};

const DEBUG_MODE = true;

class App extends React.Component<{}, AppState> {
  conn: Connection | undefined;

  componentDidMount() {
    if (DEBUG_MODE) {
      this.setState({
        connected: true,
        gameName: "Crazy Llama",
        gameState: new types.MessageGameState({
          name: "pants",
          ID: "pants",
          round: -1,
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
          ],
          currentTeam: -1,
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
  inputRef = React.createRef<HTMLInputElement>();

  addWord(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const node = this.inputRef.current;
    if (node) {
      this.props.addWord(node.value);
    }
  }

  render() {
    const ss = this.props.serverState;
    const wordsList = this.props.serverState.words.map((word) => (
      <li key={word}>{word}</li>
    ));
    return (
      <div id="game">
        <div>Hey, it's game {ss.name} </div>
        Words in this game:
        <ul>{wordsList}</ul>
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

type TeamProps = {
  name: string;
  score: number;
};

class Team extends React.Component<TeamProps> {
  render() {
    return (
      <div>
        Team {this.props.name} has score {this.props.score}.
      </div>
    );
  }
}
