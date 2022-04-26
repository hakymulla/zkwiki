import { useState } from 'react';
import './App.css';
import Navbar from './components/NavBar';
import MainBar from './components/MainBar';
import Reveal from './components/Reveal';

function App() {
  const [accounts, setAccounts] = useState([]);

  return (
    <div className="App">
      <Navbar accounts={accounts} setAccounts={setAccounts} />
      <MainBar accounts={accounts} setAccounts={setAccounts} />
      <div class='vl'></div>
      <Reveal accounts={accounts} setAccounts={setAccounts} />
    </div>
  );
}

export default App;
