/* Do not change, this code is generated from Golang structs */


export enum MessageKind {
    gameState = "gameState",
    register = "register",
    joinGame = "joinGame",
    addTeam = "addTeam",
    addWord = "addWord",
    createGame = "createGame",
    invalidGame = "invalidGame",
    leaveGame = "leaveGame",
    startTurn = "startTurn",
    guess = "guess",
    startGame = "startGame",
}
export class Message {
    kind: MessageKind;
    data: string;

    static createFrom(source: any = {}) {
        return new Message(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.kind = source["kind"];
        this.data = source["data"];
    }
}
export class Team {
    name: string;
    score: number;

    static createFrom(source: any = {}) {
        return new Team(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.name = source["name"];
        this.score = source["score"];
    }
}
export class MessageGameState {
    name: string;
    ID: string;
    seqNumber: number;
    round: number;
    teams: Team[];
    currentTeam: number;
    words: string[];
    remainingWords: string[];
    userGuessing?: string;
    deadline?: number;
    timeRemaining?: number;

    static createFrom(source: any = {}) {
        return new MessageGameState(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.name = source["name"];
        this.ID = source["ID"];
        this.seqNumber = source["seqNumber"];
        this.round = source["round"];
        this.teams = this.convertValues(source["teams"], Team);
        this.currentTeam = source["currentTeam"];
        this.words = source["words"];
        this.remainingWords = source["remainingWords"];
        this.userGuessing = source["userGuessing"];
        this.deadline = source["deadline"];
        this.timeRemaining = source["timeRemaining"];
    }

	convertValues(a: any, classs: any, asMap: boolean = false): any {
	    if (!a) {
	        return a;
	    }
	    if (a.slice) {
	        return (a as any[]).map(elem => this.convertValues(elem, classs));
	    } else if ("object" === typeof a) {
	        if (asMap) {
	            for (const key of Object.keys(a)) {
	                a[key] = new classs(a[key]);
	            }
	            return a;
	        }
	        return new classs(a);
	    }
	    return a;
	}
}
export class MessageRegister {
    id: string;

    static createFrom(source: any = {}) {
        return new MessageRegister(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.id = source["id"];
    }
}
export class MessageJoinGame {
    gameName: string;

    static createFrom(source: any = {}) {
        return new MessageJoinGame(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.gameName = source["gameName"];
    }
}
export class MessageAddTeam {
    name: string;

    static createFrom(source: any = {}) {
        return new MessageAddTeam(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.name = source["name"];
    }
}
export class MessageAddWord {
    word: string;

    static createFrom(source: any = {}) {
        return new MessageAddWord(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.word = source["word"];
    }
}
export class MessageCreateGame {
    gameName: string;

    static createFrom(source: any = {}) {
        return new MessageCreateGame(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.gameName = source["gameName"];
    }
}
export class MessageInvalidGame {
    gameName: string;

    static createFrom(source: any = {}) {
        return new MessageInvalidGame(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.gameName = source["gameName"];
    }
}
export class MessageStartTurn {
    seqNumber: number;

    static createFrom(source: any = {}) {
        return new MessageStartTurn(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.seqNumber = source["seqNumber"];
    }
}
export class MessageGuess {
    seqNumber: number;
    word: string;

    static createFrom(source: any = {}) {
        return new MessageGuess(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.seqNumber = source["seqNumber"];
        this.word = source["word"];
    }
}