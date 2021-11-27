
const { ethers, Contract } = require("ethers");
const game = require("./game.js");
var React = require('react');
var ReactDOM = require('react-dom');


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


    MetaMaskClientCheck();
    userAddress = await currentAddress();
    playButton(userAddress);
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



