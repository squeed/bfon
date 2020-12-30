import "./styles/Game.scss";
import bowl0 from "./img/bowl0.svg";
import bowl20 from "./img/bowl20.svg";
import bowl40 from "./img/bowl40.svg";
import bowl60 from "./img/bowl60.svg";
import bowl80 from "./img/bowl80.svg";
import bowl100 from "./img/bowl100.svg";
import round1 from "./img/round1.svg";
import round2 from "./img/round2.svg";
import round3 from "./img/round3.svg";


import React from "react";
import ScaleText from "react-scale-text";
import Modal from 'react-modal';
import * as underscore from "underscore";

import * as types from "./Types";
import * as extras from "./Extras";

Modal.setAppElement("#root");

type GameProps = {
  serverState: types.MessageGameState;
  addWord: (word: string) => void;
  addTeam: (name: string) => void;
  guess: (word: string) => void;
  startGame: () => void;
  startGuessing: () => void;
  endTurn: () => void;
  leaveGame: () => void;
  myUserID: string;
};

type GameState = {
  showInterstitial: boolean;
};

class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);
    this.state = { showInterstitial: !this.props.serverState.userGuessing };
  }

  componentDidUpdate(prevProps: GameProps) {
    const round = this.props.serverState.round;
    if (round !== prevProps.serverState.round) {
      if (round === 0 || round === 4) {
        this.setState({ showInterstitial: true });
      } else {
        window.setTimeout(() => {
          this.setState((state, props) => ({
            showInterstitial: !props.serverState.userGuessing,
          }));
        }, 5 * 1000);
      }
    }
  }

  render() {
    const ss = this.props.serverState;
    const isAdmin = ss.adminUser === this.props.myUserID;

    /* Interstitial content */
    var newRoundText = (<div></div>);
    if (ss.round === 0) {
      if (isAdmin) {
        newRoundText = (<div>
          Welcome, admin user. Here's what to do!
          <div>
            Your game ID is <span>{ss.name}</span>. Tell everyone to join this game. They can start adding words now.
          </div>
          <div>
            You need to create some teams now.
          </div>
          <div>
            When everyone is done adding words, you can start the game! Have fun!
          </div>
        </div>);
      } else {
        newRoundText = (<div>
          Welcome to Bowl Full of Nouns! If you've not played before, you
        might want to check out <a href="../instructions" target="_blank">the instructions</a>.<br />
        Now is the time to start adding words for people to guess. The game creator
        will start the game when everyone is ready to go.
        </div>);
      }
    } else if (ss.round === 1) {
      newRoundText = (<div>
        Round one: When you're the cluemeister, get your team to guess
        your word <b>without saying that word.</b> <br />
        It's like the game Taboo.
      </div>);
    } else if (ss.round === 2) {
      newRoundText = (
        <div>
          Welcome to Round Two! Now, you can only say <b>one word</b> when
          you're the cluemeister. Be careful!
        </div>
      );
    } else if (ss.round === 3) {
      newRoundText = (
        <div>
          Its Round Three! Now, you have to act the words out. It's
          like <em>Charades</em>. Good luck!
        </div>
      );
    } else if (ss.round === 4) {
      newRoundText = (
        <div>
          The game is over! Thanks for playing.
        </div>
      );
    }

    return (
      <div id="game">
        <extras.GameNav
          gameName={ss.name}
          leaveGame={() => this.props.leaveGame()}
        />

        <Modal isOpen={this.state.showInterstitial} onRequestClose={() => this.setState({ showInterstitial: false })}  >
          <div>
            <a href="#" className="gameInstructions closeX" onClick={() => this.setState({ showInterstitial: false })}><i className="fa fa-times"></i></a>
            <br />
            {newRoundText}
          </div>
        </Modal>

        {ss.round === 0 && (
          <div>
            <WordList words={ss.words} addWord={this.props.addWord} />
            {isAdmin && (
              <div>
                <TeamForm
                  serverState={ss}
                  addTeam={(team: string) => this.props.addTeam(team)}
                />
                <div>
                  <button onClick={() => this.props.startGame()}>
                    Start Game!
                  </button>
                  <TeamList
                    serverState={ss}
                    iAmClueing={false}
                    startClueing={() => {
                      return;
                    }}
                  />
                </div>
              </div>
            )}

            {/* TODO: only show this when there are enough teams & words */}
          </div>
        )}
        {ss.round > 0 && ss.round <= 3 && (
          <div>
            <TeamList
              serverState={ss}
              iAmClueing={this.props.myUserID === ss.userGuessing}
              startClueing={() => this.props.startGuessing()}
            />

            <Guess
              serverState={ss}
              myUserID={this.props.myUserID}
              submitGuess={(c) => this.props.guess(c)}
              endTurn={() => this.props.endTurn()}
            />

            {ss.deadline !== 0 && ss.userGuessing !== this.props.myUserID && <WordLog remainingWords={ss.remainingWords} />}

            <div className="gameDash">

              {ss.round === 1 && (
                <div className="roundRule">

                  <img src={round1}></img>

                  <div className="roundDescription">Avoid this word</div>
                </div>
              )}
              {ss.round === 2 && (
                <div className="roundRule">

                  <img src={round2}></img>

                  <div className="roundDescription">Say ONE word</div>
                </div>
              )}
              {ss.round === 3 && (
                <div className="roundRule">

                  <img src={round3}></img>

                  <div className="roundDescription">Actions only, no talking</div>
                </div>
              )}
              <Bowl
                words={ss.words.length}
                remainingWords={ss.remainingWords.length}
              />
            </div>
          </div>

        )}
        {ss.round >= 4 && (
          <div>
            Game is over!
            <TeamList
              serverState={ss}
              iAmClueing={false}
              startClueing={() => {
                return;
              }}
            />
          </div>
        )}
      </div>
    );
  }
}

