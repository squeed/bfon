//import * as types from "./Types";
import React from "react";
import Modal from 'react-modal';

Modal.setAppElement("#root");

export const LanguageContext = React.createContext({value: "EN"});


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
            const minutes = Math.floor(num / 60);
            const seconds = num % 60;
            var seconds_padded = "" + seconds;
            if (seconds < 10) {
                seconds_padded = "0" + seconds_padded;
            }

            return minutes + ":" + seconds_padded;
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
                <p className="gameTitle heading--stroke heading--shadow"> <a href="../instructions" target="_blank">B.F.O.N.</a></p>
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
                    <a href="../instructions.html" className="gameInstructions" >How to Play</a>

                    {/* <a href="#" className="gameInstructions" onClick={() => this.setShowInstructions(true)} >How to Play</a>

                    <Modal
                        isOpen={this.state.showInstructions}
                        onRequestClose={() => this.setShowInstructions(false)}
                        contentLabel="Instructions"
                    >
                        <a href="#" className="gameInstructions closeX" onClick={() => this.setShowInstructions(false)}><i className="fa fa-times"></i></a>
                        <Instructions />

                    </Modal> */}
                </p>
                <p className="credits">
                    By <a href="http://molly.is">Molly</a> and{" "}
                    <a href="http://caseyc.net">Casey</a>, Christmas 2020
            </p>
            </div>
        );
    }
}