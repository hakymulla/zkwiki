const hre = require("hardhat");

async function main() {

  // const Pairing = await ethers.getContractFactory("PairingLibrary");
  // const pairing = await Pairing.deploy();
  const Send = await hre.ethers.getContractFactory("SendVerifier");
  const send = await Send.deploy();
  await send.deployed();
  console.log("SendMessage deployed to:", send.address);

  const Reveal = await hre.ethers.getContractFactory("RevealVerifier");
  const reveal = await Reveal.deploy();
  await reveal.deployed();
  console.log("SendMessage deployed to:", reveal.address);

  const Message = await hre.ethers.getContractFactory("Message");
  const message = await Message.deploy(send.address, reveal.address);
  await message.deployed();
  console.log("Message deployed to:", message.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
