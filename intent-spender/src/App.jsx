import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
// import Web3Modal from "web3modal";
import IntentForm from "./components/IntentForm";
import ABI from "./IntentSpenderMulti.json"; // Add ABI from Solidity compile
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CONTRACT_ADDRESS = "0x85dE3b7B75589f450F24BBfe0c02066a38716c37"; // Replace with deployed contract

// ✅ Trust Testnet config
const trustTestnetParams = {
  chainId: "0x350B", // 13579 in hex
  chainName: "Intuition Testnet",
  nativeCurrency: {
    name: "Test Trust",
    symbol: "TTRUST",
    decimals: 18,
  },
  rpcUrls: ["https://testnet.rpc.intuition.systems"],
  blockExplorerUrls: ["https://testnet.explorer.intuition.systems"],
};

// async function switchToTrustTestnet() {
//   try {
//     await window.ethereum.request({
//       method: "wallet_switchEthereumChain",
//       params: [{ chainId: trustTestnetParams.chainId }],
//     });
//   } catch (switchError) {
//     if (switchError.code === 4902) {
//       await window.ethereum.request({
//         method: "wallet_addEthereumChain",
//         params: [trustTestnetParams],
//       });
//     } else {
//       console.error("Failed to switch to Trust Testnet:", switchError);
//     }
//   }
// }

function App() {
  const [contract, setContract] = useState(null);
  const [log, setLog] = useState([]);
  const [address, setAddress] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("❌ Please install MetaMask");
      return;
    }
    try{
       // First ensure we are on Trust Testnet
    const chainIdHex = trustTestnetParams.chainId; // 13579 in hex
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError) {
      // If the chain is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [trustTestnetParams],
        });
      } else {
        throw switchError;
      }
    }


      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const cont = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setContract(cont);
      setAddress(accounts[0]);
      toast.success(`✅ Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    }catch (err) {
      console.error(err);
      toast.error("❌ Wallet connection failed");
    }

  };
// Auto-reconnect on refresh
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const cont = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
          setContract(cont);
          setAddress(accounts[0]);
        }
      } catch (err) {
        console.error("Auto-connect failed:", err);
      }
    };

    checkConnection();

    // Handle account change
    window.ethereum?.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        setContract(null);
        toast.info("🔌 Disconnected");
      } else {
        setAddress(accounts[0]);
        toast.info(`🔄 Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        checkConnection();
      }
    });

    // Handle network change
    window.ethereum?.on("chainChanged", () => {
      window.location.reload();
    });

    return () => {
      window.ethereum?.removeAllListeners("accountsChanged");
      window.ethereum?.removeAllListeners("chainChanged");
    };
  }, []);

  const executeIntent = async (intent) => {
    if (!contract){
      toast.error("❌ Connect wallet first"); return;
      return
    }
    try {
     const tx = await contract.executeIntentETH(
          intent.recipient,
          ethers.parseEther(intent.amount.toString()),
          intent.note
        );
        await tx.wait();
        toast.success(`✅ Sent ${intent.amount} TTRUST to ${intent.recipient}`);
        setLog((prev) => [...prev, `Sent ${intent.amount} TTRUST to ${intent.recipient}`]);
      
    } catch (err) {
      console.error(err);
      toast.error(`❌ Transaction failed: ${err.message}`);
      setLog((prev) => [...prev, `Error: ${err.message}`]);
    }
  };

  return (
    <div className="app-container" style={{ padding: "2rem" }}>
      <h1>Intent-Based Spender</h1>
      <button onClick={connectWallet}> {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
      </button>
      <IntentForm executeIntent={executeIntent} />
      <div style={{ marginTop: "2rem" }}>
        <h2>Activity Log:</h2>
        {log.map((entry, idx) => <div key={idx}>{entry}</div>)}
      </div>
    </div>
  );
}
<ToastContainer position="top-right" autoClose={4000} />


export default App;
