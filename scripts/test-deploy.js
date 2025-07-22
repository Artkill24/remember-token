const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Remember Token deployment and functionality...");
  
  const [owner, alice, bob] = await hre.ethers.getSigners();
  
  console.log(`Testing with accounts:`);
  console.log(`Owner: ${owner.address}`);
  console.log(`Alice: ${alice.address}`);
  console.log(`Bob: ${bob.address}`);
  
  // Deploy contract
  console.log("\n📝 Deploying RememberToken contract...");
  const RememberToken = await hre.ethers.getContractFactory("RememberToken");
  const rememberToken = await RememberToken.deploy();
  await rememberToken.waitForDeployment();
  
  const contractAddress = await rememberToken.getAddress();
  console.log(`✅ Contract deployed to: ${contractAddress}`);
  
  // Test basic functionality
  console.log("\n🔍 Testing basic contract functionality...");
  
  // Check initial state
  const name = await rememberToken.name();
  const symbol = await rememberToken.symbol();
  const totalSupply = await rememberToken.totalSupply();
  const decimals = await rememberToken.decimals();
  
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.formatEther(totalSupply)} ${symbol}`);
  
  // Check contract balance
  const contractBalance = await rememberToken.balanceOf(contractAddress);
  console.log(`Contract Balance: ${hre.ethers.formatEther(contractBalance)} ${symbol}`);
  
  // Test memory creation
  console.log("\n💭 Testing memory creation...");
  const futureDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  
  try {
    const tx = await rememberToken.connect(alice).createMemory(
      bob.address,
      0, // Birthday
      "Bob's birthday party at 7PM",
      futureDate
    );
    
    console.log(`Memory creation tx: ${tx.hash}`);
    await tx.wait();
    
    // Get memory details
    const memory = await rememberToken.getMemory(0);
    console.log(`Memory created successfully:`);
    console.log(`- Rememberer: ${memory.rememberer}`);
    console.log(`- Beneficiary: ${memory.beneficiary}`);
    console.log(`- Description: ${memory.description}`);
    console.log(`- Reward Amount: ${hre.ethers.formatEther(memory.rewardAmount)} ${symbol}`);
    
  } catch (error) {
    console.error(`❌ Memory creation failed: ${error.message}`);
  }
  
  // Test memory type rewards
  console.log("\n💰 Testing memory type rewards...");
  const memoryTypes = [
    { name: "Birthday", id: 0 },
    { name: "Anniversary", id: 1 },
    { name: "Job Interview", id: 2 },
    { name: "Medical Appointment", id: 3 },
    { name: "Major Life Event", id: 4 },
    { name: "Pet Birthday", id: 5 },
    { name: "Graduation", id: 6 },
    { name: "First Date", id: 7 },
    { name: "Funeral", id: 8 }
  ];
  
  for (const memoryType of memoryTypes) {
    try {
      const reward = await rememberToken.memoryTypeRewards(memoryType.id);
      console.log(`${memoryType.name}: ${hre.ethers.formatEther(reward)} ${symbol}`);
    } catch (error) {
      console.error(`❌ Error getting reward for ${memoryType.name}: ${error.message}`);
    }
  }
  
  // Test user memories
  console.log("\n👤 Testing user memories...");
  try {
    const aliceMemories = await rememberToken.getUserMemories(alice.address);
    console.log(`Alice has ${aliceMemories.length} memories`);
    
    const bobMemories = await rememberToken.getUserMemories(bob.address);
    console.log(`Bob has ${bobMemories.length} memories`);
  } catch (error) {
    console.error(`❌ Error getting user memories: ${error.message}`);
  }
  
  // Test stats
  console.log("\n📊 Testing contract stats...");
  try {
    const totalMemories = await rememberToken.getTotalMemories();
    console.log(`Total memories created: ${totalMemories}`);
  } catch (error) {
    console.error(`❌ Error getting total memories: ${error.message}`);
  }
  
  // Test edge cases
  console.log("\n⚠️  Testing edge cases...");
  
  // Try to create memory for self (should fail)
  try {
    await rememberToken.connect(alice).createMemory(
      alice.address,
      0,
      "My own birthday",
      futureDate + 100
    );
    console.log("❌ ERROR: Should not be able to create memory for self");
  } catch (error) {
    console.log("✅ Correctly prevented self-memory creation");
  }
  
  // Try to create memory with past date (should fail)
  try {
    const pastDate = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    await rememberToken.connect(alice).createMemory(
      bob.address,
      0,
      "Past event",
      pastDate
    );
    console.log("❌ ERROR: Should not be able to create memory for past date");
  } catch (error) {
    console.log("✅ Correctly prevented past date memory creation");
  }
  
  // Test verification (fast forward time)
  console.log("\n✅ Testing memory verification...");
  try {
    // Fast forward time in local network
    if (hre.network.name === "hardhat") {
      await hre.network.provider.send("evm_increaseTime", [3700]); // 1 hour + buffer
      await hre.network.provider.send("evm_mine");
      
      // Verify memory
      const verifyTx = await rememberToken.connect(bob).verifyMemory(
        0,
        "Thank you Alice for remembering my birthday! 🎂",
        5 // 5-star rating
      );
      
      await verifyTx.wait();
      console.log("✅ Memory verified successfully");
      
      // Check if Alice received tokens
      const aliceBalance = await rememberToken.balanceOf(alice.address);
      console.log(`Alice's balance after verification: ${hre.ethers.formatEther(aliceBalance)} ${symbol}`);
      
    } else {
      console.log("⏭️  Skipping time-based verification test (not on hardhat network)");
    }
  } catch (error) {
    console.error(`❌ Verification test failed: ${error.message}`);
  }
  
  console.log("\n🎉 All tests completed!");
  console.log(`\n📋 Deployment Summary:`);
  console.log(`- Contract Address: ${contractAddress}`);
  console.log(`- Network: ${hre.network.name}`);
  console.log(`- Chain ID: ${hre.network.config.chainId}`);
  console.log(`- Total Supply: ${hre.ethers.formatEther(totalSupply)} ${symbol}`);
  
  if (hre.network.name !== "hardhat") {
    console.log(`\n🔍 To verify on Basescan:`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
  }
  
  return {
    contractAddress,
    name,
    symbol,
    totalSupply: totalSupply.toString(),
    network: hre.network.name,
    chainId: hre.network.config.chainId
  };
}

main()
  .then((result) => {
    console.log("\n✅ Test deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test deployment failed:");
    console.error(error);
    process.exit(1);
  });