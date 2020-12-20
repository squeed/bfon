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

const DEBUG_MODE = true;

class App extends React.Component<{}, AppState> {
  conn: Connection | undefined;
  passwordInputRef = React.createRef<HTMLInputElement>();

  componentDidMount() {
    if (DEBUG_MODE) {
      this.setState({
        connected: true,
        gameName: "crazy llama",
        userID: "1111-2222",
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
         // userGuessing: "1111-2222",
          deadline: 1707980688,

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

  createGame() {
    const node = this.passwordInputRef.current
    if (!node){
      console.log("BUG: missing node");
      return;
    }
    const name = node.value;
    if (name === "") {
      console.log("Ignoring empty password");
      return
    }

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

  joinGame(){
    const node = this.passwordInputRef.current
    if (!node){
      console.log("BUG: missing node");
      return;
    }
    const name = node.value;
    if (name === "") {
      console.log("Ignoring empty password");
      return
    }

    this.setState({
      gameState: undefined,
      gameName: name,
    });
    if (!this.conn) {
      console.log("not connected");
      return;
    }

    this.conn.sendCommand("joinGame", { gameName: name });
  }

  render() {
    if ( !this.state || !this.state.connected ) {
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
            <input id="gamepw" ref={this.passwordInputRef} ></input>
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
            <p><a href="">How to play</a></p>
            <p>By <a href="http://molly.is">Molly</a> and <a href="http://caseyc.net">Casey</a>, Christmas 2020.</p>
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
          addWord={(word: string) => this.addWord(word)}
        />
      </div>
    );
  }
}

export default App;