//comando para compilar
//gulp
//para correr la pagina en localhost
//npm run dev


var React = require('react');
var ReactDOM = require('react-dom');
const { io } = require("socket.io-client");

import { HexGrid, Layout, Hexagon, Text, Pattern, Path, Hex } from 'react-hexgrid';







//const SERVER = "http://localhost:8000"
const SERVER = "https://jtschuwirth.xyz"

const socket = io(SERVER, {  
    cors: {
    origin: SERVER,
    credentials: true},
    transports : ['websocket'],
    reconnect: true,
    });

const foundGame = (id, userAddress, size) => {
    ReactDOM.render(
        <Game gameId={id} userAddress={userAddress} size={size}/>,
        document.getElementById('game')
    );

}


class PlayButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showQueue: true,
            inQueue: false,
            errorlog: null,
        };
    }
    componentDidMount() {
        socket.on('connect', function() {
        });
        socket.emit("on", {userAddress: this.props.userAddress})

    }

    joinQueue(queueSize) {  
        socket.emit("enter"+queueSize.toString(), this.props.userAddress);
        this.setState({inQueue: true});
        socket.on("statusQueue"+queueSize.toString(), (data) => {
            for (let i=0; i<data.players.length; i++) {
                if (this.props.userAddress == data.players[i]) {
                    const id = data.lastId+1;
                    socket.emit("foundGame"+queueSize.toString(), {id: id, player: data.players[i], players: data.players})
                    foundGame(id, this.props.userAddress, data.boardSize)
                    this.setState({showQueue: false});
                    this.setState({inQueue: false});
                }
            }
        });
    }
    cancelQueue() {
        socket.emit("out1", this.props.userAddress);
        socket.emit("out2", this.props.userAddress);
        socket.emit("out3", this.props.userAddress);
        socket.emit("out4", this.props.userAddress);
        this.setState({inQueue: false});
    }
    render() {
        if (this.state.showQueue == true) {
            if (this.state.inQueue == false) {
                return (
                    <div >
                        <div className="center">{this.state.errorlog}</div>
                        <div className="center"><button onClick={ () => this.joinQueue(1)}>Single Player</button></div>
                        <br></br>
                        <div className="center"><button onClick={ () => this.joinQueue(2)}>2 Players</button></div>
                        <br></br>
                        <div className="center"><button onClick={ () => this.joinQueue(3)}>3 Players</button></div>
                        <br></br>
                        <div className="center"><button onClick={ () => this.joinQueue(4)}>4 Players</button></div>
                    </div>
                );
                    
            } else {
                return (
                    <div>
                        <div className="center">
                            <button onClick={ () => this.cancelQueue()}>Cancel Queue</button>
                        </div>
                        <div className="center">
                            <div>On Queue</div>
                        </div>
                    </div>)}
        } else {
            return (
                <div></div>
            );
        }
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showPopup: false,
            errorlog: null,
            currentPoints: 0,
            currentTurn: 1,
            tileValues: [[100]],
            diceValues: [null, null, null],
            selectedHexagon: [null,null,null],
            selectedDice: null,
            currentPosition: [null,null,null],
            boardSize: 6,
            attackValue: 0,
            turnState: null,
            pass: false,
        };
        this.getBoardData = this.getBoardData.bind(this)
        this.togglePopup = this.togglePopup.bind(this)
        this.getDice = this.getDice.bind(this)
    }

    //funcion que correr cuando el componente es creado
    componentDidMount() {
        socket.on("startInfo", (data) => {
            this.setState({currentPosition: data.pos});
            this.endTurn();
        });

        socket.on("endGame", (data) => {
            this.endGame();
            
        });

        socket.on("newRound", (data) => {
            this.errorlog("") 
            let new_state = [];
            this.setState({diceValues: data.dices});
            this.setState({currentTurn: data.currentTurn});
            this.setState({tileValues: data.mapState});
            for (let i = 0; i<data.turnState.length; i++) {
                if (data.turnState[i].userAddress != this.props.userAddress) {
                    new_state.push(data.turnState[i]);
                }
            }
            this.setState({turnState: new_state});
            this.setState({pass: false});
        });

        socket.on("lootResult", (data) => {
            if (data.result == "sea") {
            this.errorlog("No puedes lootear esta casilla, es mar");   
            } else if (data.result == "empty") {
                this.errorlog("Ya no quedan recursos en esta isla");
            } else {
                this.setState({currentPoints: data.points});
                this.changeTileValues(-data.looted);
                this.changeDiceValues();
            }
        });

    }

    togglePopup() {
        this.setState({
          showPopup: !this.state.showPopup
        });
      }

    getBoardData(childData) {
        this.setState({selectedHexagon: childData})
    }

    getDice(childData) {
        this.setState({selectedDice: childData})
    }

    positionValue(position) {
        return this.state.tileValues[position[0]+this.state.boardSize][position[1]+this.state.boardSize]
    }

    changeTileValues(change) {
        const old_tiles = this.state.tileValues;
        const new_tiles = old_tiles.map((_) => _ );

        new_tiles[this.state.currentPosition[0]+this.state.boardSize][this.state.currentPosition[1]+this.state.boardSize]= new_tiles[this.state.currentPosition[0]+this.state.boardSize][this.state.currentPosition[1]+this.state.boardSize]+change;    
        this.setState({tileValues: new_tiles});
    }

    changeDiceValues() {
        const old_dices = this.state.diceValues;
        const new_dices = old_dices.map((_) => _ );

        new_dices[this.state.selectedDice] = null;  
        this.setState({diceValues: new_dices});
    }

    sail() {
        if (this.state.pass == false) {
            this.setState({errorlog: null});
            if (this.state.currentPosition[0] != this.state.selectedHexagon[0] && this.state.currentPosition[1] != this.state.selectedHexagon[1] && this.state.currentPosition[2] != this.state.selectedHexagon[2]) {
                this.errorlog("Casilla no valida, solo puedes navegar en linea recta");
            } else if (this.state.selectedDice == null) {
                this.errorlog("Debes seleccionar un dado para utilizar");
            } else if (this.state.currentPosition[0] == this.state.selectedHexagon[0] && this.state.currentPosition[1] == this.state.selectedHexagon[1]) {
                this.errorlog("No puedes navegar a la casilla en la que estas");
            } else if (
            this.state.currentPosition[0]-this.state.selectedHexagon[0] > this.state.diceValues[this.state.selectedDice] ||
            this.state.selectedHexagon[0]-this.state.currentPosition[0] > this.state.diceValues[this.state.selectedDice]) {
                this.errorlog("No puedes avanzar mas de lo que dice el dado");
            } else if (
            this.state.currentPosition[1]-this.state.selectedHexagon[1] > this.state.diceValues[this.state.selectedDice] ||
            this.state.selectedHexagon[1]-this.state.currentPosition[1] > this.state.diceValues[this.state.selectedDice]) {
                this.errorlog("No puedes avanzar mas de lo que dice el dado");
            } else if (
            this.state.currentPosition[2]-this.state.selectedHexagon[2] > this.state.diceValues[this.state.selectedDice] ||
            this.state.selectedHexagon[2]-this.state.currentPosition[2] > this.state.diceValues[this.state.selectedDice]) {
                this.errorlog("No puedes avanzar mas de lo que dice el dado");
            }else {
                this.setState({currentPosition: this.state.selectedHexagon});
                this.changeDiceValues();
            }
        }
    }

    loot() {
        if (this.state.pass == false) {
            this.setState({errorlog: null});
            if (this.state.diceValues[this.state.selectedDice] == null) {
                this.errorlog("Debes seleccionar un dado para lootear"); 
            } else {
                socket.emit("loot", {
                    userAddress: this.props.userAddress,
                    currentPosition: this.state.currentPosition,
                    lootValue: this.state.diceValues[this.state.selectedDice],
                });
            }
        }
    }

    endTurn() {
        if (this.state.pass == false) {
            socket.emit("endTurn", {
                userAddress: this.props.userAddress, 
                currentPosition: this.state.currentPosition,
                currentPoints: this.state.currentPoints,
                attackValue: this.state.attackValue,
            });
            this.errorlog("Esperando a los demas Jugadores");
            this.setState({pass: true});
        }
    }

    endGame() {
        this.togglePopup();
    }

    errorlog(value) {
        this.setState({errorlog: value});
    }

    quitGame() {
        window.location.reload()
    }

    render() {
        return (
            <div>
                <div className="center">
                    Game ID: {this.props.gameId}
                </div>
                <div className="center">
                    Turno: {this.state.currentTurn}        
                </div>
                <div className="center">
                    Tienes: {this.state.currentPoints} Puntos
                </div>
                <br></br>
                <div className='rowC'>
                    <SidePanelTurn 
                        quitGame = {this.quitGame.bind(this)}
                    />
                    <div>
                        <Board 
                            tileValues={this.state.tileValues}
                            selectedHexagon = {this.state.selectedHexagon}
                            currentPosition = {this.state.currentPosition}
                            sendBoardData={this.getBoardData}
                            boardSize = {this.state.boardSize}
                            turnState = {this.state.turnState}
                        />
                    </div>
                    <SidePanelGame 
                        selectedDice = {this.state.selectedDice}
                        diceValues = {this.state.diceValues}
                        sendDice = {this.getDice}
                        sail = {this.sail.bind(this)}
                        loot = {this.loot.bind(this)}
                        endTurn = {this.endTurn.bind(this)}
                    />

                </div>
                {this.state.showPopup ? 
                    <Popup
                    currentPoints={this.state.currentPoints}
                    closePopup={this.togglePopup.bind(this)}
                    quitGame={this.quitGame.bind(this)}
                    />
                : null
                }
            </div>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.getSelectedHexagon = this.getSelectedHexagon.bind(this)
    }

    getSelectedHexagon(childData) {
        this.props.sendBoardData(childData);
    }

    renderHexagon(value, q,r,s) {
        if (value != 200) {
            return <BoardHexagon 
                        q={q} 
                        r={r} 
                        s={s} 
                        value = {value} 
                        selectedHexagon = {this.props.selectedHexagon} 
                        currentPosition = {this.props.currentPosition} 
                        turnState = {this.props.turnState}
                        sendData={this.getSelectedHexagon}/>
        }
    }

    renderR(array, q){
        return array.map((_, index) => this.renderHexagon(_, (q-this.props.boardSize), (index-this.props.boardSize), -q-index+(this.props.boardSize*2) ))

    }

    render() {
        var tiles = this.props.tileValues;
        return (
            <HexGrid width={600} height={600} viewBox="-50 -50 100 100">
                <Layout size={{ x: 4, y: 4 }} flat={true} spacing={1} origin={{ x: 0, y: 0 }}>
                    {tiles.map((_, index) => this.renderR(_, index))}
                </Layout>
                <Pattern id="island" link="src/island.png" />
                <Pattern id="islandSelected" link="src/islandSelected.png" />
                <Pattern id="sea" link="src/sea.png" />
                <Pattern id="seaSelected" link="src/seaSelected.png" />
                <Pattern id="ship" link="src/ship.png" />
                <Pattern id="shipSelected" link="src/shipSelected.png" />
            </HexGrid>
        )
    }
}

