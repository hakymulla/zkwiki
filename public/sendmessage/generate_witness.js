const wc  = require("./witness_calculator.js");
const { readFileSync, writeFile } = require("fs");


async function generateWitness (input) {
	const buffer = await readFileSync('/Users/Hakeem/Documents/zkpassignment/FinalProject/zk-wiki/public/sendmessage/circuit.wasm');
	let buff;
	await wc(buffer).then(async witnessCalculator => {
		buff = await witnessCalculator.calculateWTNSBin(input, 0);
	});
	return buff;
}

export default generateWitness;