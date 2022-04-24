const {fs} = require('fs')
const {snarkjs} = require('snarkjs');
const {Buffer} = require('buffer').Buffer;
const { groth16 } = require('snarkjs');
const { readFileSync, writeFile } = require("fs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
// const { generateWitness } = require('/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/generate_witness')

const wc  = require("/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/witness_calculator.js");
const { assert } = require('console');
// const { stringifyBigInts, prove, verify, formatMessage, getCallData } = require('/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/ts/utils');
const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);



const sendzkey = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/circuit_final.zkey'
const sendWasm = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/circuit.wasm';
const sendvkey= '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/verification_key.json';

const revealzkey = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/revealmessage/circuit_final.zkey'
const revealWasm = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/revealmessage/circuit.wasm';
const revealvkey= '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/revealmessage/verification_key.json';

async function generateWitness (input) {
	const buffer = await readFileSync(sendWasm);
	let buff;

	await wc(buffer).then(async witnessCalculator => {
		buff = await witnessCalculator.calculateWTNSBin(input, 0);
	});
	return buff;
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

describe("SendMessage", function () {
  it("SendMessage and Reveal Message Circuit", async function () {
    const secret = BigInt(1);
    const salt = BigInt(2);
    const msg = JSON.stringify({
        msgheader: "the title",
    });

    const input = {
        secret,
        salt,
        msgheader: formatMessage(msg),   
    };

    let generateWitnessSuccess = true;
    let witness = await generateWitness(input).then()
    .catch((error) => {
        console.error("ERROR:  ",error);
        generateWitnessSuccess = false;
    });

    const { proof, publicSignals } = await groth16.prove(sendzkey, witness);
    // console.log("Proof: ", proof);
    // console.log("Pub: ", publicSignals);

    const vKey = JSON.parse(readFileSync(sendvkey));
    const res = await groth16.verify(vKey, publicSignals, proof);
    const msgHash = publicSignals[0]
    console.log("msgHash: ", msgHash)
    console.log("Res: ", res)

    const calldata = await getCallData(proof, publicSignals);
    // console.log(calldata);

    // Reveal Message
    const reveal_input = {
        secret,
        salt,
        msgheader: formatMessage(msg),   
        msgHash
    };
    // const { reveal_proof, reveal_publicSignals } 
    const reveal = await groth16.fullProve(reveal_input, revealWasm, revealzkey);
    
    const reveal_vKey = JSON.parse(readFileSync(revealvkey));
    const reveal_result = await groth16.verify(reveal_vKey, reveal.publicSignals, reveal.proof);
    console.log(reveal_result);
    assert(reveal_result == true)

  });
});
