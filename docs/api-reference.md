# Remember Token API Reference
## Smart Contract Integration Guide

**Version 1.0 | January 2025**

---

## Contract Information

**Contract Address (Base Mainnet)**: `[To be filled after deployment]`
**Contract Address (Base Testnet)**: `[To be filled after deployment]`
**ABI**: Available in `/artifacts/contracts/RememberToken.sol/RememberToken.json`

---

## Core Functions

### Memory Management

#### `createMemory(address beneficiary, uint8 memoryType, string description, uint256 scheduledDate)`

Creates a new memory for someone else.

**Parameters:**
- `beneficiary` (address): Wallet address of person to remember
- `memoryType` (uint8): Type of memory (0-8, see Memory Types)
- `description` (string): What to remember
- `scheduledDate` (uint256): Unix timestamp of event

**Returns:** `uint256` - Memory ID

**Events Emitted:** `MemoryCreated`

**Example:**
```javascript
const tx = await contract.createMemory(
  "0x742d35Cc6839C4532CE58b6c1fa9d369C1234567",
  0, // Birthday
  "John's 30th birthday party",
  1735689600 // Jan 1, 2025
);
```

#### `verifyMemory(uint256 memoryId, string proof, uint256 rating)`

Verify that someone remembered you (beneficiary only).

**Parameters:**
- `memoryId` (uint256): ID of memory to verify
- `proof` (string): Optional message/proof
- `rating` (uint256): How meaningful it was (1-5)

**Events Emitted:** `MemoryVerified`, `TokensRewarded`

**Example:**
```javascript
await contract.verifyMemory(
  0,
  "Thank you for remembering! 💝",
  5
);
```

#### `getMemory(uint256 memoryId)`

Get details of a specific memory.

**Returns:** Memory struct with all details

**Example:**
```javascript
const memory = await contract.getMemory(0);
console.log(memory.description); // "John's 30th birthday party"
```

#### `getUserMemories(address user)`

Get all memory IDs created by a user.

**Returns:** `uint256[]` - Array of memory IDs

---

### Token Functions (ERC20)

#### `balanceOf(address account)`

Get token balance of an account.

**Returns:** `uint256` - Token balance in wei

#### `transfer(address to, uint256 amount)`

Transfer tokens to another address.

#### `approve(address spender, uint256 amount)`

Approve someone to spend your tokens.

---

### View Functions

#### `getTotalMemories()`

Get total number of memories created.

**Returns:** `uint256`

#### `getTotalVerifications()`

Get total number of verified memories.

**Returns:** `uint256`

#### `memoryTypeRewards(uint8 memoryType)`

Get reward amount for memory type.

**Returns:** `uint256` - Reward in wei

---

## Memory Types

| ID | Type | Default Reward | Use Case |
|----|------|----------------|----------|
| 0 | Birthday | 10 $RMEM | Personal celebrations |
| 1 | Anniversary | 15 $RMEM | Relationship milestones |
| 2 | Job Interview | 20 $RMEM | Career support |
| 3 | Medical Appointment | 25 $RMEM | Health check-ins |
| 4 | Major Life Event | 30 $RMEM | Weddings, graduations |
| 5 | Pet Birthday | 8 $RMEM | Pet celebrations |
| 6 | Graduation | 35 $RMEM | Educational achievements |
| 7 | First Date | 5 $RMEM | Relationship beginnings |
| 8 | Funeral | 40 $RMEM | Grief support |

---

## Events

### `MemoryCreated(uint256 indexed memoryId, address indexed rememberer, address indexed beneficiary, uint8 memoryType, uint256 scheduledDate)`

Emitted when a new memory is created.

### `MemoryVerified(uint256 indexed memoryId, address indexed verifier, uint256 rating)`

Emitted when a memory is verified.

### `TokensRewarded(uint256 indexed memoryId, address indexed rememberer, uint256 amount)`

Emitted when tokens are awarded for verified memory.

---

## Integration Examples

### React Hook for Contract Interaction

```javascript
import { useContract, useSigner } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

export function useRememberToken() {
  const { data: signer } = useSigner();
  
  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    signerOrProvider: signer,
  });

  const createMemory = async (beneficiary, type, description, date) => {
    const tx = await contract.createMemory(beneficiary, type, description, date);
    return tx.wait();
  };

  const getUserMemories = async (address) => {
    const memoryIds = await contract.getUserMemories(address);
    const memories = [];
    
    for (const id of memoryIds) {
      const memory = await contract.getMemory(id);
      memories.push({ id, ...memory });
    }
    
    return memories;
  };

  return { createMemory, getUserMemories };
}
```

### Node.js Backend Integration

```javascript
const { ethers } = require('ethers');
const { CONTRACT_ADDRESS, CONTRACT_ABI } = require('./constants');

class RememberTokenAPI {
  constructor(providerUrl, privateKey) {
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
  }

  async createMemory(beneficiary, type, description, scheduledDate) {
    try {
      const tx = await this.contract.createMemory(
        beneficiary, 
        type, 
        description, 
        scheduledDate
      );
      
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        memoryId: receipt.events[0].args.memoryId.toString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getContractStats() {
    const [totalMemories, totalVerifications, totalSupply] = await Promise.all([
      this.contract.getTotalMemories(),
      this.contract.getTotalVerifications(),
      this.contract.totalSupply()
    ]);

    return {
      totalMemories: totalMemories.toString(),
      totalVerifications: totalVerifications.toString(),
      totalSupply: ethers.formatEther(totalSupply)
    };
  }
}

module.exports = RememberTokenAPI;
```

