import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
// import process from 'process';
// const snarkjs = require("snarkjs");
// console.log("snarkjs", snarkjs);

import Navbar from './components/NavBar';
import MainBar from './components/MainBar';
import Reveal from './components/Reveal';

function App() {
  const [accounts, setAccounts] = useState([]);

useEffect(() => {
    window.process = {
      ...window.process,
    };
}, []);

  return (
    <div className="App">
      <p>Test</p>
      <Navbar accounts={accounts} setAccounts={setAccounts} />
      <MainBar accounts={accounts} setAccounts={setAccounts} />
      <div className='vl'></div>
      <Reveal accounts={accounts} setAccounts={setAccounts} />
    </div>
  );
}



export default App;

