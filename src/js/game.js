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
        };
    }

    render() {
        return (
            <div>
                Aqui esta el juego
            </div>
        );
    }
}

//clase canvas la cual tiene de hijos a los hexagonos, es el tablero en si
class Canvas extends React.Component {

}

//comando necesario para importar la clase en main.js
module.exports.Game = Game;