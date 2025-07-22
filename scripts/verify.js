const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying Remember Token contract on Basescan...");
  
  // Get contract address from environment or command line
  const contractAddress = process.env.CONTRACT_ADDRESS || process.argv[2];
  
  if (!contractAddress) {
    console.error("❌ Contract address is required");
    console.log("Usage: npm run verify CONTRACT_ADDRESS");
    console.log("Or set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }
  
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${hre.network.name}`);
  
  try {
    // Verify the contract
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // RememberToken has no constructor arguments
    });
    
    console.log("✅ Contract verified successfully!");
    
    const network = hre.network.name;
    let explorerUrl;
    
    switch (network) {
      case 'base-mainnet':
        explorerUrl = `https://basescan.org/address/${contractAddress}`;
        break;
      case 'base-goerli':
        explorerUrl = `https://goerli.basescan.org/address/${contractAddress}`;
        break;
      case 'base-sepolia':
        explorerUrl = `https://sepolia.basescan.org/address/${contractAddress}`;
        break;
      default:
        explorerUrl = `https://basescan.org/address/${contractAddress}`;
    }
    
    console.log(`🌐 View on Basescan: ${explorerUrl}`);
    
  } catch (error) {
    console.error("❌ Verification failed:");
    console.error(error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  Contract is already verified");
    } else if (error.message.includes("does not match")) {
      console.log("💡 Make sure you're using the correct network and contract address");
    } else if (error.message.includes("API key")) {
      console.log("🔑 Make sure BASESCAN_API_KEY is set in your .env file");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });