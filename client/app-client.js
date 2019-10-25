// app-client.js
import React, { Component } from 'react'
import { render } from 'react-dom'
import uuid from 'node-uuid'
import S from 'shorti'
import _ from 'lodash'
import { Input, DropdownButton, MenuItem } from 'react-bootstrap'
import { encrypt as caesarEncrypt, decrypt as caesarDecrypt } from 'caesar-encrypt'
import xor from 'buffer-xor'
import bigInt from 'big-integer';

const SERVER_URL = process.env.SERVER_URL || "localhost:8080";

class App extends Component {

  constructor() {
    super();
    this.state = {
      data: {
        encryption: 'none',
        messages: []
      }
    }
  }

  componentDidMount() {
    this.socket = new WebSocket(`ws://${SERVER_URL}`);
    this.socket.onopen = () => this.onSocketOpen();
    this.socket.onmessage = (msg) => this.onSocketMessage(msg);
    this.socket.onclose = () => this.onSocketClose();
  }

  componentDidUpdate() {
    // Set focus on message input
    if (this.refs.message)
      this.refs.message.refs.input.focus();
    // Navigate to most recent message
    if (this.refs.messages_scroll_area)
      this.refs.messages_scroll_area.scrollTop = this.refs.messages_scroll_area.scrollHeight
  }

  onSocketOpen() {
    console.log('Connection with server established!')
  }

  onSocketMessage(message) {
    try {
      const decoded = JSON.parse(message.data);
      if (decoded.p)
        this.state.data.p = parseInt(decoded.p, 10);
      if (decoded.g)
        this.state.data.g = parseInt(decoded.g, 10);
      if (decoded.b) {
        this.state.data.b = parseInt(decoded.b, 10);
        this.state.data.s = bigInt(this.state.data.b).pow(this.state.data.a).mod(this.state.data.p);
      }
      if (decoded.msg) {
        const msg = new Buffer(decoded.msg, 'base64').toString('utf8');
        this.addMessageToBrowser(decoded.from, msg);
      }
    } catch (e) {
      let text = message.data;
      if (this.state.data.encryption === 'xor')
        text = this.xorStringAndByte(text, this.state.data.s % 256);
      else if (this.state.data.encryption === 'cezar')
        text = caesarDecrypt(text, this.state.data.s % 256);
      try {
        const decoded = JSON.parse(text);
        const msg = new Buffer(decoded.msg, 'base64').toString('utf8');
        this.addMessageToBrowser(decoded.from, msg);
      } catch (e2) {
        console.log(e2);
      }
    }
  }

  onSocketClose() {
  }

  setAuthor() {
    const author = this.refs.author.refs.input.value.trim();
    if (!author) return;
    this.refs.author.refs.input.value = '';
    const data = this.state.data;
    data.author = author;
    this.setState({
      data
    });
    this.sendMessage(JSON.stringify({ request: 'keys' }));
  }

  setSecret() {
    const secret = parseInt(this.refs.secret.refs.input.value, 10);
    if (!secret) return;
    this.refs.secret.refs.input.value = '';
    const data = this.state.data;
    data.a = secret;
    this.setState({
      data
    });
    this.sendMessage(JSON.stringify({
      a: bigInt(this.state.data.g).pow(secret).mod(this.state.data.p)
    }));
  }

  static getFormInput(data) {
    let form_input;
    if (!data.author) {
      form_input = (
          <div>
              Hi, what is your name?<br />
              <Input type="text" ref="author" />
          </div>
      )
    } else if (!data.a) {
      form_input = (
          <div>
              Please enter a secret number (1-999):<br />
              <Input type="number" ref="secret" min="1" max="999"/>
          </div>
      )
    } else {
      form_input = (
          <div>
              Hello { data.author }, type a message:<br />
              <Input type="text" ref="message" />
          </div>
      )
    }
    return form_input;
  }

  xorStringAndByte(str, byte) {
    const a = new Buffer(str);
    // Create a string of the length of the message
    const b = new Buffer(Array(a.length + 1)
                         .join(String.fromCharCode(byte % 256)));
    return xor(a, b).toString('utf8');
  }

  sendMessage(data) {
    this.socket.send(data);
  }

  createMessage() {
    const data = this.state.data;
    const message_text = this.refs.message.refs.input.value.trim();
    if (!message_text)
      return;
    const message_emit = {
      msg: new Buffer(message_text).toString('base64'),
      from: data.author
    };
    let encryption_result = JSON.stringify(message_emit);
    if (this.state.data.encryption === 'xor')
      encryption_result = this.xorStringAndByte(encryption_result, this.state.data.s);
    if (this.state.data.encryption === 'cezar')
      encryption_result = caesarEncrypt(encryption_result, this.state.data.s % 256);
    // Send message out
    this.sendMessage(encryption_result);
    this.addMessageToBrowser(data.author, message_text);
    this.refs.message.refs.input.value = ''
  }

  addMessageToBrowser(author, message) {
    const data = this.state.data;
    const messages = data.messages;
    // Render to browser
    const message_browser = {
      _id: uuid.v1(),
      author,
      message
    };
    messages.push(message_browser);
    data.messages = messages;
    this.setState({
      data
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const data = this.state.data;
    if (!data.author)
      this.setAuthor();
    else if (!data.a)
      this.setSecret();
    else
      this.createMessage();
  }

  handleSelect(evt, evtKey) {
    const data = this.state.data;
    switch (evtKey) {
      case '2':
        data.encryption = 'xor';
        break;
      case '3':
        data.encryption = 'cezar';
        break;
      default:
        data.encryption = 'none';
        break;
    }
    this.sendMessage(JSON.stringify({ encryption: data.encryption }));
    this.setState({
      data
    });
  }

  render() {
    const data = this.state.data;
    const form_input = App.getFormInput(data);

    const messages = data.messages;
    let messages_list;
    if (messages) {
      // order by created
      const sorted_messages = _.sortBy(messages, message => {
        return message.created
      });
      messages_list = sorted_messages.map(message_object => {
        if (message_object) {
          return (
            <li style={ { listStyle: 'none', ...S('mb-5') } } key={ message_object._id }>
              <b>{ message_object.author }</b><br/>
              { message_object.message }
            </li>
          )
        }
      })
    }
    const scroll_area_style = {
      ...S('h-' + (window.innerHeight - 220)),
      overflowY: 'scroll'
    };
    return (
      <div>
        <div style={ S('pl-15 mb-15') }>
          <h2>Diffie-Hellman Chat App</h2>
          <div>
              <h5>Selected encryption type: <b>{ data.encryption }</b></h5>
             <DropdownButton id="encryption" title="Encryption type"
               ref="encryption" onSelect={this.handleSelect.bind(this)}
             >
               <MenuItem eventKey="1">None</MenuItem>
               <MenuItem eventKey="2">XOR</MenuItem>
               <MenuItem eventKey="3">Caesar</MenuItem>
             </DropdownButton>
          </div>
        </div>
        <div style={ S('pl-15') }>
          <div ref="messages_scroll_area" style={ scroll_area_style }>
            <ul style={ S('p-0') }>{ messages_list }</ul>
          </div>
        </div>
        <div style={ S('absolute b-0 w-100p pl-15 pr-15') }>
          <form onSubmit={ this.handleSubmit.bind(this) }>
            { form_input }
          </form>
        </div>
      </div>
    )
  }
}
const app = document.getElementById('app');
render(<App />, app);
