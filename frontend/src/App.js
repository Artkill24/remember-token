import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, Heart, Users, Trophy, Clock, Gift } from 'lucide-react';
import MemoryCard from './components/MemoryCard';
import AddMemory from './components/AddMemory';
import { connectWallet, getContract, switchToBase } from './utils/web3';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [contract, setContract] = useState(null);
  const [memories, setMemories] = useState([]);
  const [stats, setStats] = useState({
    totalMemories: 0,
    verifiedMemories: 0,
    totalRewards: 0
  });
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountChange);
      window.ethereum.on('chainChanged', handleChainChange);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
        window.ethereum.removeListener('chainChanged', handleChainChange);
      }
    };
  }, []);

  useEffect(() => {
    if (account && contract) {
      loadUserData();
    }
  }, [account, contract]);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await handleConnect();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const handleAccountChange = (accounts) => {
    if (accounts.length === 0) {
      setAccount('');
      setBalance('0');
      setContract(null);
      setMemories([]);
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChange = () => {
    window.location.reload();
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const { account: connectedAccount, contract: contractInstance } = await connectWallet();
      setAccount(connectedAccount);
      setContract(contractInstance);
      
      await loadBalance(connectedAccount, contractInstance);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async (userAccount, contractInstance) => {
    try {
      const balance = await contractInstance.balanceOf(userAccount);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error loading balance:', error);
      setBalance('0');
    }
  };

  const loadUserData = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      
      // Load user memories
      const userMemoryIds = await contract.getUserMemories(account);
      const memoryPromises = userMemoryIds.map(id => contract.getMemory(id));
      const memoriesData = await Promise.all(memoryPromises);
      
      // Format memories data
      const formattedMemories = memoriesData.map((memory, index) => ({
        id: userMemoryIds[index],
        ...memory,
        scheduledDate: new Date(Number(memory.scheduledDate) * 1000),
        createdAt: new Date(Number(memory.createdAt) * 1000),
        rewardAmount: ethers.formatEther(memory.rewardAmount)
      }));
      
      setMemories(formattedMemories);
      
      // Calculate stats
      const verified = formattedMemories.filter(m => m.isVerified).length;
      const totalRewards = formattedMemories.reduce((sum, m) => 
        m.isRewarded ? sum + parseFloat(m.rewardAmount) : sum, 0
      );
      
      setStats({
        totalMemories: formattedMemories.length,
        verifiedMemories: verified,
        totalRewards: totalRewards.toFixed(2)
      });
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleMemoryCreated = () => {
    loadUserData();
    loadBalance(account, contract);
    setShowAddMemory(false);
    toast.success('Memory created successfully! 🎉');
  };

  const handleMemoryVerified = () => {
    loadUserData();
    loadBalance(account, contract);
    toast.success('Memory verified and tokens awarded! 💝');
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  if (!CONTRACT_ADDRESS) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">⚠️ Configuration Required</h1>
          <p className="text-xl mb-4">Contract not deployed yet.</p>
          <p className="text-lg">Please deploy the contract and update VITE_CONTRACT_ADDRESS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🎂</span>
            <div>
              <h1 className="text-3xl font-bold text-white">Remember Token</h1>
              <p className="text-blue-100">Get paid for remembering what matters</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {account ? (
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white border border-white/20">
                <div className="text-sm opacity-80">Connected</div>
                <div className="font-semibold">{formatAddress(account)}</div>
                <div className="text-sm">{parseFloat(balance).toFixed(2)} $RMEM</div>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      {account ? (
        <main className="max-w-6xl mx-auto px-6 pb-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <Calendar className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{stats.totalMemories}</div>
              <div className="text-blue-100">Total Memories</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <Heart className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{stats.verifiedMemories}</div>
              <div className="text-blue-100">Verified</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <Trophy className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{stats.totalRewards}</div>
              <div className="text-blue-100">$RMEM Earned</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <Gift className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{parseFloat(balance).toFixed(2)}</div>
              <div className="text-blue-100">Current Balance</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAddMemory(!showAddMemory)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:transform hover:scale-105 flex items-center space-x-2"
            >
              <Heart className="w-6 h-6" />
              <span>{showAddMemory ? 'Cancel' : 'Create New Memory'}</span>
            </button>
          </div>

          {/* Add Memory Form */}
          {showAddMemory && (
            <div className="mb-8">
              <AddMemory
                contract={contract}
                account={account}
                onMemoryCreated={handleMemoryCreated}
                onCancel={() => setShowAddMemory(false)}
              />
            </div>
          )}

          {/* Memories List */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Users className="w-8 h-8 mr-3" />
              My Memories
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-white mt-4">Loading memories...</p>
              </div>
            ) : memories.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No memories yet</h3>
                <p className="text-blue-100 mb-6">Start creating memories to earn $RMEM tokens!</p>
                <button
                  onClick={() => setShowAddMemory(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700"
                >
                  Create Your First Memory
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {memories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    contract={contract}
                    account={account}
                    onMemoryVerified={handleMemoryVerified}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      ) : (
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
            <span className="text-8xl block mb-6">🎂</span>
            <h2 className="text-4xl font-bold text-white mb-4">Welcome to Remember Token</h2>
            <p className="text-xl text-blue-100 mb-8">
              The first blockchain platform that rewards you for remembering what matters to people.
              Connect your wallet to start earning $RMEM tokens by caring!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <Heart className="w-12 h-12 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Remember</h3>
                <p className="text-blue-100">Create memories for important events in your friends' lives</p>
              </div>
              
              <div className="text-center">
                <Gift className="w-12 h-12 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Care</h3>
                <p className="text-blue-100">Reach out when their special moments arrive</p>
              </div>
              
              <div className="text-center">
                <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Earn</h3>
                <p className="text-blue-100">Get rewarded with $RMEM tokens for genuine care</p>
              </div>
            </div>
            
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Wallet to Start'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;