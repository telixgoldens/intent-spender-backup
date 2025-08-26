import { ethers } from "ethers";
import abiJson from "./IntentSpenderMulti.json"; // path to ABI

// Deployed contract address (from your Hardhat deploy log)
const CONTRACT_ADDRESS = "0x85dE3b7B75589f450F24BBfe0c02066a38716c37";

export function getContract() {
  if (!window.ethereum) throw new Error("No crypto wallet found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, abiJson, signer);
}
