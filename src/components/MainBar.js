const { groth16 } = require('snarkjs');
const { React, useState } = require('react');
const { ethers, BigNumber } = require('ethers');
const { keccak, getCallData } = require('../utils');
const BigInt = require('big-integer');
const Message  = require('./Message.json');
const { expect } = require("chai");

const sendzkey = 'sendmessage/circuit_final.zkey'
const sendWasm = 'sendmessage/circuit.wasm';
const sendvkey= 'sendmessage/verification_key.json';
const revealzkey = 'revealmessage/circuit_final.zkey'
const revealWasm = 'revealmessage/circuit.wasm';
const revealvkey= 'revealmessage/verification_key.json';

const contractAddress = "0x474557bE5C15d848Df6557993F7eCC6919116dC9";
// const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

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
    const [msgHeaderReveal, setMsgHeaderReveal] = useState("");
    const [msgHash, setMsgHash] = useState("");
    const [secretReveal, setSecretReveal] = useState("");
    const [saltReveal, setSaltReveal] = useState("");
    const [alldata, setalldata] = useState("");


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
                    secret: Number(formatMessage(secret_stringify)),
                    salt: Number(formatMessage(salt_stringify)),
                    msgheader: Number(formatMessage(msg_stringify)),
                };
                
                console.log("input", input);

                const send = await groth16.fullProve(input, sendWasm, sendzkey);
                console.log("send", send);
                const { _a, _b, _c, _input} = await getCallData(send.proof, send.publicSignals);
                console.log("_inout", _input);
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

    const getMessageStructData = async() => {
        // e.preventDefault();
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
                const response =  await contract.getMessageStruct();
                console.log(response);
                setalldata(response);

            }catch (err) {
                console.log("error:", err)
            }
        }
    }

    const handleReveal = async(e) => {
        e.preventDefault();
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
          }
        else if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                contractAddress,
                Message.abi,
                signer
            );
            try {
                const secret_stringify = JSON.stringify({secret: secretReveal});
                const salt_stringify = JSON.stringify({salt: saltReveal});
                const msg_stringify = JSON.stringify({msgheader: msgHeaderReveal});

                
                const reveal_input = {
                    secret:Number(formatMessage(secret_stringify).value),
                    salt: Number(formatMessage(salt_stringify).value),
                    msgheader: Number(formatMessage(msg_stringify).value),
                    msgHash
                };

                console.log("reveal", reveal_input);

                const reveal = await groth16.fullProve(reveal_input, revealWasm, revealzkey);
                console.log("reveal snark:", reveal);
                const reveal_calldata = await getCallData(reveal.proof, reveal.publicSignals);
                console.log(reveal_calldata);
                const msgbody = localStorage.getItem('msgBody');
                const reveal_result = await contract.revealMessage(msgbody, reveal_calldata._a, reveal_calldata._b, reveal_calldata._c, reveal_calldata._input);

            }catch (err) {
                console.log("error:", err)
            }
        }
    }

    const handleMsgHeader = (e) => {
        setMsgHeaderReveal(e.target.value);
    }

    const handleMsgHash = (e) => {
        setMsgHash(e.target.value);
    }


    const handleSecret = (e) => {
        setSecretReveal(e.target.value);
    }

    const handleSalt = (e) => {
        setSaltReveal(e.target.value);
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

            <form className="form--reveal" >             
                <input 
                    type="text"
                    placeholder="Message Header"
                    className="form--input"
                    onChange={handleMsgHeader}
                    value={msgHeaderReveal}
                />

                <input 
                    type="text"
                    placeholder="Message Hash"
                    className="form--input"
                    onChange={handleMsgHash}
                    value={msgHash}
                />
               
                <input 
                    type="text"
                    placeholder="Secret"
                    className="form--input"
                    onChange={handleSecret}
                    value={secretReveal}
                />
                <input 
                    type="text"
                    placeholder="Salt"
                    className="form--input"
                    onChange={handleSalt}
                    value={saltReveal}
                />
               

                <button className="form--button" onClick={handleReveal}>Reveal</button>
            </form >
        </div>
        </div>

    )
}
export default MainBar;


