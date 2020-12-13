/* Do not change, this code is generated from Golang structs */


export enum MessageKind {
    register = "register",
    joinGame = "joinGame",
    createGame = "createGame",
    invalidGame = "invalidGame",
    gameState = "gameState",
    leaveGame = "leaveGame",
    addWord = "addWord",
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
    id: string;
    name: string;
    score: number;

    static createFrom(source: any = {}) {
        return new Team(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.id = source["id"];
        this.name = source["name"];
        this.score = source["score"];
    }
}
export class MessageGameState {
    name: string;
    ID: string;
    round: number;
    teams: Team[];
    currentTeam: number;
    words: string[];
    remainingWords: string[];
    deadline?: number;

    static createFrom(source: any = {}) {
        return new MessageGameState(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.name = source["name"];
        this.ID = source["ID"];
        this.round = source["round"];
        this.teams = this.convertValues(source["teams"], Team);
        this.currentTeam = source["currentTeam"];
        this.words = source["words"];
        this.remainingWords = source["remainingWords"];
        this.deadline = source["deadline"];
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