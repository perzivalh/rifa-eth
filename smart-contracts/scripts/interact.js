const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "DIRECCION_DEL_DEPLOY"; // copiala del deploy.js
  const CharityRaffle = await ethers.getContractFactory("CharityRaffle");
  const raffle = await CharityRaffle.attach(contractAddress);

  // Simulá una compra de boletos desde una cuenta secundaria
  const [owner, user1] = await ethers.getSigners();

  const tx = await raffle.connect(user1).buyTickets(2, "usuarioTest", {
    value: ethers.parseEther("0.01")
  });
  await tx.wait();

  console.log("Boletos comprados por usuarioTest");
}
main();
