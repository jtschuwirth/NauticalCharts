
const game = require("./game.js");
var React = require('react');
var ReactDOM = require('react-dom');

//Funcion de inicializacion de la pagina
const initialize = async () => {
    ReactDOM.render(
        <game.Game />,
        document.getElementById('game')
    );
}

window.addEventListener('DOMContentLoaded', initialize);