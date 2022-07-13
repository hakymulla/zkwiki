const React = require('react');
const { groth16 } = require('snarkjs');
const { useState, useEffect } = require('react');
const { ethers } = require('ethers');
// const contractAddress = "0xdf3c7B18d0CaCC49743FC6F2a2237AF297341736";
// const contractAddress = "0x90Cb84baB5699298122b90830fE7674ccB3109eA";  //mainnet
const contractAddress = "0xf32Ba31e9e1c592947e2ccb0b5Dd7961Cce8597B"; //node test


const Message = require('./Message.json');
const revealWasm = 'revealmessage/circuit.wasm';
const revealvkey = 'revealmessage/verification_key.json';



export default function Reveal({ accounts, setAccounts }) {

    const [alldata, setalldata] = useState("");
    const INTERVAL_DELAY = 6000;


    const getMessageStructData = async () => {
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
                const response = await contract.getMessageStruct();
                setalldata(response);

            } catch (err) {
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
            for (let i = 0; i < alldata[0].length + 1; i++) {
                const header_item = alldata[0][i];
                const body_item = alldata[1][i];

                header.push(<h4>{header_item}</h4>);
                header.push(<p>{body_item}</p>);
                header.push(<hr />)
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
