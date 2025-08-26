
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config = {
  solidity: "0.8.20",
  networks: {
    intuition: {
      type: "http", // 👈 required in Hardhat v3
      url: "https://testnet.rpc.intuition.systems",
      chainId: 13579,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};


export default config;
