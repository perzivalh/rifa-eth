const { ethers } = require("hardhat");

async function main() {
  const goal = ethers.parseEther("1.0"); // Meta 1 ETH
  const durationInHours = 24 * 7; // 7 días

  const CharityRaffle = await ethers.getContractFactory("CharityRaffle");
  const raffle = await CharityRaffle.deploy(goal, durationInHours);

  await raffle.waitForDeployment();

  console.log("CharityRaffle deployed to:", await raffle.getAddress());

  const contractData = {
    address: await raffle.getAddress(),
    abi: JSON.parse(raffle.interface.formatJson())
  };

  console.log("Contract data for frontend:", JSON.stringify(contractData, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
