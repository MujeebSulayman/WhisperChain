import { run } from "hardhat";

async function main() {
  const contractAddress = "0xCCA7f351fA1689b33F22b66A8a69509F6b428718";
  
  console.log("Verifying WhisperChain contract...");
  console.log(`Address: ${contractAddress}`);
  
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    
    console.log("Contract verified successfully!");
    console.log(`View on Basescan: https://sepolia.basescan.org/address/${contractAddress}`);
    
  } catch (error) {
    if (error instanceof Error) {
      console.log("Verification failed:", error.message);
    } else {
      console.log("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
