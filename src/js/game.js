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
            tileValues: [
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,1,0,0,0,0,0,0,1,0],
                [1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,2,0,1,0,0,0,0,0],
                [0,1,0,0,0,0,0,0,0,1,0,0],
                [0,0,0,1,0,0,0,1,0,0,0,0]
            ],
            selectedSquare: [null,null],
        };
        this.getBoardData = this.getBoardData.bind(this)
    }

    getBoardData(childData) {
        this.setState({selectedSquare: childData})
    }

    render() {
        return (
            <div>
                <Board 
                    tileValues={this.state.tileValues} 
                    selectedSquare = {this.state.selectedSquare}
                    sendBoardData={this.getBoardData}
                />
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
        } else if (this.props.value == 2) {
            Type="start";
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