//import * as types from "./Types";
import React from "react";
import Modal from 'react-modal';

Modal.setAppElement("#root");


type CountdownProps = { deadline: number };
type CountdownState = { secondsLeft: number };
export class Countdown extends React.Component<CountdownProps, CountdownState> {
    timerID: number | undefined;

    constructor(props: CountdownProps) {
        super(props);

        this.state = { secondsLeft: this.secondsLeft(props.deadline) };
    }

    secondsLeft(deadline: number): number {
        const dl = Math.floor(deadline - Date.now() / 1000);
        if (dl < 0) {
            return 0;
        }
        return dl;
    }

    tick() {
        this.setState((state, props) => ({
            secondsLeft: this.secondsLeft(props.deadline),
        }));
    }

    componentDidMount() {
        this.timerID = window.setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        window.clearInterval(this.timerID);
    }

    render() {
        function time_convert(num: number) {
            var hours = Math.floor(num / 60);
            var minutes = num % 60;
            return hours + ":" + minutes;
        }
        var timeHM = time_convert(this.state.secondsLeft);

        return <div className="timer">{timeHM}</div>;
    }
}

export class GameNav extends React.Component<
    { gameName: string, leaveGame: () => void },
    { showSettings: boolean }
    > {
    constructor(props: { gameName: string, leaveGame: () => void }) {
        super(props);
        this.state = { showSettings: false };
    }

    toggleSettings() {
        this.setState({ showSettings: !this.state.showSettings });
    }

    render() {
        return (
            <div className="gameNav">
                <p className="gameTitle heading--stroke heading--shadow"> B.F.O.N.</p>
                <div className="gameName" onClick={() => this.toggleSettings()}>{this.props.gameName}
                    <span className="gameSettings">
                        <i className="fa fa-angle-down" ></i>
                    </span>
                    {this.state.showSettings && <GameMenu leaveGame={() => this.props.leaveGame()} />}
                </div>

            </div>
        );
    }
}

class GameMenu extends React.Component<{ leaveGame: () => void }> {
    render() {
        return (
            <div className="gameMenu">
                <ul>
                    <li>
                        <a href="#">Reset Round</a>
                    </li>
                    <li>
                        <a href="#" onClick={() => this.props.leaveGame()}>Leave Game</a>
                    </li>
                    <li>
                        <a href="#">End Game for All</a>
                    </li>
                </ul>
            </div>
        );
    }
}

export class Footer extends React.Component<{}, {
    showInstructions: boolean;
}> {
    constructor(props: {}) {
        super(props);
        this.state = { showInstructions: false };
    }

    setShowInstructions(show: boolean): boolean {
        this.setState({
            showInstructions: show,
        });
        return false;
    }

    render() {
        return (
            <div className="launchFooter">
                <p>
                    <a href="#" className="gameInstructions" onClick={() => this.setShowInstructions(true)} >How to Play</a>

                    <Modal
                        isOpen={this.state.showInstructions}
                        onRequestClose={() => this.setShowInstructions(false)}
                        contentLabel="Instructions"
                    >
                        <a href="#" className="gameInstructions closeX" onClick={() => this.setShowInstructions(false)}><i className="fa fa-times"></i></a>
                        <Instructions />

                    </Modal>
                </p>
                <p className="credits">
                    By <a href="http://molly.is">Molly</a> and{" "}
                    <a href="http://caseyc.net">Casey</a>, Christmas 2020
            </p>
            </div>
        );
    }
}


export class Instructions extends React.Component {
    render() {
        return (
            <div>
                <div className="gameInstructions modalBody">

                    <p>Bowl Full of Nouns is an online, remote-friendly party game for 4+ people.</p>

                    <p>Every location taking part needs 1 device for a video call (Zoom, Google Meet, etc.), as well at least 1 phone that isn't being used for the video call.</p>

                    <hr></hr>
                    <h3>Playing the game</h3>
                    <h4>Create teams</h4>
                    <p>The person who created the game divides the players into teams. Try not to put couples together; they know too much. We recommend a maximum of 4 teams.</p>
                    <h4>Fill the bowl</h4>

                    <p>
                        Each player puts 3-5 nouns in the bowl.</p>
                    <div className="yes">
                        <ul>
                            <li>
                                Proper nouns
    <span className="example">&nbsp;(Billie Eilish, Nigeria)</span>
                            </li>
                            <li>
                                Noun phrases
    <span className="example">&nbsp;(cabernet sauvignon, bus driver)</span>

                            </li>
                        </ul>
                    </div>
                    <div className="no">
                        <ul>
                            <li>
                                Boring words
    <span className="example">&nbsp;(chair, tv, phone)</span>

                            </li>
                        </ul>
                    </div>

                    <h4>Guess the words</h4>


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
                            guess the clue. They can't spell the word or rhyme it.
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
