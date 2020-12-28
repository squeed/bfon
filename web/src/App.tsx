import React from "react";
import { withAlert, AlertManager } from 'react-alert'


import "./styles/App.scss";

import * as types from "./Types";
import { Connection } from "./Conn";
import Game from "./Game";
import * as extras from "./Extras";

type AppState = {
  connected: boolean;
  gameState: types.MessageGameState | undefined;
  userID: string | undefined;
};

const LOCAL_MODE = !process.env.REACT_APP_SERVER_URL;

class App extends React.Component<{alert: AlertManager}, AppState> {
  conn: Connection | undefined;
  passwordInputRef = React.createRef<HTMLInputElement>();

  componentDidMount() {
    if (LOCAL_MODE) {
      this.setState({
        connected: true,
        userID: "1111-2222",
        //To set the "beginning of game" state, comment out from here...
        gameState: new types.MessageGameState({
          name: "Crazy Llama",
          ID: "crazyllama",
          adminUser: "1111-2222",

          round: 2,

          teams: [
            {
              name: "Kelsey Ame Ngoc",
              score: 5,
            },
            {
              name: "Sergio Casey Molly",
              score: 2,
            }

          ],

          // set to 0 - 1 to make a certain team active
          currentTeam: 1,
          // say "nobody is guessing" by commenting the next two lines out
          //userGuessing: "1111-2222",
          //deadline: 1707980688,

          words: ["astrolabe", "grunge rock", "Boutros Boutros-Ghali", "Babe Ruth", "chicken à la king", "greengrocer", "Philip Roth", "IHOP", "Laika the space dog", "sackbut", "Australian shepherd", "Hunchback of Notre Dame", "Buzz Lightyear", "Tesla Model X", "Der Spiegel"],
          remainingWords: ["astrolabe", "grunge rock", "Boutros Boutros-Ghali", "Babe Ruth", "chicken à la king", "greengrocer", "Philip Roth", "IHOP", "Laika the space dog", "sackbut", "Australian shepherd", "Hunchback of Notre Dame", "Buzz Lightyear", "Tesla Model X", "Der Spiegel"],
        }),
        //... to here
      });
      return;
    }

    var url = "ws://127.0.0.1:8080/ws";
    if (!!process.env.REACT_APP_SERVER_URL) {
      url = process.env.REACT_APP_SERVER_URL;
    }

    this.conn = new Connection(
      url,
      () => this.onConnect(),
      (s) => this.onNewState(s),
      (msg) => this.onError(msg),
    );
  }

  onConnect() {
    this.setState({
      connected: true,
      userID: this.conn?.uid(),
    });
  }

  onError(message: string) {
    this.props.alert.show(message, {
      type: 'error',
    });
  }

  onNewState(st: any) {
    console.log("got new server state", st);
    if (!st) {
      this.setState({
        userID: this.conn?.uid(),
        gameState: undefined,
      });
    } else {
      this.setState({
        gameState: st,
        userID: this.conn?.uid(),
      });
    }
  }

  addWord(word: string) {
    if (LOCAL_MODE) {
      let st = {
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
      this.onError("Please enter a password.");
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
        userID: this.state.userID,
        connected: this.state.connected,
      });
      return;
    }

    this.setState({
      gameState: undefined,
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
      this.onError("Please enter a password.");
      return;
    }

    this.setState({
      gameState: undefined,
    });
    if (!this.conn) {
      console.log("not connected");
      return;
    }

    const msg: types.MessageJoinGame = { gameName: name };
    this.conn.sendCommand(types.MessageKind.joinGame, msg);
  }

  leaveGame() {
    this.conn?.sendCommand(types.MessageKind.leaveGame, {});
  }

  guess(word: string) {
    if (LOCAL_MODE) {
      let st = {
        connected: this.state.connected,
        gameState: this.state.gameState,
        userID: this.state.userID,
      };
      if (!st.gameState) {
        return;
      }
      let w = st.gameState.remainingWords.filter(w => w !== word);
      st.gameState.remainingWords = w;
      st.gameState.teams[st.gameState.currentTeam].score++
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
        gameState: this.state.gameState,
        userID: this.state.userID,
      };
      if (!st.gameState) {
        return;
      }
      st.gameState.teams = st.gameState.teams.concat([{ name: name, score: 0 }]);

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

  endTurn() {
    if (!this.state.gameState) { return; }

    if (this.state.gameState.round < 1 || this.state.gameState.round > 3) { return; }

    if (LOCAL_MODE) {
      let st = {
        connected: this.state.connected,
        gameState: this.state.gameState,
        userID: this.state.userID,
      };
      st.gameState.userGuessing = undefined;
      st.gameState.deadline = undefined;
      this.setState(st);
      return
    }

    const msg = new types.MessageEndTurn({
      seqNumber: this.state.gameState.seqNumber,
    });
    this.conn?.sendCommand(types.MessageKind.endTurn, msg);
  }

  render() {


    if (!this.state || !this.state.connected || !this.state.userID) {
      return <div> Connecting to BFON central...</div>;
    }
    if (!this.state.gameState) {
      return (
        <div className="gameLaunch">
          <div className="gameMainTitle">
            <h1 className="heading--stroke heading--shadow">Bowl Full of Nouns</h1>
            <h3>A remote party game for 4+ people</h3>
          </div>
          <div className="launchOptions">
            <div className="joinGame">
              <p><label htmlFor="gamePW">Enter password:</label></p>
              <input id="gamepw" ref={this.passwordInputRef}></input>
              <button onClick={() => this.joinGame()}>
                Join Game <i className="fa fa-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
            <p>
              OR
            </p>
            <div className="createGame">
              <button onClick={() => this.createGame()}>
                Create New Game
              </button>
            </div>


          </div>
          <extras.Footer />
        </div>
      );
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
          endTurn={() => this.endTurn()}
          startGame={() => this.startGame()}
          leaveGame={() => this.leaveGame()}
        />
      </div>
    );
  }
}

export default withAlert()(App);