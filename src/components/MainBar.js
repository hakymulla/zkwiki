const { groth16 } = require('snarkjs');
const { React, useState } = require('react');
const { ethers } = require('ethers');
const { keccak, getCallData } = require('../utils');
const BigInt = require('big-integer');
const Message  = require('./Message.json');
const IPFS = require('ipfs-core')

const sendzkey = 'sendmessage/circuit_final.zkey'
const sendWasm = 'sendmessage/circuit.wasm';
const revealzkey = 'revealmessage/circuit_final.zkey'
const revealWasm = 'revealmessage/circuit.wasm';

const contractAddress = "0xdf3c7B18d0CaCC49743FC6F2a2237AF297341736";
// const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);

function formatMessage(str) { 
    return BigInt((ethers.utils.solidityKeccak256(["string"], [str])) % SNARK_FIELD_SIZE);
}
const MainBar = ({ accounts, setAccounts }) => {
    const isConnected = Boolean(accounts[0]);
    const [msgHeader, setMsgHeader] = useState("");
    const [msgBody, setMsgBody] = useState("");
    const [secret, setSecret] = useState("");
    const [msgHeaderReveal, setMsgHeaderReveal] = useState("");
    const [msgHash, setMsgHash] = useState("");
    const [secretReveal, setSecretReveal] = useState("");


    const handleMsgHeaderChange = (e) => {
        setMsgHeader(e.target.value);
    }

    const handleMsgBodyChange = (e) => {
        setMsgBody(e.target.value);
        
    }

    const handleSecretChange = (e) => {
        setSecret(e.target.value);
        
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
                const msg_stringify = JSON.stringify({msgheader: msgHeader});
        
                const input = {
                    secret: Number(formatMessage(secret_stringify)),
                    msgheader: Number(formatMessage(msg_stringify)),
                };
                
                const send = await groth16.fullProve(input, sendWasm, sendzkey);
                console.log("send", send);
                const { _a, _b, _c, _input} = await getCallData(send.proof, send.publicSignals);
                console.log("_input", _input);
                const msgHash = send.publicSignals[0]
                const response = await contract.sendMessage(msgHeader,_a,_b,_c,_input);
                console.log("response", response);
                localStorage.setItem(msgHeader, msgBody);
                // alert("Copy This Message Hash, You'll need it to Reveal Your Message");
                // alert(msgHash);


            } catch (err) {
                console.log("ERROR:", err.message)
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
                const msg_stringify = JSON.stringify({msgheader: msgHeaderReveal});

                const get_hash_input = {
                    secret:Number(formatMessage(secret_stringify).value),
                    msgheader: Number(formatMessage(msg_stringify).value),
                };
                const send = await groth16.fullProve(get_hash_input, sendWasm, sendzkey);

                const reveal_input = {
                    secret:Number(formatMessage(secret_stringify).value),
                    msgheader: Number(formatMessage(msg_stringify).value),
                    msgHash: send.publicSignals[0]
                };
                const reveal = await groth16.fullProve(reveal_input, revealWasm, revealzkey);
                console.log("reveal snark:", reveal);
                const reveal_calldata = await getCallData(reveal.proof, reveal.publicSignals);
                console.log(reveal_calldata);
                const msgbody = localStorage.getItem(msgHeaderReveal);
                console.log(msgbody)
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
                    placeholder="Secret"
                    className="form--input"
                    onChange={handleSecret}
                    value={secretReveal}
                />

                <button className="form--button" onClick={handleReveal}>Reveal</button>
            </form >
        </div>
        </div>

    )
}
export default MainBar;


