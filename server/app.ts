process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

app.use((req: any, res: any) => {
    res.send({ msg: "hello" });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({
    server: server
});

let ws = require("./routes/ws")(wss);

server.listen(8080, () => {
    console.log('Listening on %d', server.address().port);
});