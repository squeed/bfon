import React from "react";


class Instructions extends React.Component {
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

export default Instructions;