class BoardHexagon extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    select() {
        if (this.props.selectedHexagon[0]!=this.props.q || this.props.selectedHexagon[1]!=this.props.r) {
            this.props.sendData([this.props.q, this.props.r, this.props.s]);
        } else {
            this.props.sendData([null, null, null]);
        }

    }

    render() {
        let Type;
        let value;
        let classType;
        let selected;
        if (this.props.value == 100) {
            Type = "sea";           
        } else if (this.props.value < 10) {
            Type = "island";
        }
        if (this.props.selectedHexagon[0]==this.props.q && this.props.selectedHexagon[1]==this.props.r) {
            selected ="Selected";
        } else {
            selected ="";
        }
        if (this.props.currentPosition[0]==this.props.q && this.props.currentPosition[1]==this.props.r) {
            Type = "ship";
        }
        if (this.props.value!=100) {
            value = this.props.value.toString();
        } else {
            value =null;
        }
        if (this.props.turnState != null) {
            for (let i=0; i<this.props.turnState.length;i++) {
                if (this.props.turnState[i].currentPosition[0] == this.props.q && this.props.turnState[i].currentPosition[1]==this.props.r) {
                    Type = "ship"
                }
            }
        }
        classType = Type+selected;
        return(
            <Hexagon q={this.props.q} r={this.props.r} s={this.props.s} fill={classType} onClick={ () => this.select()}
            ><Text className ={"hexagonText"}>{value}</Text>
            </Hexagon>
        )
    }
}

