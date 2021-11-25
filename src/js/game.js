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
    credentials: true
  },transports : ['websocket'] });

const foundGame = (id, userAddress, type) => {
    ReactDOM.render(
        <Game gameId={id} userAddress={userAddress}/>,
        document.getElementById('gameMP')
    );

}

class QueueMessage extends React.Component {
    render() {
        if (this.props.inQueue == true) {
            return(
                <p>On Queue</p>
            );
        } else {
            return(
                <div></div>
            )
        }
    }
}

class PlayButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showQueue: true,
            inQueue: false,
        };
    }
    joinQueue() {
        socket.on("connect", () => {
        });
        socket.emit("enter", this.props.userAddress);
        this.setState({inQueue: true});
        socket.on("statusQueue", (data) => {
            for (let i=0; i<data.players.length; i++) {
                if (this.props.userAddress == data.players[i]) {
                    const id = data.lastId+1;
                    socket.emit("foundGame", {id: id, player: data.players[i], players: data.players})
                    foundGame(id, this.props.userAddress, this.props.type)
                    this.setState({showQueue: false});
                    this.setState({inQueue: false});
                }
            }
        });
    }
    cancelQueue() {
        socket.emit("out", this.props.userAddress);
        this.setState({inQueue: false});
    }
    render() {
        if (this.state.showQueue == true) {
            if (this.state.inQueue == false) {
                return (
                    <div className="center">
                            <button onClick={ () => this.joinQueue()}>Play!</button>
                    </div>)
            } else {
                return (
                    <div>
                        <div className="center">
                            <button onClick={ () => this.cancelQueue()}>Cancel Queue</button>
                        </div>
                        <div className="center">
                            <QueueMessage inQueue={this.state.inQueue}/>
                        </div>
                    </div>)}
        } else {
            return (
                <div></div>
            );
        }
    }
}

