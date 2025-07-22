// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title RememberToken
 * @dev The first blockchain platform that rewards human care and connection
 * Earn $RMEM tokens by remembering what matters to people
 */
contract RememberToken is ERC20, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Token Details
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    uint256 public constant MAX_DAILY_MINT = 100_000 * 10**18; // 100K daily mint limit
    
    // Memory Types and Rewards
    enum MemoryType {
        BIRTHDAY,           // 10 tokens
        ANNIVERSARY,        // 15 tokens
        JOB_INTERVIEW,      // 20 tokens
        MEDICAL_APPOINTMENT, // 25 tokens
        MAJOR_LIFE_EVENT,   // 30 tokens
        PET_BIRTHDAY,       // 8 tokens
        GRADUATION,         // 35 tokens
        FIRST_DATE,         // 5 tokens
        FUNERAL,            // 40 tokens
        CUSTOM             // Variable
    }
    
    // Memory Structure
    struct Memory {
        uint256 id;
        address rememberer;     // Person who remembers
        address beneficiary;    // Person being remembered
        MemoryType memoryType;
        string description;
        uint256 scheduledDate;  // When the event happens
        uint256 createdAt;
        bool isVerified;        // Confirmed by beneficiary
        bool isRewarded;        // Tokens already given
        uint256 rewardAmount;
    }
    
    // Verification Structure
    struct Verification {
        uint256 memoryId;
        address verifier;       // Must be the beneficiary
        uint256 verifiedAt;
        string proof;          // Optional proof message
        uint256 rating;        // 1-5 how meaningful it was
    }
    
    // Counters
    Counters.Counter private _memoryIdCounter;
    Counters.Counter private _verificationIdCounter;
    
    // Mappings
    mapping(uint256 => Memory) public memories;
    mapping(uint256 => Verification) public verifications;
    mapping(address => uint256[]) public userMemories;
    mapping(address => uint256) public dailyMintCount;
    mapping(address => uint256) public lastMintDate;
    mapping(MemoryType => uint256) public memoryTypeRewards;
    
    // Events
    event MemoryCreated(
        uint256 indexed memoryId,
        address indexed rememberer,
        address indexed beneficiary,
        MemoryType memoryType,
        uint256 scheduledDate
    );
    
    event MemoryVerified(
        uint256 indexed memoryId,
        address indexed verifier,
        uint256 rating
    );
    
    event TokensRewarded(
        uint256 indexed memoryId,
        address indexed rememberer,
        uint256 amount
    );
    
    constructor() ERC20("Remember Token", "RMEM") {
        // Set initial reward amounts
        memoryTypeRewards[MemoryType.BIRTHDAY] = 10 * 10**18;
        memoryTypeRewards[MemoryType.ANNIVERSARY] = 15 * 10**18;
        memoryTypeRewards[MemoryType.JOB_INTERVIEW] = 20 * 10**18;
        memoryTypeRewards[MemoryType.MEDICAL_APPOINTMENT] = 25 * 10**18;
        memoryTypeRewards[MemoryType.MAJOR_LIFE_EVENT] = 30 * 10**18;
        memoryTypeRewards[MemoryType.PET_BIRTHDAY] = 8 * 10**18;
        memoryTypeRewards[MemoryType.GRADUATION] = 35 * 10**18;
        memoryTypeRewards[MemoryType.FIRST_DATE] = 5 * 10**18;
        memoryTypeRewards[MemoryType.FUNERAL] = 40 * 10**18;
        
        // Mint initial supply to contract for rewards
        _mint(address(this), TOTAL_SUPPLY);
    }
    
    /**
     * @dev Create a new memory to remember
     * @param beneficiary The person this memory is for
     * @param memoryType Type of memory/event
     * @param description Description of what to remember
     * @param scheduledDate When the event will happen (Unix timestamp)
     */
    function createMemory(
        address beneficiary,
        MemoryType memoryType,
        string memory description,
        uint256 scheduledDate
    ) external returns (uint256) {
        require(beneficiary != msg.sender, "Cannot create memory for yourself");
        require(beneficiary != address(0), "Invalid beneficiary address");
        require(scheduledDate > block.timestamp, "Event must be in the future");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        uint256 memoryId = _memoryIdCounter.current();
        _memoryIdCounter.increment();
        
        uint256 rewardAmount = memoryTypeRewards[memoryType];
        
        memories[memoryId] = Memory({
            id: memoryId,
            rememberer: msg.sender,
            beneficiary: beneficiary,
            memoryType: memoryType,
            description: description,
            scheduledDate: scheduledDate,
            createdAt: block.timestamp,
            isVerified: false,
            isRewarded: false,
            rewardAmount: rewardAmount
        });
        
        userMemories[msg.sender].push(memoryId);
        
        emit MemoryCreated(memoryId, msg.sender, beneficiary, memoryType, scheduledDate);
        
        return memoryId;
    }
    
    /**
     * @dev Verify that someone remembered you (only beneficiary can call)
     * @param memoryId The ID of the memory to verify
     * @param proof Optional message/proof
     * @param rating How meaningful was it (1-5)
     */
    function verifyMemory(
        uint256 memoryId,
        string memory proof,
        uint256 rating
    ) external {
        require(memoryId < _memoryIdCounter.current(), "Memory does not exist");
        require(rating >= 1 && rating <= 5, "Rating must be between 1-5");
        
        Memory storage memory = memories[memoryId];
        require(memory.beneficiary == msg.sender, "Only beneficiary can verify");
        require(!memory.isVerified, "Memory already verified");
        require(block.timestamp >= memory.scheduledDate, "Event hasn't happened yet");
        
        // Can only verify within 7 days after the scheduled date
        require(
            block.timestamp <= memory.scheduledDate + 7 days,
            "Verification window expired"
        );
        
        uint256 verificationId = _verificationIdCounter.current();
        _verificationIdCounter.increment();
        
        verifications[verificationId] = Verification({
            memoryId: memoryId,
            verifier: msg.sender,
            verifiedAt: block.timestamp,
            proof: proof,
            rating: rating
        });
        
        memory.isVerified = true;
        
        emit MemoryVerified(memoryId, msg.sender, rating);
        
        // Automatically reward tokens after verification
        _rewardTokens(memoryId);
    }
    
    /**
     * @dev Internal function to reward tokens
     * @param memoryId The memory ID to reward
     */
    function _rewardTokens(uint256 memoryId) internal nonReentrant {
        Memory storage memory = memories[memoryId];
        require(memory.isVerified, "Memory not verified");
        require(!memory.isRewarded, "Already rewarded");
        
        address rememberer = memory.rememberer;
        uint256 rewardAmount = memory.rewardAmount;
        
        // Check daily mint limits
        if (lastMintDate[rememberer] != _getCurrentDay()) {
            dailyMintCount[rememberer] = 0;
            lastMintDate[rememberer] = _getCurrentDay();
        }
        
        require(
            dailyMintCount[rememberer] + rewardAmount <= MAX_DAILY_MINT,
            "Daily mint limit exceeded"
        );
        
        // Transfer tokens from contract to rememberer
        require(
            balanceOf(address(this)) >= rewardAmount,
            "Insufficient reward tokens in contract"
        );
        
        _transfer(address(this), rememberer, rewardAmount);
        
        dailyMintCount[rememberer] += rewardAmount;
        memory.isRewarded = true;
        
        emit TokensRewarded(memoryId, rememberer, rewardAmount);
    }
    
    /**
     * @dev Get current day (for daily limits)
     */
    function _getCurrentDay() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }
    
    /**
     * @dev Get user's memories
     * @param user Address of the user
     */
    function getUserMemories(address user) external view returns (uint256[] memory) {
        return userMemories[user];
    }
    
    /**
     * @dev Get memory details
     * @param memoryId ID of the memory
     */
    function getMemory(uint256 memoryId) external view returns (Memory memory) {
        require(memoryId < _memoryIdCounter.current(), "Memory does not exist");
        return memories[memoryId];
    }
    
    /**
     * @dev Update reward amounts (only owner)
     * @param memoryType Type of memory to update
     * @param newReward New reward amount
     */
    function updateRewardAmount(MemoryType memoryType, uint256 newReward) external onlyOwner {
        memoryTypeRewards[memoryType] = newReward;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = balanceOf(address(this));
        _transfer(address(this), owner(), balance);
    }
    
    /**
     * @dev Get total memories created
     */
    function getTotalMemories() external view returns (uint256) {
        return _memoryIdCounter.current();
    }
    
    /**
     * @dev Get total verifications
     */
    function getTotalVerifications() external view returns (uint256) {
        return _verificationIdCounter.current();
    }
}
