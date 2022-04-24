
// import {React, useState} from 'react';
// // import { Box, Button, Flex, Link, Spacer } from '@chakra-ui/react';

// const NavBar = ({ accounts, setAccounts }) => {
//     const isConnected = Boolean(accounts[0]);
//     const [defaultAccount, setDefaultAccount] = useState(null);


//     async function connectAccount(){
//         if (window.ethereum){
//             const accounts = await window.ethereum.request({
//                 method: "eth_requestAccounts",
//             });
//             setAccounts(accounts);
//             defaultAccount = accounts[0];
//         }
//     }

//     // const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
//     // function truncateEthAddress(address) {
//         // let match = address.match(truncateRegex);
//         // if (!match) return address;
//         // return `${match[1]}…${match[2]}`;
//         // return address[7];
//     //   };

//     return(
//         <header className='header'>

//             <div className='header--title'> zkWiki </div>


            
//             {/* <div className='header--address'> 
//                 { isConnected ? <p>Address:{accounts[0].slice(0,5)}...{accounts[0].slice(-4,)}  </p> : <p>None</p>} 
            
//             </div> */}
            

//             {isConnected ? (
//             <p> Connected</p>) : (
//             <button className='header--connect' onClick={connectAccount}
//             > Connect 
//             </button>)}

            

//         </header>

//     );

// };

// export default NavBar;

import React, { useEffect, useState } from "react";

export default function NavBar({ accounts, setAccounts }) {

    const isConnected = Boolean(accounts[0]);
    const [defaultAccount, setDefaultAccount] = useState(null);

    const connectWallet = async () => {
        try {
        const { ethereum } = window;

        if (!ethereum) {
            alert("Please install MetaMask!");
            return;
        }

        const accounts = await ethereum.request({
            method: "eth_requestAccounts",
        });

        setAccounts(accounts);
        defaultAccount = accounts[0];

        console.log("Connected", accounts[0]);
        } catch (error) {
        console.log(error);
        }
    };

    // useEffect(() => {
    //     connectWallet();
    // }, []);

  return (
        <header className='header'>

            <div className='header--title'> zkWiki </div>

            {/* <div className='header--address'> 
                { isConnected ? <p>Address:{accounts[0].slice(0,5)}...{accounts[0].slice(-4,)}  </p> : <p>None</p>} 
            
            </div> */}

            {isConnected ? (
            <p> Connected</p>) : (
            <button className='header--connect' onClick={connectWallet}
            > Connect 
            </button>)}

        </header>


  )
}


