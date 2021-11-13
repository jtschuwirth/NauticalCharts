//comando para compilar
//npm run build 
//para correr la pagina en localhost
//npm run dev

var React = require('react');
var ReactDOM = require('react-dom');

//Clase Game clase superior donde se guardan los estados de la partida
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //valores de las tiles es entrega desde el backend para todos los usuarios (es el mapa de la partida)
            errorlog: null,
            tileValues: [
                [0,0,0,0,0,0,0,1,0,0,0,0],
                [0,0,0,1,0,0,0,0,0,0,1,0],
                [1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,1,0,0,0,0,0],
                [0,1,0,0,0,0,0,0,0,1,0,0],
                [0,0,0,1,0,0,0,1,0,0,0,0]
            ],
            diceValues: [null, null, null],
            selectedSquare: [null,null],
            selectedDice: null,
            currentPosition: [4,3],
        };
        this.getBoardData = this.getBoardData.bind(this)
    }

    //funcion que correr cuando el componente es creado
    componentDidMount() {

    }

    getBoardData(childData) {
        this.setState({selectedSquare: childData})
    }

    sail() {
        this.setState({errorlog: null});
        if (this.state.currentPosition[0] != this.state.selectedSquare[0] && this.state.currentPosition[1] != this.state.selectedSquare[1]) {
            this.errorlog("Casilla no valida, solo puedes navegar en linea recta")
        } else {
            this.setState({currentPosition: this.state.selectedSquare});
        }
    }

    loot() {

    }

    endTurn() {

    }

    errorlog(value) {
        this.setState({errorlog: value});
    }

    render() {
        return (
            <div>
                <div class="center">
                    <Board 
                        tileValues={this.state.tileValues} 
                        selectedSquare = {this.state.selectedSquare}
                        currentPosition = {this.state.currentPosition}
                        sendBoardData={this.getBoardData}
                    />
                </div>
                <br></br>
                <div class = "center">
                    <button onClick={ () => this.sail()}>Sail</button>
                    <button onClick={ () => this.loot()}>Loot</button>
                    <button onClick={ () => this.endTurn()}>End Turn</button>
                </div>
                <br></br>
                <div class="center">
                    Te encuentras en [{this.state.currentPosition[0]},{this.state.currentPosition[1]}]
                </div>
                <div class="center">
                    {this.state.errorlog}
                </div>
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
        this.getSelectedSquare = this.getSelectedSquare.bind(this)
    }

    getSelectedSquare(childData) {
        this.props.sendBoardData(childData);
    }

    renderSquare(value, row, index) {
        return <Square 
            id={[index, row]} 
            value={value} 
            selectedSquare={this.props.selectedSquare}
            currentPosition = {this.props.currentPosition}
            sendData={this.getSelectedSquare}
        />
    }

    renderRow(array, row) {
        return <div className="board-row">
                    {array.map((_, index) => this.renderSquare(_, row, index))}
                </div>
    }

    render() {
        const tiles=this.props.tileValues;
        return (
            <div>
                {tiles.map((_, index) => this.renderRow(_, index))}
            </div>

          );
    }
}

class Square extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    squareType() {
        let Type;
        let selected;
        let className;
        if (this.props.selectedSquare[0]==this.props.id[0] && this.props.selectedSquare[1]==this.props.id[1]) {
            selected ="Selected";
        } else {
            selected ="";
        }

        if (this.props.value == 0) {
            Type = "sea";           
        } else if (this.props.value == 1) {
            Type = "island";
        }

        if (this.props.currentPosition[0]==this.props.id[0] && this.props.currentPosition[1]==this.props.id[1]) {
            Type = "ship";
        }
        className = Type+selected;
        return (
                <button 
                    className={className}
                    onClick={ () => this.select()}
                > 
                </button>
        );
    }

    select() {
        if (this.props.selectedSquare[0]!=this.props.id[0] || this.props.selectedSquare[1]!=this.props.id[1]) {
            this.props.sendData(this.props.id);
        } else {
            this.props.sendData([null,null]);
        }
      }
  
    render() {
        return (
            this.squareType()
        )

    }
}


//comando necesario para importar la clase Game en main.js
module.exports.Game = Game;