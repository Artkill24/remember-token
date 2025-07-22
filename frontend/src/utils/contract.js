import { ethers } from 'ethers';

// Contract address - will be filled after deployment
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

// Contract ABI - Essential functions for Remember Token
export const CONTRACT_ABI = [
  // ERC20 Standard Functions
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  
  // Remember Token Core Functions
  "function createMemory(address beneficiary, uint8 memoryType, string memory description, uint256 scheduledDate) external returns (uint256)",
  "function verifyMemory(uint256 memoryId, string memory proof, uint256 rating) external",
  "function getUserMemories(address user) external view returns (uint256[])",
  "function getMemory(uint256 memoryId) external view returns (tuple(uint256 id, address rememberer, address beneficiary, uint8 memoryType, string description, uint256 scheduledDate, uint256 createdAt, bool isVerified, bool isRewarded, uint256 rewardAmount))",
  "function getTotalMemories() external view returns (uint256)",
  "function getTotalVerifications() external view returns (uint256)",
  
  // Memory Type Rewards
  "function memoryTypeRewards(uint8 memoryType) external view returns (uint256)",
  "function updateRewardAmount(uint8 memoryType, uint256 newReward) external",
  
  // Daily Limits
  "function dailyMintCount(address user) external view returns (uint256)",
  "function lastMintDate(address user) external view returns (uint256)",
  
  // Owner Functions
  "function owner() external view returns (address)",
  "function emergencyWithdraw() external",
  
  // Events
  "event MemoryCreated(uint256 indexed memoryId, address indexed rememberer, address indexed beneficiary, uint8 memoryType, uint256 scheduledDate)",
  "event MemoryVerified(uint256 indexed memoryId, address indexed verifier, uint256 rating)",
  "event TokensRewarded(uint256 indexed memoryId, address indexed rememberer, uint256 amount)",
  
  // ERC20 Events
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Memory types mapping
export const MEMORY_TYPES = {
  BIRTHDAY: 0,
  ANNIVERSARY: 1,
  JOB_INTERVIEW: 2,
  MEDICAL_APPOINTMENT: 3,
  MAJOR_LIFE_EVENT: 4,
  PET_BIRTHDAY: 5,
  GRADUATION: 6,
  FIRST_DATE: 7,
  FUNERAL: 8,
  CUSTOM: 9
};

// Memory type names and details
export const MEMORY_TYPE_INFO = {
  0: { name: 'Birthday', emoji: '🎂', defaultReward: '10' },
  1: { name: 'Anniversary', emoji: '💑', defaultReward: '15' },
  2: { name: 'Job Interview', emoji: '💼', defaultReward: '20' },
  3: { name: 'Medical Appointment', emoji: '🏥', defaultReward: '25' },
  4: { name: 'Major Life Event', emoji: '🎉', defaultReward: '30' },
  5: { name: 'Pet Birthday', emoji: '🐕', defaultReward: '8' },
  6: { name: 'Graduation', emoji: '🎓', defaultReward: '35' },
  7: { name: 'First Date', emoji: '💕', defaultReward: '5' },
  8: { name: 'Funeral', emoji: '⚰️', defaultReward: '40' },
};

// Get contract instance
export const getContract = (signerOrProvider) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured. Please deploy the contract first.');
  }
  
  if (!signerOrProvider) {
    throw new Error('Signer or provider is required');
  }
  
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};

