
const { ethers, Contract } = require("ethers");
const game = require("./game.js");
var React = require('react');
var ReactDOM = require('react-dom');


const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();


//Funcion de inicializacion de la pagina
window.onload = async function initialize() {
  ReactDOM.render(
    <App />,
    document.getElementById('app'));
}

const playButton = (address) => {
  ReactDOM.render(
      <game.PlayButton userAddress = {address}/>,
      document.getElementById('playButton'));
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentAddress: null,
      connected: false,
    };
    this.getAddress = this.getAddress.bind(this)
    this.getConnection = this.getConnection.bind(this)
  }
  componentDidMount() {
    if (this.state.currentAddress != null) {
      playButton(this.state.currentAddress);
    } 
  }

  getAddress(childData) {
    this.setState({currentAddress: childData})
    playButton(this.state.currentAddress);
  }
  getConnection(childData) {
    if (childData == "connected") {
      this.setState({connected: true})
    }
  }
  
  render() {
    if (this.state.connected == false) {
      return (
        <MetamaskConnection sendAddress={this.getAddress} sendConnection={this.getConnection}/>
      )
    } else {
      return <div></div>
    }
  }
}

class MetamaskConnection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
    };
  }

  async connectMetamask() {
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      let account = await this.currentAddress();
      this.setState({connected: true});
      this.props.sendAddress(account);
      this.props.sendConnection("connected");
    } catch (error) {
      console.error(error);
      this.setState({connected: false});
    }
  }

  async currentAddress() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    return account;
}

  installMetamask() {
    window.open("https://metamask.io/");
  }

  render() {
    if (ethereum.isMetaMask == true) {
      return (
        <div className="center"><button onClick={ () => this.connectMetamask()}>Connect</button></div>
      );
    } else {
      this.setState({connected: false});
      return (
        <div className="center"><button onClick={ () => this.installMetamask()}>Install Metamask</button></div>
      )
    }
  }
}



