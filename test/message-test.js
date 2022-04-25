const { expect } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require('snarkjs');

const { readFileSync, writeFile } = require("fs");

const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);

const sendzkey = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/circuit_final.zkey'
const sendWasm = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/circuit.wasm';
const sendvkey= '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/verification_key.json';

const revealzkey = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/revealmessage/circuit_final.zkey'
const revealWasm = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/revealmessage/circuit.wasm';
const revealvkey= '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/revealmessage/verification_key.json';

function formatMessage(str) { // ethers.utils.toUtf8Bytes(str)
    return BigInt(ethers.utils.solidityKeccak256(["string"], [str])) % SNARK_FIELD_SIZE;
}

async function getCallData(proof, publicSignals){
    const editedProof = unstringifyBigInts(proof);
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const calldata = await groth16.exportSolidityCallData(
        editedProof,
        editedPublicSignals
      );
    //console.log(calldata);
    const calldataSplit = calldata.split(",");
    let _a = eval(calldataSplit.slice(0, 2).join());
    let _b = eval(calldataSplit.slice(2, 6).join());
    let _c = eval(calldataSplit.slice(6, 8).join());
    let _input = eval(calldataSplit.slice(8).join());
    return {
        _a,
        _b,
        _c,
        _input
    };
}

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("Message", function () {
    let message;
    beforeEach(async () => {
        const Send = await hre.ethers.getContractFactory("SendVerifier");
        const send = await Send.deploy();
        await send.deployed();

        const Reveal = await hre.ethers.getContractFactory("RevealVerifier");
        const reveal = await Reveal.deploy();
        await reveal.deployed();

        const Message = await hre.ethers.getContractFactory("Message");
        message = await Message.deploy(send.address, reveal.address);
        await message.deployed();
        console.log("Message deployed to:", message.address);
    });

  it("Send Message Hash to the contract", async function () {
    const secret = BigInt(1);
    const salt = BigInt(2);
    const msg = JSON.stringify({msgheader: "the title",});
    const input = {secret,salt,msgheader: formatMessage(msg),};

    const secret2 = BigInt(1);
    const salt2 = BigInt(2);
    const msg2 = JSON.stringify({msgheader: "the title 2",});
    const input2 = {secret:secret2, salt:salt2, msgheader: formatMessage(msg2),};

    const send = await groth16.fullProve(input, sendWasm, sendzkey);
    const { _a, _b, _c, _input} = await getCallData(send.proof, send.publicSignals);
    
    expect(await message.messages[0]).to.equal(undefined);

    const result = await message.sendMessage(_a, _b, _c, _input);
    console.log(_input[0]);
    var output = await message.messages(0);
    console.log(output);

    console.log("REVEAL   : ")
    const vKey = JSON.parse(readFileSync(sendvkey));
    const msgHash = send.publicSignals[0];

    const reveal_input = {
        secret,
        salt,
        msgheader: formatMessage(msg),   
        msgHash
    };

    const reveal = await groth16.fullProve(reveal_input, revealWasm, revealzkey);
    const reveal_calldata = await getCallData(reveal.proof, reveal.publicSignals);
    // console.log(reveal_calldata._a, reveal_calldata._input)
    console.log(reveal_calldata);
    const reveal_result = await message.revealMessage(reveal_calldata._a, reveal_calldata._b, reveal_calldata._c, reveal_calldata._input);
    var output = await message.messages(0);
    console.log(output);


  });
});
