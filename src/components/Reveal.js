
const React = require('react');
const {useState, useEffect} = require('react');
const { ethers, BigNumber } = require('ethers');
const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const Message  = require('../artifacts/contracts/Message.sol/Message.json');
const { keccak, formatMessage } = require('../utils');

const msgHash = "7131043295314598378192828864958545486842576555452800947213369630202796374561"
const reveal_calldata_a = [
  '0x2ba5a7b48fcd504b945e243d86a648098e36be803a6de93cf517afb09bd339c9',
  '0x0f4a06ab91a705b673cfce39e2d1bb6f713db4dac05ac9ca40d4cd8dd9bc223d'
]
const reveal_calldata_b =[
  [
    '0x010fdcae3d202c0797d641180e5455a182ceb712cd4ac9de837c0165097860df',
    '0x0fd92ed4944c3a60f8ecfd2f0b1985015d0587e35ffd999e945991f1b469346b'
  ],
  [
    '0x0465f014d2ebe115f57a9df97f82939d7d081293f53c0250341fa9ddcada3da4',
    '0x10e55baffeaa23d4b9b796ec7293c210e57f2d627061a8fdd242eeff28a1707c'
  ]
]
const reveal_calldata_c = [
  '0x0492c785da302176be71455b6aaac9f5e522362d0c738050f874f2ed1d25137b',
  '0x18ffe9d00271af7050580e80cb8b42187f2a09a54f701e3340fe8681062a6f70'
]
const reveal_calldata_input =[
  '0x15307bb4774cfd2f305394fb0686e79d9b630211f6a1bf49e581d32f83a3956a',
  '0x0fc40708849b20b3db5b985e2c7d920e8252e039d09a189f086300405802fa21'
]

const msgbody = "This file of tXYZ can be found on blablabla.com";

export default function Reveal({ accounts, setAccounts }) {

    const [alldata, setalldata] = useState("");
    const [msgHeader, setMsgHeader] = useState("");
    const [msgHash, setMsgHash] = useState("");
    const [secret, setSecret] = useState("");
    const [salt, setSalt] = useState("");
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
                const reveal_input = {
                    secret:keccak(secret),
                    salt: keccak(salt),
                    msgheader:keccak(msgHeader),
                    msgHash
                }
                console.log(reveal_input);
                // const reveal = await groth16.fullProve(reveal_input, revealWasm, revealzkey);
                // const reveal_calldata = await getCallData(reveal.proof, reveal.publicSignals);
                const msgbody = localStorage.getItem('msgBody');
                const reveal_result = await contract.revealMessage(msgbody, reveal_calldata_a, reveal_calldata_b, reveal_calldata_c, reveal_calldata_input);

            }catch (err) {
                console.log("error:", err)
            }
        }
    }
    const display = async() => {}

    const handleMsgHeader = (e) => {
        setMsgHeader(e.target.value);
    }

    const handleMsgHash = (e) => {
        setMsgHash(e.target.value);
    }


    const handleSecret = (e) => {
        setSecret(e.target.value);
    }

    const handleSalt = (e) => {
        setSalt(e.target.value);
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
                    value={msgHeader}
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
                    value={secret}
                />
                <input 
                    type="text"
                    placeholder="Salt"
                    className="form--input"
                    onChange={handleSalt}
                    value={salt}
                />
               

                <button className="form--button" onClick={handleReveal}>Reveal</button>
            </form >
                    
                </revealer>
            
            </div>

        </div>

    )
}
