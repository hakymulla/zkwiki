//import * as crypto from 'crypto';
import fs from 'fs';

const snarkjs = require('snarkjs');
import { ethers } from 'ethers';
// import MIMC from './mimc'
const Buffer = require('buffer').Buffer;
console.log("src/utils.js", process.env.PWD)


// let snarkjs;

// circom files
const sendZkey = './static/sendmessage/circuit_0001.zkey';
const sendWasm = './static/sendmessage/circuit.wasm';
// const signWitnessFile = './static/sendmessage/sign/witness.wtns';
const sendVkey = './static/sendmessage/verification_key.json';


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

const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);

async function prove(inputs, circuitType) {
    let wasm;
    let zkey;
    inputs = stringifyBigInts(inputs);
    if (circuitType === 'send'){
        wasm = sendWasm;
        zkey = sendZkey;
    } 
    else {
        return { proof: null, publicSignals: null};
    }
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        wasm,
        zkey,
    );
    
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

function keccak(str) { // ethers.utils.toUtf8Bytes(str)
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

function formatMessage(str) { // ethers.utils.toUtf8Bytes(str)
    return BigInt(ethers.utils.solidityKeccak256(["string"], [str])) % SNARK_FIELD_SIZE;
}



export {
    stringifyBigInts,
    prove,
    verify,
    keccak,
    getCallData,
    formatMessage
}