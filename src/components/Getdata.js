const React = require('react');
const useState = require('react');
const { ethers, BigNumber } = require('ethers');
const contractAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
const Message  = require('../artifacts/contracts/Message.sol/Message.json');


export async function Getdata({ accounts, setAccounts }) {

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
                const response = await contract.getMessageStruct();
                const data =  response.toString()
                // console.log("Response:", response);
                return data ;

            }catch (err) {
                console.log("error:", err)
            }
        }
    }

}