export default Game;

type WordListProps = {
  words: string[];

  addWord: (word: string) => void;
};

class WordList extends React.Component<WordListProps, { wordsAdded: number }> {
  inputRef = React.createRef<HTMLInputElement>();

  constructor(props: WordListProps) {
    super(props);
    this.state = { wordsAdded: 0 };
  }

  addWord(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const node = this.inputRef.current;


    if (node) {

      if (node.value === "") {
        alert("no word, ya bozo");
      } else {
        this.props.addWord(node.value);
        node.value = "";
        this.setState({ wordsAdded: this.state.wordsAdded + 1 });
      }

    }

  }

  render() {

    return (
      <div className="addWords">

        <h3>Fill the bowl with words.</h3>

        <div className="yes">
          <ul>
            <li>
              Proper nouns
              <span className="example">&nbsp;(Billie Eilish, Nigeria)</span>
            </li>
            <li>
              Noun phrases
              <span className="example">
                &nbsp;(cabernet sauvignon, bus driver)
              </span>
            </li>
          </ul>
        </div>
        <div className="no">
          <ul>
            <li>
              Boring words
              <span className="example">&nbsp;(chair, tv, phone)</span>
            </li>
            <li>
              Being super specific and tricky
              <span className="example">&nbsp;(bouquet of fragrant purple roses)</span>
            </li>
          </ul>
        </div>




        <form onSubmit={(e) => this.addWord(e)}>

          {((this.state.wordsAdded < 4) && (this.state.wordsAdded >= 0)) && (
            <div>
              <label>
                <input
                  className="addWord"
                  type="text"
                  autoComplete="off"
                  ref={this.inputRef}
                />
              </label>
              <p className="wordDirections">You can add {5 - this.state.wordsAdded} more words.</p>
              <input className="submitWord" type="submit" value="Add word" />
            </div>
          )}
          {this.state.wordsAdded === 4 && (
            <div>
              <label>
                <input
                  className="addWord"
                  type="text"
                  autoComplete="off"
                  ref={this.inputRef}
                />
              </label>
              <p className="wordDirections">Just {5 - this.state.wordsAdded} more word.</p>
              <input className="submitWord" type="submit" value="Add word" />
            </div>
          )}
          {this.state.wordsAdded === 5 && (
            <div>
              <label>
                <input
                  className="addWord"
                  type="text"
                  autoComplete="off"
                  ref={this.inputRef}
                />
              </label>
              <p className="wordDirections"><p>You're done.</p><p>Wait for the host to start the game.</p><p>(Psst! If you thought of one more perfect word, you can still sneak it in.)</p></p>
              <input className="submitWord" type="submit" value="Add word" /></div>
          )}
          {this.state.wordsAdded === 6 && (
            <div>
              <p className="wordDirections">Alright, buddy, we're cutting you off. Wait for the host to start the game.</p>
            </div>
          )}

        </form>




      </div>
    );
  }
}

