// scripts/deploy.js
import hre from "hardhat";

async function main() {
  // Always go through hre.ethers in Hardhat v3
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  const ContractFactory = await hre.ethers.getContractFactory("IntentSpenderMulti");
  const contract = await ContractFactory.deploy();
  
  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  });

