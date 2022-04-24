// import { stringifyBigInts, prove, verify, formatMessage, getCallData } from './utils'
// import assert from 'assert';
// const assert = require('assert');
// const { assert } = require('chai');
const utils = require('../ts/utils');
// const path = require('path');
// import { Proof } from '../ts/types'
// import MIMC from "../ts/mimc"
const fs = require('fs')
const snarkjs = require('snarkjs');
const Buffer = require('buffer').Buffer;

console.log(process.env.PWD)
import { generateWitness } from '/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/generate_witness';
import { groth16 } from 'snarkjs';


// const test = async () => {

//     const secret = BigInt(1);
//     const salt = BigInt(2);
//     const msgheader = JSON.stringify({
//         title: "the title",
//     });

//     // console.log("secret : salt", secret, salt, msgheader)

//     const input = {
//         secret,
//         salt,
//         msgheader: utils.formatMessage(msgheader),
//     }

//     // console.log("input", input)
//     // const newinput = { "secret":BigInt(123), "salt":BigInt(11), "msgheader":BigInt(11)};
//     const newinput = { secret:BigInt(123), salt:BigInt(11), msgheader:BigInt(13)};

    

//     let result =  await utils.prove(input, sendWasm, sendZkey);
//     console.log(result.proof);

//     // console.log(await utils.verify(result.proof, result.publicSignals, 'send'));
//     // let calldata = await getCallData(result.proof, result.publicSignals);
//     // const msgAttestation = result.publicSignals[0];
//     // console.log(calldata);

// }

// export async function generateCalldata(in_array) {

const test = async () => {
    const input = { secret:BigInt(123), salt:BigInt(11), msgheader:BigInt(11)};

    let generateWitnessSuccess = true;

    console.log("test1");

    let witness = await generateWitness(input).then()
        .catch((error) => {
            console.log("test2");
            console.error("ERROR:  ",error);
            generateWitnessSuccess = false;
        });
    
    console.log("Witness: ", witness);
    console.log("generateWitnessSuccess", generateWitnessSuccess);

    if (!generateWitnessSuccess) { return; }
    let proof = await groth16.prove('/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/circuit_final.zkey', witness).then()
    .catch((error) => {
        console.error("ERROR:  ",error);
        generateWitnessSuccess = false;
    });

    console.log("generateWitnessSuccess", generateWitnessSuccess);

    // const { proof, publicSignals } = await groth16.prove('/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/circuit_final.zkey', witness);
    console.log("Proof: ", proof);
    console.log("Pub: ", publicSignals);
}
test();