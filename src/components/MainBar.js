// import { groth16 } from "snarkjs";
const { groth16 } = require('snarkjs');
const { React, useState } = require('react');
const { ethers, BigNumber } = require('ethers');
const { keccak, getCallData } = require('../utils');
const BigInt = require('big-integer');
const Message  = require('../artifacts/contracts/Message.sol/Message.json');
// const { readFileSync, writeFile } = require("fs");
// const { groth16 } = require('snarkjs');
const { expect } = require("chai");

const sendzkey = 'sendmessage/circuit_final.zkey'
const sendWasm = 'sendmessage/circuit.wasm';
const sendvkey= 'sendmessage/verification_key.json';

// const _a = [
//     '0x12edb2ba2ded21db1e2f43d07e97f3a60e22e24d2edbeaccb07166d1b1356c29',
//     '0x2889fd136af05077d9ae5ad3da1c01f739dc974dcae0a1680a6f115ce78b9b8a'
//   ];
// const _b = [
//     [
//       '0x00c43a83d4829d73292ccec50c61b01b5b1adc4cdc0fa62142fa3ef1e7733d78',
//       '0x0e2c3534217e3e85a625b7e8a0818bd97a23c38a902bdd2c91362849386b569a'
//     ],
//     [
//       '0x0bad46c5bd2483727a6170c3344c9d2392860389981378b9a6a24f2cb823aa4d',
//       '0x1e1425a43de2f20ff5b9bc14ec121c1030519e1baef05f5709e0a2644387d373'
//     ]
//   ];
// const _c = [
//     '0x20743007b3692cb1ed3ffc5652ee242a3af2eba964000c0217f3140d1bc14f6e',
//     '0x169d6238c4a52943e8da679c01e9940d8bc1c3ca9eb3a8b990823fa134054b7e'
//   ];
// const _input =[
//     '0x0fc40708849b20b3db5b985e2c7d920e8252e039d09a189f086300405802fa21',
//     '0x15307bb4774cfd2f305394fb0686e79d9b630211f6a1bf49e581d32f83a3956a'
//   ];

const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
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
                console.log("msgheaader", msg_stringify)

                const input = {
                    secret: formatMessage(secret_stringify),
                    salt: formatMessage(salt_stringify),
                    msgheader: formatMessage(msg_stringify),
                };
                console.log("input", input);

                const send = await groth16.fullProve(input, sendWasm, sendzkey);
                const { _a, _b, _c, _input} = await getCallData(send.proof, send.publicSignals);
                const msgHash = send.publicSignals[0]
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


