import * as types from "./Types";
import React from "react";

export class Countdown extends React.Component<{deadline: number}> {
    render() {
        return (
            <p>
                4:20 remaining
            </p>
        );
    }
}

export class GameNav extends React.Component<
    { gameName: string },
    { showSettings: boolean }
    > {
    constructor(props: { gameName: string }) {
        super(props);
        this.state = { showSettings: false };
    }

    toggleSettings() {
        this.setState({ showSettings: !this.state.showSettings });
    }

    render() {
        return (
            <div className="gameNav">
                <p className="gameTitle"> Bowl Full of Nouns</p>
                <p className="gameName">{this.props.gameName} <span className="gameSettings">
                    <i className="fa fa-cog" onClick={() => this.toggleSettings()}></i>
                    {this.state.showSettings && <GameMenu />}
                </span>
                </p>
                
            </div>
        );
    }
}

class GameMenu extends React.Component {
    render() {
        return (
            <div className="gameMenu">
                <ul>
                    <li>
                        <a href="">Reset Round</a>
                    </li>
                    <li>
                        <a href="">End Game</a>
                    </li>
                </ul>
            </div>
        );
    }
}



export class Instructions extends React.Component {
    render() {
        return (
            <div>
                <div className="gameInstructions">
                    <p>
                        Everybody puts some nouns in the bowl. Proper nouns are okay (Billie
                        Eilish, Nigeria, Zeus). Noun phrases are okay as long as they
                        usually belong together (sauvignon blanc, dumpster fire, taxi
                        driver). Being complicated just to be tricky is not okay (silver
                        pickle fork, sleeping tomcat, left sock).
          </p>
                    <p>Players are divided into teams.</p>
                    <p>
                        The game consists of 3 rounds. In each round, teams take turns
                        appointing a cluemeister to help them guess words. The cluemeister
                        draws nouns from the bowl and attempts to get the rest of their team
                        to guess as many nouns as possible in a limited time. When the bowl
                        is empty, the round is over.
          </p>
                    <dl>
                        <dt>Round 1</dt>
                        <dd>
                            The cluemeister can say anything they want to help their teammates
                            guess the clue.
            </dd>
                        <dt>Round 2</dt>
                        <dd>
                            The cluemeister can only say ONE (1) word and can't make extra
                            noises or motions.
            </dd>
                        <dt>Round 3</dt>
                        <dd>The cluemeister can't say anything, but can make motions.</dd>
                    </dl>
                    <h3>Giving up</h3>
                    <p>
                        There is no "passing." If the cluemeister gives up, the team's turn
                        is over.
          </p>
                    <h3>Leftover time</h3>
                    <p>
                        If a team ends a round with time still on the clock, that team
                        begins the next round with a shortened turn. Their remaining time
                        carries over to the next round.
          </p>
                    <h3>Scoring</h3>
                    <p>
                        Each correctly guessed noun is worth 1 point. The game corrects for
                        any unfairness in case one team got more play time than other teams.
          </p>
                </div>
            </div>
        );
    }
}
