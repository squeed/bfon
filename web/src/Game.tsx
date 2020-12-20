import "./styles/Game.scss";
import bowl from './img/bowl.svg';

import * as types from "./Types";
import React from "react";

import * as extras from "./Extras";



type GameProps = {
    serverState: types.MessageGameState;
    addWord: (word: string) => void;
  };
  
  class Game extends React.Component<GameProps> {
    render() {
      const ss = this.props.serverState;
      
      return (
        <div id="game">
          <extras.GameHeader gameName={ss.name} />
          {
            ss.round === -1 &&
            <div>Team picker goes here</div>
          }
          {
            ss.round <= 0 &&
            <WordList words={ss.words} addWord={this.props.addWord} />
          }
          {
            ss.round > 0 && ss.round <= 4 &&
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

  export default Game;
  
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