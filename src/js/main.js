
const { ethers, Contract } = require("ethers");
const game = require("./game.js");
var React = require('react');
var ReactDOM = require('react-dom');

var express = require('express');
var cookieParser = require('cookie-parser');


var app = express();
app.use(cookieParser());

app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.cookieName;
  if (cookie === undefined) {
    // no: set a new cookie
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully');
  } else {
    // yes, cookie was already present 
    console.log('cookie exists', cookie);
  } 
  next(); // <-- important!
});

// let static middleware do its job
app.use(express.static(__dirname + '/public'));

app.listen(8080);



const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();


//Funcion de inicializacion de la pagina
window.onload = async function initialize() {
    let userAddress;
    const onboardButton = document.getElementById('connectButton');
    const MetaMaskClientCheck = () => {
        //Now we check to see if MetaMask is installed
        
        if (ethereum.isMetaMask == true) {
          onboardButton.innerText = 'Connect Metamask';
          onboardButton.onclick = onClickConnect;
          onboardButton.disabled = false;
        }
    }
    const playButton = (address) => {
        ReactDOM.render(
            <game.PlayButton userAddress = {address}/>,
            document.getElementById('playButton'));
    }


    //MetaMaskClientCheck();
    //userAddress = await currentAddress();
    //playButton(userAddress);
}

const onClickConnect = async () => {
    try {
      // Will open the MetaMask UI
      // You should disable this button while the request is pending!
      await ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error(error);
    }
}

async function currentAddress() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    return account;
}



