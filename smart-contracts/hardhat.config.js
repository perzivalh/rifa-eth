require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/0a1d4eeb5ca04c0c9cc91c537db607bd",
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      chainId: 11155111,
    },
  },
};
