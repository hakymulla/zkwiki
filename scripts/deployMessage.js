const hre = require("hardhat");

async function main() {


  const Send = await hre.ethers.getContractFactory("SendVerifier");
  const send = await Send.deploy();
  await send.deployed();
  console.log("SendMessage deployed to:", send.address);

  const Message = await hre.ethers.getContractFactory("Message");
  const message = await Message.deploy(send.address);
  await message.deployed();
  console.log("Message deployed to:", message.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
