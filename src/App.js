import React, { Component } from "react";
import Recorder from "./Recorder.json";
import getWeb3 from "./utils/getWeb3";
import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, contract: null, weight: null, height: null, address: "", 
            outputWeight: null, outputHeight: null, time: null };
  componentDidMount = async () => {
    try {
     
      const web3 = await getWeb3();
      
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Recorder.networks[networkId];
      const instance = new web3.eth.Contract(
        Recorder.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  writeRecord = async() => {
    const { accounts, contract, weight, height } = this.state;
    const result = await contract.methods.writeData(parseInt(weight), parseInt(height)).send({
      from: accounts[0]
    });
    console.log(result);
    if(result.status === true) {
      alert('記録が完了しました');
    }
  }

  viewRecord = async() => {
    const { contract, address } = this.state;
    const result = await contract.methods.viewData(address).call();
    console.log(result);
    const outputWeight = result[0];
    const outputHeight = result[1];
    const time = this.unixTimeToTime(result[2]);
    this.setState({ outputWeight, outputHeight, time });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  unixTimeToTime = (intTime) => {

    const time = Number(intTime);
    const y = new Date(time * 1000);
    const year = y.getFullYear();
    const month = y.getMonth() + 1;
    const day = y.getDate();
    const hour = ('0' + y.getHours()).slice(-2);
    const min = ('0' + y.getMinutes()).slice(-2);
    const sec = ('0' + y.getSeconds()).slice(-2);

    
    const Time = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    return Time;
}



render() {
  if (!this.state.web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }
  return (
    <div className="App">
      
      <input onChange={this.handleChange('weight')} />

      <input onChange={this.handleChange('height')} />
      <button onClick={this.writeRecord}>記録</button>
      
      <br/>
      <br/>

      <input onChange={this.handleChange('address')} />
      <button onClick={this.viewRecord}>閲覧</button>

      <br/>
      <br/>

      {this.state.outputWeight? <p>体重: {this.state.outputWeight}</p>: <p></p>}
      {this.state.outputHeight? <p>身長: {this.state.outputHeight}</p>: <p></p>}
      {this.state.time? <p>時間: {this.state.time}</p>: <p></p>}

    </div>
  );
 }
}
export default App;