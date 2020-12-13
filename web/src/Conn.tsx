import * as Cookies from 'js-cookie';
import uuid from 'uuid-random';

const COOKIE_NAME = "ID";

type NewStateFunc = (state: any) => void;

export class Connection {
    ws: WebSocket;
    id: string;
    onNewState: NewStateFunc;
    onConnect: () => void;

    constructor(url: string, onConnected: () => void,  onNewState: NewStateFunc) {
        this.id = getID();
        this.onNewState = onNewState;
        this.ws = new WebSocket(url);
        this.ws.onmessage = (e) => this.onMessage(e);
        this.ws.onopen = (e) => this.handleConnection();
        this.onConnect = onConnected;
    }

    handleConnection() {
        this.sendCommand("register", {id: this.id});
        if (!!this.onConnect) {
            this.onConnect();
        }
    }

    

    public sendCommand(kind: String, data: any) {
        const cmd = {
            kind: kind,
            data: data,
        };
        console.log("sending command", cmd);
        this.ws.send(JSON.stringify(cmd));
    }

    onMessage(evt: MessageEvent<string>) {
        console.log("got message", evt.data);
        const response = JSON.parse(evt.data);
        if (! response.kind || !response.data) {
            console.log("invalid message");
        }

        if (response.kind === "gameState") {
            this.onNewState(response.data);
        }
    }
}

function getID(): string {
    var id = Cookies.get(COOKIE_NAME);
    if (!id) {
        id = uuid();
        console.log("generated id", id);
        Cookies.set(COOKIE_NAME, id, { expires: 7 });
    } else {
        console.log("using existing id", id);
    }

    return id;
};