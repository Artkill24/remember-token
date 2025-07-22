const hre = require("hardhat");

async function main() {
  console.log("🎂 Deploying Remember Token to Base Chain...");
  
  // Get network info
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`Network: ${network} (Chain ID: ${chainId})`);
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await hre.ethers.provider.getBalance(deployerAddress);
  
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Balance: ${hre.ethers.formatEther(deployerBalance)} ETH`);
  
  // Check minimum balance for deployment
  const minBalance = hre.ethers.parseEther("0.01"); // 0.01 ETH minimum
  if (deployerBalance < minBalance) {
    throw new Error(`Insufficient balance. Need at least 0.01 ETH for deployment.`);
  }
  
  // Deploy Remember Token contract
  console.log("\n📝 Deploying RememberToken contract...");
  const RememberToken = await hre.ethers.getContractFactory("RememberToken");
  
  // Estimate deployment gas
  const deploymentData = RememberToken.interface.encodeDeploy([]);
  const estimatedGas = await hre.ethers.provider.estimateGas({
    data: deploymentData,
  });
  console.log(`Estimated gas: ${estimatedGas.toString()}`);
  
  // Deploy with gas settings
  const rememberToken = await RememberToken.deploy({
    gasLimit: estimatedGas * 120n / 100n, // Add 20% buffer
  });
  
  // Wait for deployment
  await rememberToken.waitForDeployment();
  const contractAddress = await rememberToken.getAddress();
  
  console.log(`✅ RememberToken deployed to: ${contractAddress}`);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const totalSupply = await rememberToken.totalSupply();
  const name = await rememberToken.name();
  const symbol = await rememberToken.symbol();
  const decimals = await rememberToken.decimals();
  const owner = await rememberToken.owner();
  
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.formatEther(totalSupply)} ${symbol}`);
  console.log(`Owner: ${owner}`);
  
  // Test memory type rewards
  console.log("\n💰 Memory Type Rewards:");
  const memoryTypes = [
    { name: "BIRTHDAY", id: 0 },
    { name: "ANNIVERSARY", id: 1 },
    { name: "JOB_INTERVIEW", id: 2 },
    { name: "MEDICAL_APPOINTMENT", id: 3 },
    { name: "MAJOR_LIFE_EVENT", id: 4 },
    { name: "PET_BIRTHDAY", id: 5 },
    { name: "GRADUATION", id: 6 },
    { name: "FIRST_DATE", id: 7 },
    { name: "FUNERAL", id: 8 }
  ];
  
  for (const memoryType of memoryTypes) {
    const reward = await rememberToken.memoryTypeRewards(memoryType.id);
    console.log(`${memoryType.name}: ${hre.ethers.formatEther(reward)} ${symbol}`);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: network,
    chainId: chainId,
    deployer: deployerAddress,
    contractAddress: contractAddress,
    blockNumber: rememberToken.deploymentTransaction()?.blockNumber,
    transactionHash: rememberToken.deploymentTransaction()?.hash,
    timestamp: new Date().toISOString(),
    gasUsed: estimatedGas.toString(),
    contractName: "RememberToken",
    totalSupply: totalSupply.toString(),
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Contract verification instructions
  if (network !== "hardhat") {
    console.log("\n🔍 To verify the contract on Basescan, run:");
    console.log(`npx hardhat verify --network ${network} ${contractAddress}`);
    
    console.log("\n📱 Frontend Configuration:");
    console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`VITE_CHAIN_ID=${chainId}`);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log(`🌐 View on Basescan: https://${chainId === 8453 ? 'basescan.org' : chainId === 84531 ? 'goerli.basescan.org' : 'sepolia.basescan.org'}/address/${contractAddress}`);
  
  return contractAddress;
}

// Execute deployment
main()
  .then((contractAddress) => {
    console.log(`\n✅ Remember Token deployed successfully at: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });