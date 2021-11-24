
const game = require("./game.js");
var React = require('react');
var ReactDOM = require('react-dom');





//Funcion de inicializacion de la pagina
const initialize = () => {
    ReactDOM.render(
        <game.PlayButton userAddress = {"Address"} />,
        document.getElementById('playButton')
    );
}




window.addEventListener('DOMContentLoaded', initialize);