/**
 * Created by Karim Ouada on 19.12.2017.
 */
process.env.NODE_ENV = 'test';
import 'mocha';
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();
chai.use(chaiHttp);

import {getWebSocketConnections, openWebSocketConnection, closeWebSocketConnection} from './utils/test_utils'

let wsClientKey1 = "client1";
let wsClientKey2 = "client2";

describe('Client and server interaction', () => {
    afterEach((done: any) => {
        closeWebSocketConnection(wsClientKey1, () => {
            closeWebSocketConnection(wsClientKey2, () => {
                done();
            })
        })
    });

    describe('request keys by client', () => {
        it('should return an object with p and g', (done: any) => {
            openWebSocketConnection(wsClientKey1, () => {
                let ws = getWebSocketConnections();

                ws[wsClientKey1].on('message', (res: any) => {
                    let resObj = JSON.parse(res);
                    resObj.should.have.property('p');
                    resObj.should.have.property('g');
                    done();
                });

                ws[wsClientKey1].send(JSON.stringify({
                    request: "keys"
                }));
            });
        });
    });

    describe('send a as client', () => {
        it('should return an object with b parameter', (done: any) => {
            openWebSocketConnection(wsClientKey1, () => {
                let ws = getWebSocketConnections();

                ws[wsClientKey1].on('message', (res: any) => {
                    let resObj = JSON.parse(res);
                    resObj.should.have.property('b');
                    done();
                });

                ws[wsClientKey1].send(JSON.stringify({
                    a: 7
                }));
            });
        });
    });

    describe('send a message as a client when another is logged in', () => {
        it('should send the message to the second client', (done: any) => {
            openWebSocketConnection(wsClientKey1, () => {
                openWebSocketConnection(wsClientKey2, () => {
                    let ws = getWebSocketConnections();
                    ws[wsClientKey1].send(JSON.stringify({request: 'keys'}));
                    ws[wsClientKey2].send(JSON.stringify({request: 'keys'}));
                    ws[wsClientKey1].send(JSON.stringify({a: 5}));
                    ws[wsClientKey2].send(JSON.stringify({a: 5}));

                    let message = {
                        msg: new Buffer("hello").toString('base64'),
                        from: "John"
                    };

                    ws[wsClientKey2].on('message', (res: any) => {
                        let resObj = JSON.parse(res);
                        // Filter other requests
                        if(resObj.hasOwnProperty('msg')){
                            resObj.should.have.property('msg').eql(message.msg);
                            resObj.should.have.property('from').eql(message.from);
                            done();
                        }
                    });
                    setTimeout(() => {
                        ws[wsClientKey1].send(JSON.stringify(message));
                    }, 100);
                });
            });
        });
    });
});