class Popup extends React.Component??{
    render() {
      return (
        <div className='popup'>
          <div className='popup_inner'>
                <div className="center">
                    Total Points: {this.props.currentPoints} 
                </div>
                <br></br>
                <br></br>
                <div className="center">
                    <button onClick={this.props.quitGame}>Play Again</button>
                    <button onClick={this.props.closePopup}>Go to Main Menu</button>
                </div>
          </div>
        </div>
      );
    }
}

class SidePanelGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    selectDice(index) {
        this.props.sendDice(index);
    }

    renderDices(value, index) {
        if (value == null) {
            return ""
        }
        if (this.props.selectedDice == index) {
            return <button 
                onClick={ () => this.selectDice(index)}
                className="diceSelected"
                >
                    {value}
                </button>

        } else {
            return <button 
                onClick={ () => this.selectDice(index)}
                className="dice"
                >
                    {value}
                </button>
        }
    }

    render() {
        let dices = this.props.diceValues;
        return (
            <div className = "sidePanel">
                <div className="center">
                    Dados             
                </div>
                <div className="center">
                    {dices.map((_, index) => this.renderDices(_, index))}
                </div>
                <br></br>
                <div className = "center">
                    <button onClick={ () => this.props.sail()}>Sail</button>
                    <button onClick={ () => this.props.loot()}>Loot</button>
                    <button onClick={ () => this.props.endTurn()}>End Turn</button>
                </div>
                <br></br>
                <div className="center">
                    {this.state.errorlog}
                </div>
            </div>
        )
    }
}

class SidePanelTurn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div className = "sidePanel">
                <div className="center">
                    <button onClick={ () => this.props.quitGame()}>Quit Game</button>
                </div>
            </div>
        )
    }
}


//comando necesario para importar la clase Game en main.js
module.exports.Game = Game;
module.exports.PlayButton = PlayButton;
