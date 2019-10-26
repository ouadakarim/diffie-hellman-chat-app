import {getRandomDiffieHellmanKeys} from "../utils";
/**
 * Created by Karim Ouada on 12.12.2017.
 */

const uuidv4 = require('uuid/v4');
const caesar = require('caesar-encrypt');
const bigInt = require("big-integer");
const xor = require('buffer-xor');

module.exports = function (wss: any) {
    let connections: any = {};
    let secrets: any = {};
    let encryptions: any = {};

    function broadcastToUsers(id: any, message: any){
        for (let key in connections) {
            if (key !== id && connections.hasOwnProperty(key)
                        && secrets.hasOwnProperty(key)
                        && secrets[key].hasOwnProperty('s')) {
                let cipher = JSON.stringify(message);
                if(encryptions[key] === "cezar" && secrets.hasOwnProperty(key)){
                    cipher = caesar.encrypt(cipher, secrets[key].s % 256);
                }
                if(encryptions[key] === "xor" && secrets.hasOwnProperty(key)){
                    cipher = xorStringAndByte(cipher, secrets[key].s % 256);
                }
                connections[key].send(cipher);
            }
        }
    }

    function prepareMessage(id: any, data: any) {
        let text = data;
        if(encryptions[id] === "cezar"){
            text = caesar.decrypt(text, secrets[id].s % 256)
        }
        if(encryptions[id] === "xor"){
            text = xorStringAndByte(text, secrets[id].s % 256);
        }
        console.log("Decyphered text: " + text);
        return text;
    }

    function xorStringAndByte(str, byte) {
        const a = new Buffer(str);
        // Create a string of the length of the message
        const b = new Buffer(Array(a.length + 1)
                             .join(String.fromCharCode(byte % 256)));
        return xor(a, b).toString('utf8');
    }

    function handleError(conn: any, message: string){
        conn.send(JSON.stringify({
            success: false,
            err: message
        }))
    }

    function handleKeys(conn: any, id: any, data: any){
        return conn.send(JSON.stringify({
            p: secrets[id].p,
            g: secrets[id].g
        }));
    }

    function handleSecret(conn: any, id: any, data: any){
        let a: number = 0;
        try {
            a = parseInt(data.a)
        } catch (e) {
            return handleError(conn, "Secret should be a number.");
        }
        let s = bigInt(a).pow(secrets[id].b).mod(secrets[id].p);
        secrets[id].a = a;
        secrets[id].s = parseInt(s.toString());

        return conn.send(JSON.stringify({
            b: bigInt(secrets[id].g).pow(secrets[id].b).mod(secrets[id].p)
        }));
    }

    function handleEncryption(conn: any, id: any, data: any){
        let encryption = data.encryption;
        let allowedTypes = ["none", "xor", "cezar"];
        if(allowedTypes.indexOf(encryption) === -1){
            return handleError(conn, "Incorrect encryption type: '" + encryption + "'.");
        }
        encryptions[id] = encryption;
    }

    function handleMessage(conn: any, id: any, data: any){
        let message = prepareMessage(id, data);
        try {
            let msg_obj = JSON.parse(message);
            broadcastToUsers(id, msg_obj);
        } catch(e: any) {
            console.log(e);
        }
    }

    wss.on('connection', (conn: any, req: any) => {
        let id = uuidv4();
        connections[id] = conn;
        secrets[id] = getRandomDiffieHellmanKeys();

        conn.on('message', (msg: string) => {
            if(process.env.NODE_ENV === 'development') console.log('received: %s', msg);
            let data: any = {};
            try {
                data = JSON.parse(msg);
            } catch (e) {
                // return handleError(conn, "Incorrect message format. Must be JSON.");
                handleMessage(conn, id, msg);
            }

            if(data.request && data.request === "keys"){
                handleKeys(conn, id, data);
            }
            if(data.a){
                handleSecret(conn, id, data);
            }
            if(data.encryption){
                handleEncryption(conn, id, data);
            }
            if(data.msg && data.from){
                handleMessage(conn, id, JSON.stringify(data));
            }
        });

        conn.on('close', (msg: string) => {
            delete connections[id];
            delete secrets[id];
            delete encryptions[id];
        });
    });

    return this;
};
