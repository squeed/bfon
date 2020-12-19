import React from "react";
import "./styles/Game.scss";
import "./styles/App.scss";

import * as types from "./Types";
import { Connection } from "./Conn";
import bowl from './img/bowl.svg';

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
        gameName: "crazy llama",
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
          <div className="gametitle">
          <h1>Bowl Full of Nouns</h1>
          <h3>A remote party game for 4-20 people</h3>
          </div>
          <div className="launchoptions">
            <label htmlFor="gamepw">Enter password</label>
            <input id="gamepw" ></input>
            <button onClick={() => console.log("password entered")}>
            <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </button>
            <p>or</p>
          <button onClick={() => this.createGame("pants")}>
            {" "}
            Create Game
          </button>
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

type GameProps = {
  serverState: types.MessageGameState;
  addWord: (word: string) => void;
};

class Game extends React.Component<GameProps> {
  render() {
    const ss = this.props.serverState;
    
    return (
      <div id="game">
        <GameHeader gameName={ss.name}></GameHeader>
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
            <Bowl 
            words={ss.words.length}
            remainingWords={ss.remainingWords.length}/>
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
      <Team team={team} 
        active={false} />
    ));
    
    return (<div>{teams}</div>);
  }

}

class Team extends React.Component<{team: types.Team, active: boolean}> {
  render() {
    const t = this.props.team;
    return (
      <div className="teamRow">
        <p className="teamName">{t.name}</p><p className="teamScore"> {t.score}</p>
      </div>
    );
  }
}

class Bowl extends React.Component<{words:number, remainingWords:number}> {
  render() {
    
    return (
      <div className="bowl"><p className="remainingWords">{this.props.remainingWords}</p> / <p className="words">{this.props.words}</p>
      <img src={bowl} ></img></div> 
    );
  }
}

class Guess extends React.Component<{serverState: types.MessageGameState}> {
  render() {
    return (
      <div>TODO</div> 
    );
  }
}

class GameHeader extends React.Component<{gameName:string}, {showSettings: boolean}> {
  constructor(props: {gameName: string}){
    super(props);
    this.state = {showSettings: false};
  }

  toggleSettings() {
    this.setState(
      {showSettings: !this.state.showSettings}
    );
  }

  render(){
    return(
      <div className="gameHeader"><p className="gameTitle"> Bowl Full of Nouns</p><p className="gameName">{this.props.gameName}</p><p className="gameSettings">
        <i className="fa fa-cog"
          onClick={() => this.toggleSettings()}
        ></i>
      { this.state.showSettings && (<GameMenu />)}
      </p></div>
    )
  }
}

class GameMenu extends React.Component {
  render(){
    return(
      <div className="gameMenu">
        <ul>
          <li><a href="">Reset Round</a></li>
          <li><a href="">End Game</a></li>
        </ul>
      </div>
    )
  }
}

class Instructions extends React.Component {
  render() {
    return (
      <div><div className="gameInstructions">
      <p>Everybody puts some nouns in the bowl. Proper nouns are okay (Billie Eilish, Nigeria, Zeus). Noun phrases are okay as long as they usually belong together (sauvignon blanc, dumpster fire, taxi driver). Being complicated just to be tricky is not okay (silver pickle fork, sleeping tomcat, left sock).</p>
      <p>Players are divided into teams.</p>
      <p>The game consists of 3 rounds. In each round, teams take turns appointing a cluemeister to help them guess words. The cluemeister draws nouns from the bowl and attempts to get the rest of their team to guess as many nouns as possible in a limited time. When the bowl is empty, the round is over.</p>
      <dl><dt>Round 1</dt><dd>The cluemeister can say anything they want to help their teammates guess the clue.</dd>
      <dt>Round 2</dt><dd>The cluemeister can only say ONE (1) word and can't make extra noises or motions.</dd>
      <dt>Round 3</dt><dd>The cluemeister can't say anything, but can make motions.</dd>
      </dl>
      <h3>Giving up</h3>
      <p>There is no "passing." If the cluemeister gives up, the team's turn is over.</p>
      <h3>Leftover time</h3>
      <p>If a team ends a round with time still on the clock, that team begins the next round with a shortened turn. Their remaining time carries over to the next round.</p>
      <h3>Scoring</h3>
      <p>Each correctly guessed noun is worth 1 point. The game corrects for any unfairness in case one team got more play time than other teams.</p>
    </div></div> 
    );
  }
}