class TeamForm extends React.Component<{
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
    return (
      <div>
        <label htmlFor="teamNameInput">Who's on Team 1?</label>
        <input
          id="teamNameInput"
          autoComplete="off"
          ref={this.teamNameRef}
        ></input>
        <button onClick={() => this.addTeam()}>
          <i className="fa fa-plus" aria-hidden="true"></i>
        </button>
      </div>
    );
  }
}

class TeamList extends React.Component<{
  serverState: types.MessageGameState;
  iAmClueing: boolean;
  startClueing: () => void;
}> {
  render() {
    const ss = this.props.serverState;

    if (this.props.iAmClueing) {
      const team = ss.teams[ss.currentTeam];
      return (
        <Team
          team={team}
          active={true}
          deadline={ss.deadline}
          startClueing={() => this.props.startClueing()}
          key={team.name}
        />
      );
    }

    const teams = ss.teams.map((team, index) => (
      <Team
        team={team}
        active={ss.round > 0 && ss.round <= 3 && index === ss.currentTeam}
        deadline={ss.deadline}
        startClueing={() => this.props.startClueing()}
        key={team.name}
      />
    ));
    return <div>{teams}</div>;
  }
}

type TeamProps = {
  team: types.Team;
  active: boolean;
  deadline: number | undefined;
  startClueing: () => void;
};

class Team extends React.Component<TeamProps> {
  render() {
    const t = this.props.team;
    if (this.props.active) {
      return (
        <div className="teamRow active">
          <div className="teamDetails">
            <p className="teamName">{t.name}</p>

            {!!this.props.deadline && (
              <p className="countdown">
                <extras.Countdown deadline={this.props.deadline} />
              </p>
            )}
            {!this.props.deadline && (
              <p className="goButton">
                <button onClick={() => this.props.startClueing()}>
                  I'm the Cluemeister <i className="fa fa-arrow-right"></i>
                </button>
              </p>
            )}
          </div>
          <div className="teamScore">
            <p className="scoreNumber">{t.score}</p>
          </div>
        </div>
      );
    } else
      return (
        <div className="teamRow">
          <div className="teamDetails">
            <p className="teamName">{t.name}</p>
          </div>
          <div className="teamScore">
            <p className="scoreNumber">{t.score}</p>
          </div>
        </div>
      );
  }
}
// BOWL
class Bowl extends React.Component<{ words: number; remainingWords: number }> {
  render() {
    let bowl = bowl0;
    let bowlLabel = "bowlImage bowl0";
    let bowlFill = this.props.remainingWords / this.props.words;
    if (bowlFill > 0.8) {
      bowl = bowl100;
      bowlLabel = "bowlImage bowl100";
    } else if (bowlFill > 0.6) {
      bowl = bowl80;
      bowlLabel = "bowlImage bowl80";
    } else if (bowlFill > 0.4) {
      bowl = bowl60;
      bowlLabel = "bowlImage bowl60";
    } else if (bowlFill > 0.2) {
      bowl = bowl40;
      bowlLabel = "bowlImage bowl40";
    } else if (bowlFill > 0) {
      bowl = bowl20;
      bowlLabel = "bowlImage bowl20";
    } else {
      bowl = bowl0;
      bowlLabel = "bowlImage bowl0";
    }

    return (
      <div className="bowl">
        {/* <svg className="remainingWordsSVG">
          <text x="50%" y="90%" className="textFill">
            {this.props.remainingWords}
          </text>
          <text x="51%" y="91%" className="textStroke">
            {this.props.remainingWords}
          </text>
        </svg> */}

        {/* <p className="remainingWords">{this.props.remainingWords}</p> */}
        <div className={bowlLabel}>
          <img src={bowl} alt=""></img>
        </div>
        <div className="bowlDescription">{this.props.remainingWords} words left</div>
      </div>
    );
  }
}

