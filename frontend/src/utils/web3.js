import { ethers } from 'ethers';
import { getContract } from './contract';

// Network configurations
export const NETWORKS = {
  BASE_MAINNET: {
    chainId: '0x2105', // 8453 in hex
    chainName: 'Base Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  },
  BASE_TESTNET: {
    chainId: '0x14A34', // 84532 in hex  
    chainName: 'Base Sepolia Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
  BASE_GOERLI: {
    chainId: '0x14A33', // 84531 in hex
    chainName: 'Base Goerli Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.base.org'],
    blockExplorerUrls: ['https://goerli.basescan.org'],
  }
};

// Get target network based on environment
export const getTargetNetwork = () => {
  const chainId = import.meta.env.VITE_CHAIN_ID;
  
  if (chainId === '8453') return NETWORKS.BASE_MAINNET;
  if (chainId === '84532') return NETWORKS.BASE_TESTNET;
  if (chainId === '84531') return NETWORKS.BASE_GOERLI;
  
  // Default to testnet for development
  return NETWORKS.BASE_TESTNET;
};

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask or another Web3 wallet is required');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const account = await signer.getAddress();

    // Check and switch to correct network
    const network = await provider.getNetwork();
    const targetNetwork = getTargetNetwork();
    
    if (network.chainId.toString() !== parseInt(targetNetwork.chainId, 16).toString()) {
      await switchToBase();
    }

    // Get contract instance
    const contract = getContract(signer);

    return {
      provider,
      signer,
      account,
      contract
    };

  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const switchToBase = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  const targetNetwork = getTargetNetwork();

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetNetwork.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [targetNetwork],
        });
      } catch (addError) {
        throw new Error('Failed to add Base network to wallet');
      }
    } else {
      throw new Error('Failed to switch to Base network');
    }
  }
};

export const getProvider = () => {
  if (typeof window.ethereum !== 'undefined') {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('No Web3 provider found');
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

export const getAccountAddress = async () => {
  const signer = await getSigner();
  return await signer.getAddress();
};

export const getBalance = async (address, tokenContract = null) => {
  try {
    if (tokenContract) {
      // Get ERC20 token balance
      const balance = await tokenContract.balanceOf(address);
      return ethers.formatEther(balance);
    } else {
      // Get native ETH balance
      const provider = getProvider();
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    }
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(38)}`;
};

export const isValidAddress = (address) => {
  return ethers.isAddress(address);
};

export const waitForTransaction = async (txHash) => {
  const provider = getProvider();
  return await provider.waitForTransaction(txHash);
};

// Event listeners for wallet changes
export const setupWalletListeners = (onAccountChange, onChainChange) => {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', onAccountChange);
    window.ethereum.on('chainChanged', onChainChange);
  }
};

export const removeWalletListeners = (onAccountChange, onChainChange) => {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.removeListener('accountsChanged', onAccountChange);
    window.ethereum.removeListener('chainChanged', onChainChange);
  }
};

// Check if wallet is connected
export const isWalletConnected = async () => {
  if (typeof window.ethereum === 'undefined') {
    return false;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

// Get current network info
export const getCurrentNetwork = async () => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name
    };
  } catch (error) {
    console.error('Error getting current network:', error);
    return null;
  }
};

// Check if on correct network
export const isOnCorrectNetwork = async () => {
  try {
    const currentNetwork = await getCurrentNetwork();
    const targetNetwork = getTargetNetwork();
    const targetChainId = parseInt(targetNetwork.chainId, 16);
    
    return currentNetwork.chainId === targetChainId;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};