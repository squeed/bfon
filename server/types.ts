/* Do not change, this code is generated from Golang structs */


export enum MessageKind {
    register = "register",
    gameState = "gameState",
    leaveGame = "leaveGame",
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
export class Player {
    id: string;
    mark: string;

    static createFrom(source: any = {}) {
        return new Player(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.id = source["id"];
        this.mark = source["mark"];
    }
}
export class MessageGameState {
    players: Player[];
    board: string[];
    step: number;
    nextPlayer: string;

    static createFrom(source: any = {}) {
        return new MessageGameState(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.players = this.convertValues(source["players"], Player);
        this.board = source["board"];
        this.step = source["step"];
        this.nextPlayer = source["nextPlayer"];
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