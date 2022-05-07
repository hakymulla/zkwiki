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

function formatMessage(str) { 
    return BigInt(ethers.utils.solidityKeccak256(["string"], [str])) % SNARK_FIELD_SIZE;
}

async function getCallData(proof, publicSignals){
    const editedProof = unstringifyBigInts(proof);
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const calldata = await groth16.exportSolidityCallData(
        editedProof,
        editedPublicSignals
      );
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
    const msgheader = "the title";
    const msgbody = "This is the body";
    const msg = JSON.stringify({msgheader: msgheader});
    const input = {secret, msgheader: formatMessage(msg),};

    const send = await groth16.fullProve(input, sendWasm, sendzkey);
    const { _a, _b, _c, _input} = await getCallData(send.proof, send.publicSignals);
    
    expect(await message.messages[0]).to.equal(undefined);
    const result = await message.sendMessage(msgheader, _a, _b, _c, _input);
    var output = await message.messages(0);
    expect(output.isrevealed).to.equal(false);

    const msgcount = await message.msgCount();
    expect(msgcount.toString()).to.equal("1");
  });


    it("Reveal Message Hash from the contract", async function () {
    const secret = BigInt(1);
    const msgheader = "the titlemessage header";
    const msgbody = "This is the body"; // this is stored off chain and retrived while revealing
    const msg = JSON.stringify({msgheader: msgheader});
    const input = {secret,msgheader: formatMessage(msg),};

    const send = await groth16.fullProve(input, sendWasm, sendzkey);
    const { _a, _b, _c, _input} = await getCallData(send.proof, send.publicSignals);
    
    expect(await message.messages[0]).to.equal(undefined);
    
    const result = await message.sendMessage(msgheader, _a, _b, _c, _input);
    var output = await message.messages(0);

    const vKey = JSON.parse(readFileSync(sendvkey));
    const msgHash = send.publicSignals[0];

    const reveal_input = {
        secret,
        msgheader: formatMessage(msg),   
        msgHash
    };

    const reveal = await groth16.fullProve(reveal_input, revealWasm, revealzkey);
    const reveal_calldata = await getCallData(reveal.proof, reveal.publicSignals);
    const reveal_result = await message.revealMessage(msgbody, reveal_calldata._a, reveal_calldata._b, reveal_calldata._c, reveal_calldata._input);
    var output = await message.messages(0);
    expect(output.isrevealed).to.equal(true);

  });

    it("Send Multiple Messages and Reveal Message Hash from the contract", async function () {
    const secret = BigInt(1);
    const msgheader = "the title";
    const msgbody = "This is the body"; // this is stored off chain and retrived while revealing
    const msg = JSON.stringify({msgheader: msgheader});
    const input = {secret,msgheader: formatMessage(msg),};

    const secret1 = BigInt(1);
    const msgheader1 = "the title 2";
    const msgbody1 = "This is the second body"; // this is stored off chain and retrived while revealing
    const msg1 = JSON.stringify({msgheader: msgheader1});
    const input1 = {secret:secret1, msgheader: formatMessage(msg1),};

    const send = await groth16.fullProve(input, sendWasm, sendzkey);
    const { _a, _b, _c, _input} = await getCallData(send.proof, send.publicSignals);

    const send1 = await groth16.fullProve(input1, sendWasm, sendzkey);
    const calldata1 = await getCallData(send1.proof, send1.publicSignals);

    expect(await message.messages[0]).to.equal(undefined);
    
    const result = await message.sendMessage(msgheader, _a, _b, _c, _input);
    var output = await message.messages(0);

    const result1 = await message.sendMessage(msgheader1, calldata1._a, calldata1._b, calldata1._c, calldata1._input);
    var output = await message.messages(1);

    const vKey = JSON.parse(readFileSync(sendvkey));
    const msgHash = send.publicSignals[0];
    const msgHash1 = send1.publicSignals[0];

    const reveal_input = {
        secret,
        msgheader: formatMessage(msg),   
        msgHash
    };

    const reveal_input1 = {
        secret:secret1,
        msgheader: formatMessage(msg1),   
        msgHash:msgHash1
    };


    const reveal = await groth16.fullProve(reveal_input, revealWasm, revealzkey);
    const reveal_calldata = await getCallData(reveal.proof, reveal.publicSignals);
    const reveal_result = await message.revealMessage(msgbody, reveal_calldata._a, reveal_calldata._b, reveal_calldata._c, reveal_calldata._input);
    var output = await message.messages(0);
    expect(output.isrevealed).to.equal(true);

    const reveal1 = await groth16.fullProve(reveal_input1, revealWasm, revealzkey);
    const reveal_calldata1 = await getCallData(reveal1.proof, reveal1.publicSignals);
    const reveal_result1 = await message.revealMessage(msgbody1, reveal_calldata1._a, reveal_calldata1._b, reveal_calldata1._c, reveal_calldata1._input);
    var output = await message.messages(1);
    expect(output.isrevealed).to.equal(true);

    const msgcount = await message.msgCount();
    expect(msgcount.toString()).to.equal("2");

    const allmsg = await message.getMessageStruct();

  });


    it("Just for test", async function () {
    const secret = formatMessage("secret");
    const msgheader = "the title";
    const msgbody = "This is the body";
    const msg = JSON.stringify({msgheader: msgheader});
    const input = {secret,msgheader: formatMessage(msg),};

    const send = await groth16.fullProve(input, sendWasm, sendzkey);
    
    const { _a, _b, _c, _input} = await getCallData(send.proof, send.publicSignals);
    expect(await message.messages[0]).to.equal(undefined);

    const result = await message.sendMessage(msgheader, _a, _b, _c, _input);
    var output = await message.messages(0);
    expect(output.isrevealed).to.equal(false);

    const msgHash = send.publicSignals[0];
    const reveal_input = {
        secret,
        msgheader: formatMessage(msg),   
        msgHash
    };

    const reveal = await groth16.fullProve(reveal_input, revealWasm, revealzkey);
    const reveal_calldata = await getCallData(reveal.proof, reveal.publicSignals);
    const reveal_result = await message.revealMessage(msgbody, reveal_calldata._a, reveal_calldata._b, reveal_calldata._c, reveal_calldata._input);

    var output = await message.messages(0);
    expect(output.isrevealed).to.equal(true);

  });

});
