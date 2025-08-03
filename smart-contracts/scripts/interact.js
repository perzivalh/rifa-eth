const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x04e63b4Ef4732bED02DdAef0544963ECbd1F2c19"; // Actualiza aquí

  const signers = await ethers.getSigners();
  const user1 = signers[1];

  const CharityRaffle = await ethers.getContractFactory("CharityRaffle", user1);
  const raffle = CharityRaffle.attach(contractAddress);

  const tx = await raffle.buyTickets(2, "usuarioTest", {
    value: ethers.parseEther("0.0002")
  });

  await tx.wait();

  console.log("Boletos comprados por usuarioTest");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
