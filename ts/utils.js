// import { strict as assert } from 'assert';
// import * as crypto from 'crypto';
const snarkjs = require('snarkjs');
const fs = require('fs')
const ff = require('ffjavascript');

const { ethers } = require('ethers');
const Buffer = require('buffer').Buffer;


// const sendZkey = 'public/sendmessage/circuit_final.zkey';
// const sendWasm = 'public/sendmessage/circuit.wasm';

const sendZkey = 'src/static/sendmessage/circuit_final.zkey';
const sendWasm = 'src/static/sendmessage/circuit.wasm';

// const signWitnessFile = './static/sendmessage/sign/witness.wtns';
const sendVkey = './src/static/sendmessage/verification_key.json';

// const stringifyBigInts: (obj) = ff.utils.stringifyBigInts
const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);

// const buffer = fs.readFileSync(sendZkey);
// console.log(buffer);

function stringifyBigInts(o) {
    if ((typeof(o) == "bigint") || o.eq !== undefined)  {
        return o.toString(10);
    } else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = stringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
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

async function prove(inputs, circuitType) {
    let wasm;
    let zkey;
    inputs = stringifyBigInts(inputs);
    // if (circuitType === 'send'){
    //     wasm = sendWasm;
    //     zkey = sendZkey;
    // } 
    // else {
    //     return { proof: null, publicSignals: null};
    // }
    console.log("test");
    console.log(inputs);
    console.log(sendWasm);
    console.log(sendZkey);
    console.log(await snarkjs.groth16);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        sendWasm,
        sendZkey,
    );

    console.log("proof", proof);
    console.log("Public", publicSignals);

        
    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));
    
    return {proof, publicSignals};
    
}

async function verify(proof, publicSignals, circuitType) { 
    let vkeyFile;
    if (circuitType == 'send'){
        vkeyFile = sendVkey;
    } else {
        return null;
    }
    let resp = await fetch(vkeyFile);
    let vKey = await resp.json();
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    return res;
  }

  function formatMessage(str) { // ethers.utils.toUtf8Bytes(str)
    return BigInt(ethers.utils.solidityKeccak256(["string"], [str])) % SNARK_FIELD_SIZE;
}

async function getCallData(proof, publicSignals){
    const editedProof = unstringifyBigInts(proof);
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const calldata = await snarkjs.groth16.exportSolidityCallData(
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

// export {
//     stringifyBigInts,
//     prove,
//     verify,
//     formatMessage,
//     getCallData
// }
