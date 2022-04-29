import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
import Getdata from './components/Getdata';


import Navbar from './components/NavBar';
import MainBar from './components/MainBar';
import Reveal from './components/Reveal';
// const data = await Getdata();


function App() {
  const [accounts, setAccounts] = useState([]);

  return (
    <div className="App">
      <Navbar accounts={accounts} setAccounts={setAccounts} />
      <MainBar accounts={accounts} setAccounts={setAccounts} />
      <div className='vl'></div>
      <Reveal accounts={accounts} setAccounts={setAccounts} />
    </div>
  );
}

export default App;

