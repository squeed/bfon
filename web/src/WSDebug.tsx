import React from "react";
type WSProps = {
    ws: WebSocket
};

type WSState = {
    messages: string[]
};

export class WSDebug extends React.Component<WSProps, WSState> {
    inputRef = React.createRef<HTMLInputElement>();

    state: WSState = {
        messages: [],
    };

    public componentDidMount() {
        console.log("mount");
       /* 
        this.ws.onmessage = (evt: MessageEvent<string>) => {
            console.log("message!", evt);
            this.setState({
                messages: this.state.messages.concat([evt.data]),
            });
        }; */
    }

    sendmessage(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const node = this.inputRef.current;
        if (node) {
            this.props.ws.send(node.value);
        }
    }

    render() {
        const messages = this.state.messages.map((msg) => <li>{msg}</li>);
        return (
            <div>
                <ul>
                    {messages}
                </ul>
                <form onSubmit={(e) => this.sendmessage(e)}>
                    <label>
                        message:
            <input type="text" ref={this.inputRef} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        );
    }
}