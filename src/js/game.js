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
            tileValues: [[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0]],
        };
    }

    render() {
        return (
            <div>
                <Board tileValues={this.state.tileValues}/>
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
    }

    renderSquare(value, row, index) {
        return <Square id={[index, row]}/>
    }

    render() {
        const tiles0 = this.props.tileValues[0];
        const tiles1 = this.props.tileValues[1];
        const tiles2 = this.props.tileValues[2];
        return (
            <div>
                <div className="board-row">
                    {tiles0.map((_, index) => this.renderSquare(_, 0, index))}
                </div>
                <div className="board-row">
                    {tiles1.map((_, index) => this.renderSquare(_, 1, index))}
                </div>
                <div className="board-row">
                    {tiles2.map((_, index) => this.renderSquare(_, 2, index))}
                </div>
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
  
    render() {
        return (
            <button 
                className="square" 
            > 
                {this.props.id}
            </button>
        );
  }
}


//comando necesario para importar la clase Game en main.js
module.exports.Game = Game;