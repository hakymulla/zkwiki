import { callbackify } from 'util';
import {Message} from 'Message';
const React = require('react');
const { groth16 } = require('snarkjs');
const {useState, useEffect} = require('react');
const { ethers, BigNumber } = require('ethers');
const contractAddress = "0xD1760AA0FCD9e64bA4ea43399Ad789CFd63C7809";
// const Message  = require('Message.json');
const { formatMessage, getCallData } = require('../utils');



const revealzkey = 'revealmessage/circuit_final.zkey'
const revealWasm = 'revealmessage/circuit.wasm';
const revealvkey= 'revealmessage/verification_key.json';

export default function Reveal({ accounts, setAccounts }) {

    const [alldata, setalldata] = useState("");
    const [msgHeaderReveal, setMsgHeaderReveal] = useState("");
    const [msgHash, setMsgHash] = useState("");
    const [secretReveal, setSecretReveal] = useState("");
    const [saltReveal, setSaltReveal] = useState("");
    const INTERVAL_DELAY = 6000;


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
                console.log("msgheaader", msg_stringify);

                
                const reveal_input = {
                    secret:formatMessage(secret_stringify).value,
                    salt: formatMessage(salt_stringify).value,
                    msgheader: formatMessage(msg_stringify).value,
                    msgHash
                };


                // const reveal_input2 =  {
                //     secret: 1n,
                //     salt: 2n,
                //     msgheader: 13341044457109254294203852456720387116212463375612399478786715689898471863352n,
                //     msgHash: '16482258256106470148964370005993332270345612836339283261333717405943502937790'
                //   }

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
    const display = async() => {}

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

    useEffect(() => {
        const interval = setInterval(() => {
            const defaultreveal = async () => {
            await getMessageStructData()
        }

        defaultreveal()
            .catch(console.error);

      }, INTERVAL_DELAY)
      return () => clearInterval(interval)
    })

    const getAllData = alldata => {
        let header = [];
        try {
            for (let i = 0; i < alldata[0].length+1; i++) {
            const header_item = alldata[0][i];
            const body_item = alldata[1][i];

            header.push(<p>{header_item}</p>);
            header.push(<p>{body_item}</p>);
            header.push( <hr />)
            }
        }
        catch (err) {
            console.log("error:", err)
        }
        
        return header;
      };

    return (
       <div className="split right">

            <div className='reveal'>
                <ul>
                { getAllData(alldata)}
                </ul>

                <revealer className="card">
                <form className="form" >             
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
                    
                </revealer>
            
            </div>

        </div>

    )
}
