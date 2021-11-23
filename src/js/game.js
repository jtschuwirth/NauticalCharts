//comando para compilar
//gulp
//para correr la pagina en localhost
//npm run dev


var React = require('react');
var ReactDOM = require('react-dom');
import { HexGrid, Layout, Hexagon, Text, Pattern, Path, Hex } from 'react-hexgrid';

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
        const map = this.crearMapa();
        const pos = this.pos_inicial();
        this.setState({tileValues: map});
        this.setState({currentPosition: pos});
        this.rollDices();
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
        return this.state.tileValues[position[0]][position[1]][position[2]]
    }

    //Cambiar a coordenadas hexagonales falta saber como interactuar con el mapa
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
        if (this.state.currentTurn == 5) {
            this.endGame();
        } else {
            this.rollDices();
            this.setState({currentTurn: this.state.currentTurn+1});
        }
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

    rollDices() {
        const dice0 = Math.floor(Math.random() * (7 - 1)) + 1;
        const dice1 = Math.floor(Math.random() * (7 - 1)) + 1;
        const dice2 = Math.floor(Math.random() * (7 - 1)) + 1;
        this.setState({diceValues: [dice0, dice1, dice2]});
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

    crearMapa() {
        const size_x = 13;
        const size_y = 13;
        var n_isles = 10;
        const min_dis = 3;
        const loot_min = 2;
        const loot_max = 10;
        //creamos el array con valores (100 - agua) y el tamaño correcto
        var mapa = Array.apply(null, Array(size_y)).map( () => {
            return Array.apply(null, Array(size_x)).map( () => {return 100} )
        });
      
        //las islas no pueden estar en los límites del mapa
        var pos_islas = []
        for (var i = 1; i < size_x - 1; i++) {
          for (var j = 1; j < size_y - 1; j++) {
            pos_islas.push({x: i, y: j});
          }
        }
        this.shuffle(pos_islas)
      
        //asignamos las islas en el tablero
        while (pos_islas.length > 0 && n_isles > 0){
            var pos = pos_islas.pop();
            mapa[pos.y][pos.x] = this.getRandomInt(loot_min, loot_max);
            n_isles--;
          
      
            var temp = [];
            for (var i = 1; i < pos_islas.length; i++){
                if ( this.dist( pos_islas[i], pos) > min_dis ){
                temp.push(pos_islas[i])
                }
            }
            pos_islas = temp
        }
      
      //{x: xVal, y: yVal}
      
        return mapa;
    }

    pos_inicial() {
        var pos = [0,0,0];
        return pos
    }

    dist(coord_1, coord_2) {
        return Math.abs(coord_1.x - coord_2.x) + Math.abs(coord_1.y - coord_2.y)
    }
      
    shuffle(array) {
        //https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
    }
      
    getRandomInt(min, max) {
        //https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        return Math.floor(Math.random() * (max - min)) + min;
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
