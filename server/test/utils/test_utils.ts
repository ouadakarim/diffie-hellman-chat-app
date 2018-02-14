/**
 * Created by Karim Ouada on 19.12.2017.
 */
const WebSocket = require('ws');

const WEBSOCKET_URL = "ws://localhost:8080";

// List of websocket connections
let ws: any[] = [];

let getWebSocketConnections = () => {
    return ws;
};

let openWebSocketConnection = (id: string, next: any) =>{
    let url: string = WEBSOCKET_URL + "/?id=" + id;
    ws[id] = new WebSocket(url);
    ws[id].on('open', function open() {
        next();
    });
};

let closeWebSocketConnection = (id: string, next: any) => {
    if (ws[id] && ws[id].readyState == 1) ws[id].close();
    next();
};

export {
    getWebSocketConnections,
    openWebSocketConnection,
    closeWebSocketConnection
};