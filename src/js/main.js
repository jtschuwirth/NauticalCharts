
const game = require("./game.js");
var React = require('react');
var ReactDOM = require('react-dom');
const { io } = require("socket.io-client");


const SERVER = "http://localhost:8000"
//const SERVER = "https://jtschuwirth.xyz"

const socket = io(SERVER, {  
    cors: {
    origin: SERVER,
    credentials: true
  },transports : ['websocket'] });


//Funcion de inicializacion de la pagina
const initialize = () => {
    ReactDOM.render(
        <PlayButton userAddress = {"Address"} />,
        document.getElementById('playButton')
    );
}

const foundGame = (id) => {
    ReactDOM.render(
        <game.Game gameId={id}/>,
        document.getElementById('game')
    );
    ReactDOM.render(
        <QuitButton userAddress = {"Address"}/>,
        document.getElementById('quitButton')
    );
}

class PlayButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showButton: true,
        };
    }
    searchGame() {
        socket.on("connect", () => {
        });
        socket.emit("enter", this.props.userAddress);
        socket.on("statusQueue", (data) => {
            if (this.props.userAddress == data.players[0]) {
                const id = "idx"+data.players[0]
                socket.emit("foundGame", {players: data.players})
                foundGame(id)
                this.setState({showButton: false});
            }
        });
    }
    render() {
        if (this.state.showButton == true) {
            return (
                <div class="center">
                    <button onClick={ () => this.searchGame()}>Play!</button>
                </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    }
}

class QuitButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showButton: true,
        };
    }

    quitGame() {
    }

    render() {
        if (this.state.showButton == true) {
            return (
                <div class="center">
                    <button onClick={ () => this.quitGame()}>Quit</button>
                </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    }
}

window.addEventListener('DOMContentLoaded', initialize);