### Corporate Integration Example

```javascript
// Enterprise wellness program integration
class WellnessProgram {
  constructor(rememberTokenContract, employeeAddresses) {
    this.contract = rememberTokenContract;
    this.employees = employeeAddresses;
  }

  // Create memories for team member birthdays
  async setupBirthdayMemories(birthdayList) {
    const memories = [];
    
    for (const birthday of birthdayList) {
      const tx = await this.contract.createMemory(
        birthday.employeeAddress,
        0, // Birthday type
        `${birthday.name}'s birthday - team celebration`,
        birthday.timestamp
      );
      
      memories.push({
        employee: birthday.name,
        transactionHash: tx.hash
      });
    }
    
    return memories;
  }

  // Get employee care statistics
  async getCareStats() {
    const stats = {};
    
    for (const address of this.employees) {
      const memories = await this.contract.getUserMemories(address);
      const balance = await this.contract.balanceOf(address);
      
      stats[address] = {
        memoriesCreated: memories.length,
        tokensEarned: ethers.formatEther(balance)
      };
    }
    
    return stats;
  }
}
```

---

## Error Handling

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot create memory for yourself" | Beneficiary is same as sender | Use different address |
| "Event must be in the future" | Scheduled date is in past | Use future timestamp |
| "Only beneficiary can verify" | Wrong account verifying | Use beneficiary account |
| "Event hasn't happened yet" | Verifying too early | Wait until event date |
| "Verification window expired" | Verifying too late (>7 days) | Verify within 7 days |
| "Daily mint limit exceeded" | Too many tokens in one day | Wait until next day |

### Error Handling Example

```javascript
async function createMemoryWithErrorHandling(contract, beneficiary, type, description, date) {
  try {
    const tx = await contract.createMemory(beneficiary, type, description, date);
    await tx.wait();
    return { success: true, hash: tx.hash };
  } catch (error) {
    let userMessage;
    
    if (error.message.includes("Cannot create memory for yourself")) {
      userMessage = "You cannot create a memory for yourself";
    } else if (error.message.includes("Event must be in the future")) {
      userMessage = "Please select a future date for the event";
    } else if (error.message.includes("insufficient funds")) {
      userMessage = "Insufficient ETH for transaction fees";
    } else {
      userMessage = "Transaction failed. Please try again.";
    }
    
    return { success: false, error: userMessage };
  }
}
```

---

## Rate Limits & Best Practices

### Daily Limits
- Maximum 100,000 tokens per user per day
- Prevents industrial farming while allowing genuine usage
- Resets at midnight UTC

### Gas Optimization
- Batch multiple memory creations if possible
- Use appropriate gas price for network conditions
- Consider gas costs in user experience design

### Best Practices
1. Always validate inputs before sending transactions
2. Use event listeners to track transaction status
3. Implement proper error handling and user feedback
4. Cache frequently accessed data to reduce RPC calls
5. Consider using multicall for batch operations

---

## Testing

### Local Development
```bash
# Start local hardhat network
npx hardhat node

# Deploy contract locally
npx hardhat run scripts/deploy.js --network localhost

# Run tests
npx hardhat test
```

### Testnet Testing
```bash
# Deploy to Base testnet
npm run deploy:base-testnet

# Verify contract
npm run verify
```

### Integration Testing
```javascript
describe("Remember Token Integration", function() {
  let contract, owner, alice, bob;

  beforeEach(async function() {
    [owner, alice, bob] = await ethers.getSigners();
    const RememberToken = await ethers.getContractFactory("RememberToken");
    contract = await RememberToken.deploy();
    await contract.waitForDeployment();
  });

  it("should create and verify memory", async function() {
    const futureDate = Math.floor(Date.now() / 1000) + 3600;
    
    // Alice creates memory for Bob
    await contract.connect(alice).createMemory(
      bob.address, 0, "Test memory", futureDate
    );
    
    // Fast forward time
    await network.provider.send("evm_increaseTime", [3700]);
    await network.provider.send("evm_mine");
    
    // Bob verifies memory
    await contract.connect(bob).verifyMemory(0, "Thanks!", 5);
    
    // Check Alice received tokens
    const balance = await contract.balanceOf(alice.address);
    expect(balance).to.equal(ethers.parseEther("10"));
  });
});
```

---

## Support & Resources

### Documentation
- [Whitepaper](./whitepaper.md)
- [Tokenomics](./tokenomics.md)
- [GitHub Repository](https://github.com/remember-token/remember-token)

### Community
- **Website**: [project-block.com](https://project-block.com)
- **Discord**: Coming Soon
- **Twitter**: Coming Soon

### Developer Support
- **Email**: developers@project-block.com
- **GitHub Issues**: Technical questions and bug reports
- **Documentation Updates**: Submit PRs for improvements

---

*This API reference is updated regularly. Check the GitHub repository for the latest version and examples.*