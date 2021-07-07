import React from "react";
import { withAlert, AlertManager } from 'react-alert'
import Modal from 'react-modal';

import "./styles/App.scss";

import * as types from "./Types";
import { Connection } from "./Conn";
import Game from "./Game";
import * as extras from "./Extras";

Modal.setAppElement("#root");

type AppState = {
  connected: boolean;
  gameState: types.MessageGameState | undefined;
  userID: string | undefined;
};

type AppProps = { alert: AlertManager }

const LOCAL_MODE = !process.env.REACT_APP_SERVER_URL;

class App extends React.Component<AppProps, AppState> {
  conn: Connection | undefined;
  passwordInputRef = React.createRef<HTMLInputElement>();
  wordQueue: string[] = [];

  componentDidMount() {
    if (LOCAL_MODE) {
      this.setState({
        connected: true,
        userID: "1111-2222",
        //To set the "beginning of game" state, comment out from here...
        gameState: new types.MessageGameState({
          name: "Crazy Llama",
          ID: "crazyllama",
          //adminUser: "1111-2222",

          round: 1,

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
          // userGuessing: "1111-2222",
          // deadline: 1483150000,

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
        gameState: undefined,
      });
    } else {
      this.setState({
        gameState: st,
      });

      // Deal with the word queue
      if (this.conn && this.wordQueue.length > 0 ){
        if (!st.userGuessing) {
          this.wordQueue = [];
        } else {
          // remove any missing words from the queue
          var nwq: string[] = [];
          for (const word of this.wordQueue) {
            var found = false;
            for (const rw of st.remainingWords) {
              if (word === rw) {
                found = true;
                break;
              }
            }

            // word was somehow not transmitted
            if (found) {
              console.log("Word " + word + " was not transmitted - resubmitting!");
              nwq.push(word)
            }
          }

          this.wordQueue = nwq;
          if (this.wordQueue.length > 0) {
            const msg: types.MessageGuess = { seqNumber: st.seqNumber, words: this.wordQueue };
            this.conn.sendCommand(types.MessageKind.guess, msg);
          }
        }
      }
    }
  }

  addWord(word: string): boolean {
    word = word.trim();

    if (!this.state.gameState) {
      return false; //unreachable
    }

    for (const w of this.state.gameState.words) {
      if (word.localeCompare(w, undefined, {
        ignorePunctuation: true,
        sensitivity: "base",
      }) === 0) {
        this.onError("Hmm, that word is already in the bowl!");
        return false;
      }
    }

    if (LOCAL_MODE) {
      let st = {
        gameState: this.state.gameState,
      };
      if (st.gameState) {
        st.gameState.words.push(word);
        st.gameState.remainingWords.push(word);
      }
      this.setState(st);
      return true;
    }

    if (!this.conn) {
      console.log("not connected");
      return false;
    }

    const msg: types.MessageAddWord = {
      word: word,
    }
    this.conn.sendCommand(types.MessageKind.addWord, msg);
    return true;
  }

  createGame() {
    if (LOCAL_MODE) {
      this.setState({
        gameState: new types.MessageGameState({
          name: "Funky Chicken",
          ID: "funkychicken",
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

    const msg: types.MessageCreateGame = {};
    this.conn.sendCommand(types.MessageKind.createGame, msg);
  }

  resetGame() {
    if (LOCAL_MODE) {
      //TODO
      return;
    }

    this.conn?.sendCommand(types.MessageKind.resetGame, {});
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
        gameState: this.state.gameState,
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
    
    this.wordQueue.push(word)

    const msg: types.MessageGuess = { seqNumber: this.state.gameState.seqNumber, words: this.wordQueue };
    this.conn.sendCommand(types.MessageKind.guess, msg);
  }

  addTeam(name: string) {
    name = name.trim();
    if (!name) {
      return;
    }
    if (!this.state || !this.state.gameState) {
      return; //unreachable
    }
    for (const team of this.state.gameState.teams) {
      if (team.name === name) {
        this.onError("That team name already exists.");
        return;
      }
    }

    if (LOCAL_MODE) {
      let st = {
        gameState: this.state.gameState,
      };

      st.gameState.teams = st.gameState.teams.concat([{ name: name, score: 0 }]);

      this.setState(st);

      return
    }

    if (!this.conn) {
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
        gameState: this.state.gameState,
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
        gameState: this.state.gameState,
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
        gameState: this.state.gameState,
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
    if (!this.state || !this.state.gameState || !this.state.userID) {
      return (
        <div className="gameLaunch">
          <div className="gameMainTitle">
            <h1 className="heading--stroke heading--shadow">Bowl Full of Nouns</h1>
            <h3>A remote party game for 4+ people</h3>
          </div>
          { (this.state && this.state.connected && this.state.userID) &&
            <div className="launchOptions">
              <div className="joinGame">
                <form id="joinForm" onSubmit={(e) => { e.preventDefault(); this.joinGame() }}>
                  <p><label htmlFor="gamePW">Enter password:</label></p>
                  <input id="gamepw" ref={this.passwordInputRef}></input>
                </form>
                <button type="submit" form="joinForm">
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
          }
          {!(this.state && this.state.connected && this.state.userID) &&
            <div>
              Connecting you to BFON central. Please hold...
            </div>
          }
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
          resetGame={() => this.resetGame()}
        />
      </div>
    );
  }
}

export default withAlert()(App);