//Clase Game clase superior donde se guardan los estados de la partida
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showPopup: false,
            errorlog: null,
            currentPoints: 0,
            currentTurn: 1,
            tileValues: [[1,0],[1,100]],
            diceValues: [null, null, null],
            selectedSquare: [null,null],
            selectedHexagon: [null,null,null],
            selectedDice: null,
            currentPosition: [null, null, null],
        };
        this.getBoardData = this.getBoardData.bind(this)
        this.togglePopup = this.togglePopup.bind(this)
    }

    //funcion que correr cuando el componente es creado
    componentDidMount() {
        socket.on("startInfo", (data) => {
            this.setState({diceValues: data.dices});
            this.setState({currentPosition: data.pos});
            this.setState({tileValues: data.map});
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

    positionValue(position) {
        return this.state.tileValues[position[0]][position[1]]
    }

    changeTileValues(change) {
        const old_tiles = this.state.tileValues;
        const new_tiles = old_tiles.map((_) => _ );

        new_tiles[this.state.currentPosition[0]][this.state.currentPosition[1]]= new_tiles[this.state.currentPosition[0]][this.state.currentPosition[1]]+change;    
        this.setState({tileValues: new_tiles});
    }

    changeDiceValues() {
        const old_dices = this.state.diceValues;
        const new_dices = old_dices.map((_) => _ );

        new_dices[this.state.selectedDice] = null;  
        this.setState({diceValues: new_dices});
    }

    sail() {
        this.setState({errorlog: null});
        if (this.state.currentPosition[0] != this.state.selectedHexagon[0] && this.state.currentPosition[1] != this.state.selectedHexagon[1] && this.state.currentPosition[2] != this.state.selectedHexagon[2]) {
            this.errorlog("Casilla no valida, solo puedes navegar en linea recta");
        } else if (this.state.selectedDice == null) {
            this.errorlog("Debes seleccionar un dado para utilizar");
        } else if (this.state.currentPosition[0] == this.state.selectedHexagon[0] && this.state.currentPosition[1] == this.state.selectedHexagon[1] && this.state.currentPosition[2] == this.state.selectedHexagon[2]) {
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

    loot() {
        this.setState({errorlog: null});
        let currentValue;
        let change;
        let looted;
        currentValue = this.positionValue(this.state.currentPosition);
        if (this.state.diceValues[this.state.selectedDice] > currentValue) {
            looted = currentValue
        } else {
            looted = this.state.diceValues[this.state.selectedDice]
        }
        
        if (currentValue == 100) {
            this.errorlog("No puedes lootear esta casilla, es mar");         
        } else if (this.state.diceValues[this.state.selectedDice] == null) {
            this.errorlog("Debes seleccionar un dado para lootear"); 
        } else if (currentValue == 0) {
            this.errorlog("Ya no quedan recursos en esta isla");
        } else {
            this.setState({currentPoints: this.state.currentPoints+looted});
            change = -looted;
            this.changeTileValues(change);
            this.changeDiceValues();
        }

    }

    endTurn() {
        let waiting = false;
        socket.on("endGame", (data) => {
            this.endGame();
        });
        
        socket.on("newRound", (data) => {
            this.setState({diceValues: data.dices});
            this.setState({currentTurn: this.state.currentTurn+1});
            waiting = false;
            this.errorlog("")
            
        });
        if (waiting == false)
            socket.emit("endTurn", {userAddress: this.props.userAddress});
            waiting = true;
            this.errorlog("Esperando a los demas Jugadores")
    }

    endGame() {
        this.togglePopup();
    }

    playAgain() {
        window.location.reload()
     }

    renderDices(value, index) {
        if (value == null) {
            return ""
        }
        if (this.state.selectedDice == index) {
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

    selectDice(index) {
        this.setState({selectedDice: index})
    }

    errorlog(value) {
        this.setState({errorlog: value});
    }

    render() {
        let array = this.state.diceValues;
        return (
            <div>
                <div class="center">
                    Game ID: {this.props.gameId}
                </div>
                <div class="center">
                    Turno: {this.state.currentTurn}        
                </div>
                <div class="center">
                    Tienes: {this.state.currentPoints} Puntos
                </div>
                <br></br>

                <div class="center">
                    <Board 
                        tileValues={this.state.tileValues}
                        selectedHexagon = {this.state.selectedHexagon}
                        currentPosition = {this.state.currentPosition}
                        sendBoardData={this.getBoardData}
                    />
                </div>
                <br></br>
                <div class="center">
                    Dados             
                </div>
                <div class="center">
                    {array.map((_, index) => this.renderDices(_, index))}
                </div>
                <br></br>
                <div class = "center">
                    <button onClick={ () => this.sail()}>Sail</button>
                    <button onClick={ () => this.loot()}>Loot</button>
                    <button onClick={ () => this.endTurn()}>End Turn</button>
                </div>
                <br></br>
                <div class="center">
                    {this.state.errorlog}
                </div>
                {this.state.showPopup ? 
                    <Popup
                    currentPoints={this.state.currentPoints}
                    closePopup={this.togglePopup.bind(this)}
                    playAgain={this.playAgain.bind(this)}
                    />
                : null
                }
            </div>
        );
    }
}

//clase Board la cual tiene de hijos a los cuadrados.
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
        return <BoardHexagon 
                        q={q} 
                        r={r} 
                        s={s} 
                        value = {value} 
                        selectedHexagon = {this.props.selectedHexagon} 
                        currentPosition = {this.props.currentPosition} 
                        sendData={this.getSelectedHexagon}/>
    }

    renderR(array, q){
        return array.map((_, index) => this.renderHexagon(_, q, index, -q-index ))

    }

    render() {
        var tiles = this.props.tileValues;
        return (
            <HexGrid width={1200} height={800} viewBox="-50 -50 100 100">
                <Layout size={{ x: 3, y: 3 }} flat={true} spacing={1} origin={{ x: 0, y: 0 }}>
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
        if (this.props.selectedHexagon[0]!=this.props.q || this.props.selectedHexagon[1]!=this.props.r || this.props.selectedHexagon[2]!=this.props.s) {
            this.props.sendData([this.props.q, this.props.r, this.props.s]);
        } else {
            this.props.sendData([null,null, null]);
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
        if (this.props.selectedHexagon[0]==this.props.q && this.props.selectedHexagon[1]==this.props.r && this.props.selectedHexagon[2]==this.props.s) {
            selected ="Selected";
        } else {
            selected ="";
        }
        if (this.props.currentPosition[0]==this.props.q && this.props.currentPosition[1]==this.props.r && this.props.currentPosition[2]==this.props.s) {
            Type = "ship";
        }
        if (this.props.value!=100) {
            value = this.props.value;
        } else {
            value =null;
        }
        classType = Type+selected;
        return(
            <Hexagon q={this.props.q} r={this.props.r} s={this.props.s} fill={classType} onClick={ () => this.select()}
            ><Text className ={"hexagonText"}>{value}</Text>
            </Hexagon>
        )
    }
}

class Popup extends React.Component {
    render() {
      return (
        <div className='popup'>
          <div className='popup_inner'>
                <div class="center">
                    Total Points: {this.props.currentPoints} 
                </div>
                <br></br>
                <br></br>
                <div class="center">
                    <button onClick={this.props.playAgain}>Play Again</button>
                    <button onClick={this.props.closePopup}>Go to Main Menu</button>
                </div>
          </div>
        </div>
      );
    }
}


//comando necesario para importar la clase Game en main.js
module.exports.Game = Game;
module.exports.PlayButton = PlayButton;
