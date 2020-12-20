import React from "react";

import "./styles/App.scss";

import * as types from "./Types";
import { Connection } from "./Conn";
import Game from "./Game";

type AppState = {
  connected: boolean;
  gameName: string | undefined;
  gameState: types.MessageGameState | undefined;
  userID: string | undefined;
};

const LOCAL_MODE = true;

class App extends React.Component<{}, AppState> {
  conn: Connection | undefined;
  passwordInputRef = React.createRef<HTMLInputElement>();

  componentDidMount() {
    if (LOCAL_MODE) {
      this.setState({
        connected: true,
        userID: "1111-2222",
        gameName: "crazy llama",
        gameState: new types.MessageGameState({
          name: "Crazy Llama",
          ID: "crazyllama",

          round: 1,

          teams: [
            {
              name: "team one",
              score: 5,
            },
            {
              name: "team two",
              score: 2,
            },
            {
              name: "team three",
              score: 55,
            },
            {
              name: "team four",
              score: 8,
            },
          ],

          // set to 0 - 3 to make a certain team active
          currentTeam: 1,
          // say "nobody is guessing" by commenting this next line out
          userGuessing: "1111-2222",
          deadline: 1707980688,

          words: ["pants", "shirt", "shoes", "socks"],
          remainingWords: ["pants", "socks"],
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
      userID: this.conn?.uid(),
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
    if (LOCAL_MODE) {
      let st = {
        gameName: this.state.gameName,
        connected: this.state.connected,
        gameState: this.state.gameState,
        userID: this.state.userID,
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

    const msg: types.MessageAddWord = {
      word: word,
    }
    this.conn.sendCommand(types.MessageKind.addWord, msg);
  }

  createGame() {
    const node = this.passwordInputRef.current;
    if (!node) {
      console.log("BUG: missing node");
      return;
    }
    const name = node.value;
    if (name === "") {
      console.log("Ignoring empty password");
      return;
    }
    if (LOCAL_MODE) {
      this.setState({
        gameState: new types.MessageGameState({
          name: name,
          ID: name,
          seqNumber: 0,
          round: 0,
          teams: [],
          currentTeam: 0,
          words: [],
          remainingWords: [],
        }),
        gameName: name,
        userID: this.state.userID,
        connected: this.state.connected,
      });
      return;
    }

    this.setState({
      gameState: undefined,
      gameName: name,
    });
    if (!this.conn) {
      console.log("not connected");
      return;
    }

    const msg: types.MessageCreateGame = { gameName: name };
    this.conn.sendCommand(types.MessageKind.createGame, msg);
  }

  joinGame() {
    if (LOCAL_MODE) {
      console.log("BUG: cannot join game in local mode");
      return
    }
    const node = this.passwordInputRef.current;
    if (!node) {
      console.log("BUG: missing node");
      return;
    }
    const name = node.value;
    if (name === "") {
      console.log("Ignoring empty password");
      return;
    }

    this.setState({
      gameState: undefined,
      gameName: name,
    });
    if (!this.conn) {
      console.log("not connected");
      return;
    }

    const msg: types.MessageJoinGame = { gameName: name };
    this.conn.sendCommand(types.MessageKind.joinGame, msg);
  }

  guess(word: string) {
    if (LOCAL_MODE) {
      let st = {
        connected: this.state.connected,
        gameName: this.state.gameName,
        gameState: this.state.gameState,
        userID: this.state.userID,
      };
      if (!st.gameState) {
        return;
      }
      let w = st.gameState.remainingWords.filter(w => w !== word);
      st.gameState.remainingWords = w;
      console.log("foo");
      this.setState(st);

      return
    }

    if (!this.state.gameState || !this.conn) {
      return; // unreachable
    }

    const msg: types.MessageGuess = { seqNumber: this.state.gameState.seqNumber, word: word };

    this.conn.sendCommand(types.MessageKind.guess, msg);
  }

  addTeam(name: string) {
    if (LOCAL_MODE) {
      let st = {
        connected: this.state.connected,
        gameName: this.state.gameName,
        gameState: this.state.gameState,
        userID: this.state.userID,
      };
      if (!st.gameState) {
        return;
      }
      st.gameState.teams = st.gameState.teams.concat([{ name: name, score: 0 }]);
      console.log("foobar");

      this.setState(st);

      return
    }

    if (!this.state.gameState || !this.conn) {
      return; // unreachable
    }

    const msg: types.MessageAddTeam = { name: name };
    this.conn.sendCommand(types.MessageKind.addTeam, msg);
  }

  startGame() {
    if (!this.state.gameState) { return; }

    if (this.state.gameState.round !== 0) { return; }

    if (LOCAL_MODE) {
      let st = {
        connected: this.state.connected,
        gameName: this.state.gameName,
        gameState: this.state.gameState,
        userID: this.state.userID,
      };
      st.gameState.remainingWords = st.gameState.words;
      st.gameState.round = 1;
      this.setState(st);
      return
    }

    if (!this.conn) { return; }

    this.conn.sendCommand(types.MessageKind.startGame, {});
  }

  startGuessing() {
    if (!this.state.gameState) { return; }

    if (this.state.gameState.round < 1 || this.state.gameState.round > 3) { return; }

    if (LOCAL_MODE) {
      let st = {
        connected: this.state.connected,
        gameName: this.state.gameName,
        gameState: this.state.gameState,
        userID: this.state.userID,
      };
      st.gameState.userGuessing = this.state.userID;
      st.gameState.deadline = Math.floor((Date.now() / 1000) + 30)
      this.setState(st);
      return
    }

    const msg = new types.MessageStartTurn({
      seqNumber: this.state.gameState.seqNumber,
    });
    this.conn?.sendCommand(types.MessageKind.startTurn, msg);
  }

  render() {
    if (!this.state || !this.state.connected || !this.state.userID) {
      return <div> Connecting...</div>;
    }
    if (!this.state.gameName) {
      return (
        <div>
          <div className="gametitle">
            <h1>Bowl Full of Nouns</h1>
            <h3>A remote party game for 4-20 people</h3>
          </div>
          <div className="launchoptions">
            <label htmlFor="gamepw">Enter password:</label>
            <input id="gamepw" ref={this.passwordInputRef}></input>
            <p>
              <button onClick={() => this.joinGame()}>
                Join <i className="fa fa-arrow-right" aria-hidden="true"></i>
              </button>
              or
              <button onClick={() => this.createGame()}>
                Create <i className="fa fa-plus" aria-hidden="true"></i>
              </button>
            </p>
          </div>
          <div className="launchfooter">
            <p>
              <a href="">How to play</a>
            </p>
            <p>
              By <a href="http://molly.is">Molly</a> and{" "}
              <a href="http://caseyc.net">Casey</a>, Christmas 2020.
            </p>
          </div>
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
          myUserID={this.state.userID}
          addWord={(word: string) => this.addWord(word)}
          addTeam={(name: string) => this.addTeam(name)}
          guess={(word: string) => this.guess(word)}
          startGuessing={() => this.startGuessing()}
          startGame={()=>this.startGame()}
        />
      </div>
    );
  }
}

export default App;
