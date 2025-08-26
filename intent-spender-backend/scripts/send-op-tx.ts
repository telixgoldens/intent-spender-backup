import hre from "hardhat";

async function main() {
  console.log("Sending transaction using the OP chain type");

  // ✅ get signer from Hardhat Runtime Environment
  const [sender] = await hre.ethers.getSigners();

  console.log("Sending 1 wei from", sender.address, "to itself");

  // ✅ send tx
  const tx = await sender.sendTransaction({
    to: sender.address,
    value: 1n, // BigInt in TS
  });

  await tx.wait();
  console.log("Transaction sent successfully, hash:", tx.hash);
}

// ✅ standard error handler
main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
