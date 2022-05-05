import { ethers} from 'ethers';
import BigInt from 'big-integer';
const { groth16 } = require('snarkjs');
// const { keccak256 } = require('ethers/lib/utils');

// circom files
const sendzkey = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/circuit_final.zkey'
const sendWasm = '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/circuit.wasm';
const sendvkey= '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/verification_key.json';



const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);


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

// const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);

// async function prove(inputs, circuitType) {
//     let wasm;
//     let zkey;
//     inputs = stringifyBigInts(inputs);
//     if (circuitType === 'send'){
//         wasm = sendWasm;
//         zkey = sendzkey;
//     } 
//     else {
//         return { proof: null, publicSignals: null};
//     }
//     const { proof, publicSignals } = await groth16.fullProve(
//         inputs,
//         wasm,
//         zkey,
//     );
    
//     return {proof, publicSignals};
    
// }

// async function verify(proof, publicSignals, circuitType) { 
//     let vkeyFile;
//     if (circuitType == 'send'){
//         vkeyFile = sendVkey;
//     } else {
//         return null;
//     }
//     let resp = await fetch(vkeyFile);
//     let vKey = await resp.json();
//     const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
//     return res;
//   }

function keccak(str) { // ethers.utils.toUtf8Bytes(str)
    return (BigInt(ethers.utils.solidityKeccak256(["string"], [str])% SNARK_FIELD_SIZE)).value;
}


function formatMessage(str) { 
    return BigInt((ethers.utils.solidityKeccak256(["string"], [str])) % SNARK_FIELD_SIZE);
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




export {
    // stringifyBigInts,
    // prove,
    // verify,
    keccak,
    getCallData,
    formatMessage
}