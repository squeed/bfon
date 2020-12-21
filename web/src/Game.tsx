import "./styles/Game.scss";
import bowl0 from "./img/bowl0.svg";
import bowl20 from "./img/bowl20.svg";
import bowl40 from "./img/bowl40.svg";
import bowl60 from "./img/bowl60.svg";
import bowl80 from "./img/bowl80.svg";
import bowl100 from "./img/bowl100.svg";

import * as types from "./Types";
import React from "react";

import ScaleText from "react-scale-text";

import * as extras from "./Extras";
import { isTemplateMiddleOrTemplateTail, NodeBuilderFlags } from "typescript";

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
        <extras.GameNav gameName={ss.name} />

        {ss.round === 0 && (
          <div>
            <TeamList serverState={ss} addTeam={this.props.addTeam} iAmClueing={false} startClueing={()=>{return;}} />
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
            <TeamList 
              serverState={ss} 
              addTeam={this.props.addTeam} 
              iAmClueing={this.props.myUserID === ss.userGuessing}
              startClueing={() => this.props.startGuessing()}
            />
            <Guess
              serverState={ss}
              myUserID={this.props.myUserID}
              submitGuess={(c) => this.props.guess(c)}

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
            <TeamList serverState={ss} addTeam={(w) => undefined} iAmClueing={false} startClueing={()=>{return;}} />
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
  iAmClueing: boolean;
  startClueing: ()=>void;
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

    if (this.props.iAmClueing){
      const team = ss.teams[ss.currentTeam]
      return (
        <Team
        team={team}
        active={true}
        deadline={ss.deadline}
        startClueing={()=>this.props.startClueing()}
        key={team.name}
      />
      )
    }

    const teams = ss.teams.map((team, index) => (
      <Team
        team={team}
        active={ss.round > 0 && ss.round < 3 && index === ss.currentTeam}
        deadline={ss.deadline}
        startClueing={()=>this.props.startClueing()}
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

type TeamProps = { 
  team: types.Team; 
  active: boolean;
  deadline: number | undefined;
  startClueing: ()=>void;
};

class Team extends React.Component<TeamProps> {
  render() {
    const t = this.props.team;
    if(this.props.active){
      return (
      <div className="teamRow active"> 
        <div className="teamDetails">
        <p className="teamName">{t.name} </p>
        
        {!!this.props.deadline && <p className="countdown"><extras.Countdown deadline={this.props.deadline} /></p>}
        {!this.props.deadline && <p className="goButton"><button onClick={()=>this.props.startClueing()}>I'm the Cluemeister <i className="fa fa-arrow-right"></i></button></p>}
        
        </div>
        
        {/* {this.props.active && <div>Yer' Up</div>} */}
        
        <p className="teamScore"> <p className="scoreNumber">{t.score}</p></p>
      </div>
      )
    } else
    return (
      <div className="teamRow"> 
        <div className="teamDetails"><p className="teamName">{t.name}</p></div>
        <p className="teamScore"> <p className="scoreNumber">{t.score}</p></p>
      </div>
    );
  }
}
// BOWL
class Bowl extends React.Component<{ words: number; remainingWords: number }> {
  render() {
    let bowl = bowl0;
    let bowlLabel = "bowlImage bowl0";
    let bowlFill = this.props.remainingWords/this.props.words;
    if (bowlFill > .8){
        bowl = bowl100;
        bowlLabel = "bowlImage bowl100";
    } else if (bowlFill > .6){
        bowl = bowl80;
        bowlLabel = "bowlImage bowl80";
    } else if (bowlFill > .4){
        bowl = bowl60;
        bowlLabel = "bowlImage bowl60";
    } else if (bowlFill > .2){
        bowl = bowl40;
        bowlLabel = "bowlImage bowl40";
    } else if (bowlFill > 0) {
      bowl = bowl20;
      bowlLabel = "bowlImage bowl20";
    } else if (bowlFill == 0) {
      bowl = bowl0;
      bowlLabel = "bowlImage bowl0";
    }
    console.log(bowlFill);

    const textStyle = {
      color: "#ffffff",
      fontSize: "30px"
    }

    return (
      <div className="bowl">
        <svg className="remainingWordsSVG">
        <text x="50%" y="90%" className="textFill" >{this.props.remainingWords}</text>
        <text x="51%" y="91%" className="textStroke">{this.props.remainingWords}</text>
        </svg>
        
        {/* <p className="remainingWords">{this.props.remainingWords}</p> */}
        <div className={bowlLabel}>
          <img src={bowl} alt=""></img>
          </div>
      </div>
    );
  }
}

type GuessProps = {
  serverState: types.MessageGameState;
  myUserID: string;
  submitGuess: (word: string) => void;
};

type GuessState = {
  len: number;
  wordIdx: number; // index into array
};
// CLUEING WIDGET
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
          {/* nothing */}
        </div>
      );
    }

   
    var cw = ss.remainingWords[this.state.wordIdx];
    if (ss.userGuessing === this.props.myUserID && !!ss.deadline) {
      return (
        <div className="clueWidget">
          <p className="clueWord">
            <ScaleText>{cw}</ScaleText>
            
            
            </p>
          <p className="buttonCorrect"><button onClick={() => this.guess(true)}>Got it!</button></p>
          <div className="otherButtons">
          <p className="buttonWhoops"><button onClick={() => this.guess(false)}>Whoops, bad clue</button></p>
          <p className="buttonGiveUp"><button>I give up</button></p>
          </div>
          
          
        </div>
      );
    }
    return null;
  }
}