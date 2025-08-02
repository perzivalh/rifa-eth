const { ethers } = require("hardhat");

async function main() {
  // Configuración de la rifa: meta de 1 ETH y duración de 7 días
  const goal = ethers.parseEther("1.0");
  const durationInHours = 24 * 7; // 1 semana
  
  const CharityRaffle = await ethers.getContractFactory("CharityRaffle");
  const raffle = await CharityRaffle.deploy(goal, durationInHours);
  
  await raffle.waitForDeployment();

  console.log("CharityRaffle deployed to:", await raffle.getAddress());
  
  // Exportar ABI y dirección para el frontend
  const contractData = {
    address: await raffle.getAddress(),
    abi: JSON.parse(raffle.interface.formatJson())
  };
  
  // Esto deberías guardarlo en tu frontend (usando fs o manualmente)
  console.log("Contract data for frontend:", JSON.stringify(contractData, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });