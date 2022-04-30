// import { groth16 } from "snarkjs";
const { groth16 } = require('snarkjs');
const { React, useState } = require('react');
const { ethers, BigNumber } = require('ethers');
const { keccak, getCallData } = require('../utils');
const BigInt = require('big-integer');
const Message  = require('components/artifacts/contracts/Message.sol/Message.json');
// const { readFileSync, writeFile } = require("fs");
// const { groth16 } = require('snarkjs');
const { expect } = require("chai");

const sendzkey = 'sendmessage/circuit_final.zkey'
const sendWasm = 'sendmessage/circuit.wasm';
const sendvkey= 'sendmessage/verification_key.json';


const contractAddress = "0xD1760AA0FCD9e64bA4ea43399Ad789CFd63C7809";
// const messageABI = Message.abi
// const provider = new ethers.providers.Web3Provider(window.ethereum);
// const signer = provider.getSigner();
// const contract = new ethers.Contract(contractAddress, messageABI, provider);
const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);

function formatMessage(str) { 
    return BigInt((ethers.utils.solidityKeccak256(["string"], [str])) % SNARK_FIELD_SIZE);
}
const MainBar = ({ accounts, setAccounts }) => {
    const isConnected = Boolean(accounts[0]);
    const [msgHeader, setMsgHeader] = useState("");
    const [msgBody, setMsgBody] = useState("");
    const [secret, setSecret] = useState("");
    const [salt, setSalt] = useState("");

    
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

    // async function  saveMessage() {
    //     // if (!message) return;
    //     console.log("test");
    //     if (window.ethereum) {
    //         const provider = new ethers.providers.Web3Provider(window.ethereum);
    //         const signer = provider.getSigner();
    //         const contract = new ethers.Contract(
    //             contractAddress,
    //             Message.abi,
    //             signer
    //         );
    //         try {
    //             // const response = await contract.saveStrings(message);
    //             console.log("Response:");
    //             setMessage("");
    //             // await response.wait();

    //         }catch (err) {
    //             console.log("ERROR:", err.message)
    //         }
    //     }
    // }


    const handleMsgHeaderChange = (e) => {
        setMsgHeader(e.target.value);
    }

    const handleMsgBodyChange = (e) => {
        setMsgBody(e.target.value);
        
    }

    const handleSecretChange = (e) => {
        setSecret(e.target.value);
        
    }

    const handleSaltChange = (e) => {
        setSalt(e.target.value);
        
    }
     
    const handlePostAnonymously = async(e) => {
        e.preventDefault();
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(accounts[0]);
            const contract = new ethers.Contract(
                contractAddress,
                Message.abi,
                signer
            );
            try {
                const secret_stringify = JSON.stringify({secret: secret});
                const salt_stringify = JSON.stringify({salt: salt});
                const msg_stringify = JSON.stringify({msgheader: msgHeader});
            

                const input = {
                    secret: formatMessage(secret_stringify),
                    salt: formatMessage(salt_stringify),
                    msgheader: formatMessage(msg_stringify),
                };
                console.log("input", input);

                const send = await groth16.fullProve(input, sendWasm, sendzkey);
                const { _a, _b, _c, _input} = await getCallData(send.proof, send.publicSignals);
                const msgHash = send.publicSignals[0]
                console.log(msgHash)
                const response = await contract.sendMessage(msgHeader,_a,_b,_c,_input);
                console.log("response", response);
                localStorage.setItem('msgBody', msgBody);
                alert("Copy This Message Hash, You'll need it to Reveal Your Message");
                alert(msgHash);


            } catch (err) {
                console.log("ERROR:", err.message)
            }
        }
    }

    return (
        <div className="split left">

        <div className="main">

            <form className="form" onSubmit={handlePostAnonymously}>             
                <input 
                    type="text"
                    placeholder="Message Header"
                    className="form--input"
                    onChange={handleMsgHeaderChange}
                    value={msgHeader}
                />
                <textarea
                     placeholder="Write Your Anonymous Message.." 
                     className="form--input2"
                     onChange={handleMsgBodyChange}
                     value={msgBody}
                    >
                </textarea>
                <input 
                    type="Secret"
                    placeholder="Secret"
                    className="form--input"
                    onChange={handleSecretChange}
                    value={secret}
                />
                <input 
                    type="Salt"
                    placeholder="Salt"
                    className="form--input"
                    onChange={handleSaltChange}
                    value={salt}
                />

                <button className="form--button">Post Anonymously</button>
            </form >
        </div>
        </div>

    )
}
export default MainBar;


