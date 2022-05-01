import { callbackify } from 'util';
const React = require('react');
const { groth16 } = require('snarkjs');
const {useState, useEffect} = require('react');
const { ethers, BigNumber } = require('ethers');
const contractAddress = "0x474557bE5C15d848Df6557993F7eCC6919116dC9";
// const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

const Message  = require('./Message.json');
const { formatMessage, getCallData } = require('../utils');



const revealzkey = 'revealmessage/circuit_final.zkey'
const revealWasm = 'revealmessage/circuit.wasm';
const revealvkey= 'revealmessage/verification_key.json';

export default function Reveal({ accounts, setAccounts }) {

    const [alldata, setalldata] = useState("");
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

            header.push(<h4>{header_item}</h4>);
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
                {getAllData(alldata)}
            </div>

        </div>

    )
}
