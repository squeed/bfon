import React from "react";
import { validateLocaleAndSetLanguage } from "typescript";

import round1 from "./img/round1.svg";
import round2 from "./img/round2.svg";
import round3 from "./img/round3.svg";


import {LanguageContext} from "./Extras";




class Instructions extends React.Component {

    

    setLanguage = (l:string)=> {
        this.context.value = l;
        
    }

    
    render() {


            return (
                <LanguageContext.Provider value={this.context.value}>
                
                <div className="gameInstructions">
                    <div className="instructionsNav">
                    <div className="gameTitle heading--stroke heading--shadow"> <a href="../game" target="_blank">B.F.O.N.</a></div>
                        
                        {/* <div className="languages">
                            <ul>
                                <li>
                                    <a href="#" onClick={() => this.setLanguage("EN")}>EN</a>
                                </li>
                                <li>
                                    <a href="#" onClick={() => this.setLanguage("DE")}>DE</a>
                                </li>
                            </ul>
                        </div> */}
                    </div>
                    {this.context.value === "EN" && 
                    <div className="instructionsBody instructionsEN">
                    
                        <p>Bowl Full of Nouns (or, as we like to call it, BFON) is an online, remote-friendly, all-ages party game for 4+ people.</p>

                        <p>You'll need to set up a video call on your favorite platform (Google Meet, Zoom, etc.)</p><p> In addition,
                everybody needs a phone or other device that isn't being used for the video call.</p>

                        <hr>
                        </hr>
                        <h3>Playing the game</h3>
                        <h4>Create the game</h4>
                        <p>Click "Create New Game" to start.</p>
                        <h4>Create teams</h4>
                        <p>The person who created the game enters names for two or more teams.</p><p> Hint: we recommend typing the names of the people
                on each team as the team name, so people remember what team they are on. For example, "Mom Dave Grandpa."</p>
                        <h4>Get everyone to join</h4>
                        <p>A game name will appear (like "Pink Whale").</p><p> All players should go to <a href="http://bfon.club">http://bfon.club</a> and enter this
                name as the password.</p><p> Capitalization and spaces don't matter.</p>
                        <h4>Fill the bowl</h4>

                        <p>
                            Each player puts 5 nouns in the bowl.</p>
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
                                <li>
                                    Being complicated just to be tricky
                        <span className="example">&nbsp;(antique vase of pink tulips)</span>

                                </li>
                            </ul>
                        </div>

                        <h4>Guess the words</h4>


                        <p>
                            The game consists of 3 rounds. In each round, teams take turns
                trying to guess as many words as possible, earning 1 point for each word correctly guessed.</p>
                        <p>One team will turn <span className="pink">pink</span> – that means it's their turn to guess. One person in the team decides to be the "cluemeister" for this turn. The cluemeister clicks the button that says </p>

                        <p className="goButton">
                            <button>
                                I'm the Cluemeister <i className="fa fa-arrow-right"></i>
                            </button>
                        </p>

                        <p>The cluemeister will see words from the bowl in random order. She needs to help the rest of her team to guess as many
                        words as possible in 90 seconds.</p><p>There's a catch: she needs to follow different rules for each round.
            </p>
                        <ul className="roundDescriptions">
                            <li>
                                <p className="roundTitle">Round 1</p>
                                <img src={round1}></img>
                                <p>The cluemeister can say anything they want to help their teammates
                                guess the clue. They can't spell the word or rhyme it.
                    </p>
                                <p className="guessExample">
                                    <p className="guessExampleWord">Meatballs</p>
                                    <p className="guessExampleText">"This is a food that you can eat at IKEA."</p>
                                </p>
                            </li>
                            <li>
                                <p className="roundTitle">Round 2</p>
                                <img src={round2}></img>
                                <p>The cluemeister can only say ONE (1) word and can't make extra
                        noises or motions.</p>
                                <p className="guessExample">
                                    <p className="guessExampleWord">Meatballs</p>
                                    <p className="guessExampleText">"IKEA."</p>
                                </p>
                            </li>
                            <li>
                                <p className="roundTitle">Round 3</p>
                                <img src={round3}></img>
                                <p>The cluemeister can't say anything, but can make motions.</p>
                                <p className="guessExample">
                                    <p className="guessExampleWord">Meatballs</p>
                                    <p className="guessExampleText">[act out eating food, then act out assembling a chair]</p>
                                </p>
                            </li>

                        </ul>

                        <h4>Accidental cheating</h4>
                        <p>
                            Mistakes happen. If the cluemeister accidentally breaks the rules, she can click "Oops, I cheated" and she will get a new word.
            </p>

                        <h4>Giving up</h4>
                        <p>
                            You can't put words back. If the cluemeister's team doesn't get the word, too bad.</p><p> The cluemeister can
                            end her turn at any time by clicking "I give up", but the rest of the time on the clock is forfeited.
            </p>
                        <h4>Should we choose a different cluemeister for each turn?</h4>
                        <p>We think so. It's the most fun when everyone gets a turn to be the cluemeister.</p>
                        <h4>Words that don't make sense</h4>
                        <p>
                            There is no way to throw out words. Maybe we'll make that in a future version. For now, you have to work with what you got.
            </p>
                        <h4>End of round</h4>
                        <p>Each round is over when there are no more words in the bowl.</p>
                        <h4>Leftover time</h4>
                        <p>
                            If the round ends with time remaining on the clock, the team that was guessing
                            can start the new round using the time left.
            </p>
                        <h4>Scoring</h4>
                        <p>
                            Each correctly guessed noun is worth 1 point. The game corrects for
                            any unfairness in case one team got more play time than other teams.
            </p>
            <hr></hr>
            <h3>Credits</h3>
            <p>Written by <a href="http://caseyc.net">Casey</a> and <a href="http://molly.is">Molly</a> in December 2020. BFON is our way of helping everyone get through what we hope is the last gasp of the coronavirus pandemic.</p>
            <p>Thanks to playtesters Ame, Sergio, Ng&#7885;c, and Kelsey.</p>
            <p>Special thanks to Liz Weinbloom, who taught us this game, and WOFIGO, who made it an institution.</p>
                    </div>
    } 
    {this.context.value === "DE" && 
        <div className="instructionsBody instructionsEN">
                    
        <p>Bowl Full of Nouns (wir nennen es BFON) ist ein Online-Gesellschafts-Spiel für mindestens 4 Spieler.</p>

        <p>Du brauchst ein Videoanruf einzustellen (durch z.B. Zoom, Jitsi, Google Meet), darüber hinaus braucht jeder Spieler ein Gerät, meistens ein Handy, das nicht für den Videoanruf verwendet wird.</p>

        <hr>
        </hr>
        <h3>Spielregeln</h3>
        <h4>Neues Spiel erstellen</h4>
        <p>Click auf "Create New Game," um ein neues Spiel aufzustellen.</p>
        <h4>Teams zusammenstellen</h4>
        <p>The person who created the game enters names for two teams.</p><p> Hint: we recommend typing the names of the people
on each team as the team name, so people remember what team they are on. For example, "Mom Dave Grandpa."</p>
        <h4>Get everyone to join</h4>
        <p>A game name will appear (like "Pink Whale").</p><p> All players should go to <a href="http://bfon.club">http://bfon.club</a> and enter this
name as the password.</p><p> Capitalization and spaces don't matter.</p>
        <h4>Fill the bowl</h4>

        <p>
            Each player puts 5 nouns in the bowl.</p>
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
                <li>
                    Being complicated just to be tricky
        <span className="example">&nbsp;(antique vase of pink tulips)</span>

                </li>
            </ul>
        </div>

        <h4>Guess the words</h4>


        <p>
            The game consists of 3 rounds. In each round, teams take turns
trying to guess as many words as possible, earning 1 point for each word correctly guessed.</p>
        <p>One team will turn <span className="pink">pink</span> – that means it's their turn to guess. One person in the team decides to be the "cluemeister" for this turn. The cluemeister clicks the button that says </p>

        <p className="goButton">
            <button>
                I'm the Cluemeister <i className="fa fa-arrow-right"></i>
            </button>
        </p>

        <p>The cluemeister will see words from the bowl in random order. She needs to help the rest of her team to guess as many
        words as possible in 90 seconds.</p><p>There's a catch: she needs to follow different rules for each round.
</p>
        <ul className="roundDescriptions">
            <li>
                <p className="roundTitle">Round 1</p>
                <img src={round1}></img>
                <p>The cluemeister can say anything they want to help their teammates
                guess the clue. They can't spell the word or rhyme it.
    </p>
                <p className="guessExample">
                    <p className="guessExampleWord">Meatballs</p>
                    <p className="guessExampleText">"This is a food that you can eat at IKEA."</p>
                </p>
            </li>
            <li>
                <p className="roundTitle">Round 2</p>
                <img src={round2}></img>
                <p>The cluemeister can only say ONE (1) word and can't make extra
        noises or motions.</p>
                <p className="guessExample">
                    <p className="guessExampleWord">Meatballs</p>
                    <p className="guessExampleText">"IKEA."</p>
                </p>
            </li>
            <li>
                <p className="roundTitle">Round 3</p>
                <img src={round3}></img>
                <p>The cluemeister can't say anything, but can make motions.</p>
                <p className="guessExample">
                    <p className="guessExampleWord">Meatballs</p>
                    <p className="guessExampleText">[act out eating food, then act out assembling a chair]</p>
                </p>
            </li>

        </ul>

        <h4>Accidental cheating</h4>
        <p>
            Mistakes happen. If the cluemeister accidentally breaks the rules, she can click "Oops, I cheated" and she will get a new word.
</p>

        <h4>Giving up</h4>
        <p>
            You can't put words back. If the cluemeister's team doesn't get the word, too bad.</p><p> The cluemeister can
            end her turn at any time by clicking "I give up", but the rest of the time on the clock is forfeited.
</p>
        <h4>Should we choose a different cluemeister for each turn?</h4>
        <p>We think so. It's the most fun when everyone gets a turn to be the cluemeister.</p>
        <h4>Words that don't make sense</h4>
        <p>
            There is no way to throw out words. Maybe we'll make that in a future version. For now, you have to work with what you got.
</p>
        <h4>End of round</h4>
        <p>Each round is over when there are no more words in the bowl.</p>
        <h4>Leftover time</h4>
        <p>
            If the round ends with time remaining on the clock, the team that was guessing
            can start the new round using the time left.
</p>
        <h4>Scoring</h4>
        <p>
            Each correctly guessed noun is worth 1 point. The game corrects for
            any unfairness in case one team got more play time than other teams.
</p>
<hr></hr>
<h3>Credits</h3>
<p>Written by <a href="http://caseyc.net">Casey</a> and <a href="http://molly.is">Molly</a> in December 2020. BFON is our way of helping everyone get through (what we hope is) the last gasp of the coronavirus pandemic.</p>
<p>Thanks to playtesters Ame, Sergio, Ng&#7885;c, and Kelsey.</p>
<p>Special thanks to Liz Weinbloom, who taught us this game, and WOFIGO, who made it an institution.</p>
<p>BFON is free, forever. If you liked it, consider donating to <a href="https://sea-watch.org/en/">Sea Watch.</a></p>
    </div>
    }
                </div>





                </LanguageContext.Provider>
            )
            
            }
    
}

Instructions.contextType = LanguageContext;

export default Instructions;