type GuessProps = {
  serverState: types.MessageGameState;
  myUserID: string;
  submitGuess: (word: string) => void;
  endTurn: () => void;
};

type GuessState = {
  len: number;
  wordIdx: number; // index into array
};
// CLUEING WIDGET
class Guess extends React.Component<GuessProps, GuessState> {
  constructor(props: GuessProps) {
    super(props);

    this.state = {
      wordIdx: Math.floor(
        Math.random() * props.serverState.remainingWords.length
      ),
      len: props.serverState.remainingWords.length,
    };
  }

  static getDerivedStateFromProps(
    props: GuessProps,
    state: GuessState
  ): GuessState | null {
    if (state.len === props.serverState.remainingWords.length) {
      return null;
    }

    return {
      wordIdx: Math.floor(
        Math.random() * props.serverState.remainingWords.length
      ),
      len: props.serverState.remainingWords.length,
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
      return <div>{/* nothing */}</div>;
    }

    var cw = ss.remainingWords[this.state.wordIdx];
    if (ss.userGuessing === this.props.myUserID && !!ss.deadline) {
      return (
        <div className="clueWidget">
          <p className="clueWord">
            <ScaleText>{cw}</ScaleText>
          </p>

          <div className="cluemeisterButtons">

            <p className="buttonCorrect">
              <button onClick={() => this.guess(true)}>Got it!</button>
            </p>
            <p className="otherButtons">
              <p className="buttonGiveUp">
                <button onClick={() => this.props.endTurn()}>End my turn</button>
              </p>
              <p className="buttonWhoops">
                <button onClick={() => this.guess(false)}>
                  Oops, I cheated
              </button>
              </p>
            </p>

          </div>
        </div>
      );
    }
    return null;
  }
}

const WordLog: React.FunctionComponent<{ remainingWords: string[] }> = (props) => {
  const [prevRW, setPrevRW] = React.useState<string[]>([]);
  const [wordLog, setWordLog] = React.useState<string[]>([]);

  React.useEffect(() => {
    // arrays unchanged? continue
    if (prevRW.length === props.remainingWords.length && underscore.difference(props.remainingWords, prevRW).length === 0) {
      return;
    }

    var removed: string[];

    // we've rolled over turns
    if (props.remainingWords.length > prevRW.length) {
      removed = prevRW;
      setPrevRW(props.remainingWords);
    } else {
      removed = underscore.difference(prevRW, props.remainingWords);
    }
    setPrevRW(props.remainingWords);

    for (const word of removed) {
      setWordLog(wordLog.concat(word));
      window.setTimeout(() => {
        console.log("remove " + word);
        setWordLog(wordLog => underscore.without(wordLog, word));
      }, 5 * 1000);
    }

    return undefined;
  }, [prevRW, props.remainingWords, wordLog]);


  const words = wordLog.map((word) => <p className="guessedWord" key={word}>{word}</p>);
  return (
    <div className="recentlyGuessed">
      <p>Last word guessed:</p>

      {words}

    </div>
  );
};