// Get read-only contract instance (for viewing data without wallet)
export const getReadOnlyContract = (provider) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }
  
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Contract helper functions
export const contractHelpers = {
  // Format memory data from contract
  formatMemoryData: (rawMemory, memoryId) => {
    return {
      id: memoryId,
      rememberer: rawMemory.rememberer,
      beneficiary: rawMemory.beneficiary,
      memoryType: Number(rawMemory.memoryType),
      description: rawMemory.description,
      scheduledDate: new Date(Number(rawMemory.scheduledDate) * 1000),
      createdAt: new Date(Number(rawMemory.createdAt) * 1000),
      isVerified: rawMemory.isVerified,
      isRewarded: rawMemory.isRewarded,
      rewardAmount: ethers.formatEther(rawMemory.rewardAmount)
    };
  },
  
  // Get memory type info
  getMemoryTypeInfo: (memoryType) => {
    return MEMORY_TYPE_INFO[memoryType] || { 
      name: 'Unknown', 
      emoji: '❓', 
      defaultReward: '0' 
    };
  },
  
  // Calculate event timestamp
  getEventTimestamp: (dateString, timeString) => {
    const eventDateTime = new Date(`${dateString}T${timeString}`);
    return Math.floor(eventDateTime.getTime() / 1000);
  },
  
  // Check if memory can be verified
  canVerifyMemory: (memory, currentAccount) => {
    const now = new Date();
    const eventDate = memory.scheduledDate;
    const verificationDeadline = new Date(eventDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days after event
    
    return (
      !memory.isVerified &&
      now >= eventDate &&
      now <= verificationDeadline &&
      memory.beneficiary.toLowerCase() === currentAccount.toLowerCase()
    );
  },
  
  // Get memory status
  getMemoryStatus: (memory, currentAccount) => {
    const now = new Date();
    const eventDate = memory.scheduledDate;
    
    if (memory.isVerified) {
      return { status: 'verified', text: 'Verified ✨', color: 'green' };
    } else if (contractHelpers.canVerifyMemory(memory, currentAccount)) {
      return { status: 'ready', text: 'Ready to Verify', color: 'yellow' };
    } else if (now > eventDate) {
      return { status: 'expired', text: 'Past Due', color: 'red' };
    } else {
      return { status: 'upcoming', text: 'Upcoming', color: 'blue' };
    }
  },
  
  // Format date for display
  formatDate: (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // Get time until event
  getTimeUntilEvent: (eventDate) => {
    const now = new Date();
    const timeDiff = eventDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Past due';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
};

// Contract interaction functions
export const contractInteractions = {
  // Create a new memory
  createMemory: async (contract, beneficiary, memoryType, description, eventTimestamp) => {
    try {
      const tx = await contract.createMemory(
        beneficiary,
        memoryType,
        description,
        eventTimestamp
      );
      return tx;
    } catch (error) {
      console.error('Error creating memory:', error);
      throw error;
    }
  },
  
  // Verify a memory
  verifyMemory: async (contract, memoryId, proof, rating) => {
    try {
      const tx = await contract.verifyMemory(memoryId, proof, rating);
      return tx;
    } catch (error) {
      console.error('Error verifying memory:', error);
      throw error;
    }
  },
  
  // Get user's memories
  getUserMemories: async (contract, userAddress) => {
    try {
      const memoryIds = await contract.getUserMemories(userAddress);
      const memories = [];
      
      for (const id of memoryIds) {
        const rawMemory = await contract.getMemory(id);
        const formattedMemory = contractHelpers.formatMemoryData(rawMemory, id);
        memories.push(formattedMemory);
      }
      
      // Sort by creation date (newest first)
      memories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return memories;
    } catch (error) {
      console.error('Error getting user memories:', error);
      throw error;
    }
  },
  
  // Get contract stats
  getContractStats: async (contract) => {
    try {
      const [totalMemories, totalVerifications, totalSupply] = await Promise.all([
        contract.getTotalMemories(),
        contract.getTotalVerifications(),
        contract.totalSupply()
      ]);
      
      return {
        totalMemories: Number(totalMemories),
        totalVerifications: Number(totalVerifications),
        totalSupply: ethers.formatEther(totalSupply)
      };
    } catch (error) {
      console.error('Error getting contract stats:', error);
      return {
        totalMemories: 0,
        totalVerifications: 0,
        totalSupply: '0'
      };
    }
  },
  
  // Get memory type rewards
  getMemoryTypeRewards: async (contract) => {
    try {
      const rewards = {};
      
      for (let i = 0; i <= 8; i++) {
        const reward = await contract.memoryTypeRewards(i);
        rewards[i] = ethers.formatEther(reward);
      }
      
      return rewards;
    } catch (error) {
      console.error('Error getting memory type rewards:', error);
      return {};
    }
  }
};

export default {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  MEMORY_TYPES,
  MEMORY_TYPE_INFO,
  getContract,
  getReadOnlyContract,
  contractHelpers,
  contractInteractions
};