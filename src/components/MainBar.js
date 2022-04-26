import { React, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import Message from '../artifacts/contracts/Message.sol/Message.json';

let contractAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508";

const MainBar = ({ accounts, setAccounts }) => {
    const isConnected = Boolean(accounts[0]);
    const [message, setMessage] = useState("");
    
    async function handleUser() {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
          }
        else if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(
                contractAddress,
                Message.abi,
                provider
            );
            try {
                const response = await contract.fetch();
                console.log("Response:", response);

            }catch (err) {
                console.log("error:", err)
            }
        }
    }

    async function  createUser() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                contractAddress,
                Message.abi,
                signer
            );
            try {
                const response = await contract.createUser();
                console.log("Response:", response);

            }catch (err) {
                console.log("ERROR:", err.message)
            }
        }
    }

    async function  saveMessage() {
        // if (!message) return;
        console.log("test");
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                contractAddress,
                Message.abi,
                signer
            );
            try {
                // const response = await contract.saveStrings(message);
                console.log("Response:");
                setMessage("");
                // await response.wait();

            }catch (err) {
                console.log("ERROR:", err.message)
            }
        }
    }

    return (
        <main className="main">

            <form className="form" >             
                <input 
                    type="text"
                    placeholder="Message Name"
                    className="form--input"
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                />
{/* 
                <textarea
                     placeholder="Write Your Anonymous Message.." 
                     className="form--input2"
                    >

                </textarea> */}

                <button 
                    className="form--button"
                    onClick={saveMessage}
                >
                    Post Anonymously
                </button>
            </form >
        </main>
    )
}
export default MainBar;


