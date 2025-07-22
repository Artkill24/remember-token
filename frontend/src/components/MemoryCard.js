import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, Star, MessageCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MEMORY_TYPES = [
  { id: 0, name: 'Birthday', emoji: '🎂', color: 'from-pink-500 to-pink-600' },
  { id: 1, name: 'Anniversary', emoji: '💑', color: 'from-red-500 to-red-600' },
  { id: 2, name: 'Job Interview', emoji: '💼', color: 'from-blue-500 to-blue-600' },
  { id: 3, name: 'Medical Appointment', emoji: '🏥', color: 'from-green-500 to-green-600' },
  { id: 4, name: 'Major Life Event', emoji: '🎉', color: 'from-purple-500 to-purple-600' },
  { id: 5, name: 'Pet Birthday', emoji: '🐕', color: 'from-orange-500 to-orange-600' },
  { id: 6, name: 'Graduation', emoji: '🎓', color: 'from-indigo-500 to-indigo-600' },
  { id: 7, name: 'First Date', emoji: '💕', color: 'from-pink-400 to-pink-500' },
  { id: 8, name: 'Funeral', emoji: '⚰️', color: 'from-gray-500 to-gray-600' },
];

const MemoryCard = ({ memory, contract, account, onMemoryVerified }) => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [proof, setProof] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const memoryType = MEMORY_TYPES.find(type => type.id === Number(memory.memoryType)) || MEMORY_TYPES[0];
  const now = new Date();
  const eventDate = memory.scheduledDate;
  const canVerify = now >= eventDate && !memory.isVerified;
  const isUpcoming = now < eventDate;
  const isPastDue = now > eventDate && !memory.isVerified;

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (memory.isVerified) {
      return {
        icon: CheckCircle,
        text: 'Verified ✨',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200'
      };
    } else if (canVerify) {
      return {
        icon: Star,
        text: 'Ready to Verify',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200'
      };
    } else if (isPastDue) {
      return {
        icon: AlertCircle,
        text: 'Past Due',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        icon: Clock,
        text: 'Upcoming',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200'
      };
    }
  };

  const handleVerifyClick = () => {
    if (!canVerify) {
      if (isUpcoming) {
        toast.error('This event hasn\'t happened yet!');
      } else if (memory.isVerified) {
        toast.info('This memory is already verified!');
      }
      return;
    }
    
    // Check if user is the beneficiary
    if (memory.beneficiary.toLowerCase() !== account.toLowerCase()) {
      toast.error('Only the beneficiary can verify this memory!');
      return;
    }

    setShowVerifyModal(true);
  };

  const handleVerifySubmit = async () => {
    if (!contract || !account) return;

    try {
      setIsVerifying(true);
      
      const tx = await contract.verifyMemory(
        memory.id,
        proof || 'Thank you for remembering! 💝',
        rating
      );
      
      toast.loading('Verifying memory...', { id: 'verify' });
      
      await tx.wait();
      
      toast.success('Memory verified! Tokens awarded! 🎉', { id: 'verify' });
      
      setShowVerifyModal(false);
      setProof('');
      setRating(5);
      
      if (onMemoryVerified) {
        onMemoryVerified();
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify memory: ' + (error.reason || error.message), { id: 'verify' });
    } finally {
      setIsVerifying(false);
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{memoryType.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{memory.description}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${memoryType.color} text-white`}>
                  {memoryType.name}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${status.bgColor} ${status.borderColor}`}>
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">Event: {formatDate(eventDate)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Reward:</span> {memory.rewardAmount} $RMEM
            </div>
            
            {memory.isVerified && (
              <div className="text-sm text-green-600 font-medium">
                ✅ Tokens Awarded!
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Created: {memory.createdAt.toLocaleDateString()}
          </div>
          
          {canVerify && memory.beneficiary.toLowerCase() === account.toLowerCase() && (
            <button
              onClick={handleVerifyClick}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105 flex items-center space-x-2"
            >
              <Star className="w-4 h-4" />
              <span>Verify Memory</span>
            </button>
          )}
          
          {!canVerify && !memory.isVerified && (
            <div className="text-sm text-gray-500">
              {isUpcoming ? '⏳ Waiting for event' : '⚠️ Verification expired'}
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-4xl block mb-2">{memoryType.emoji}</span>
              <h3 className="text-xl font-bold text-gray-800">Verify Memory</h3>
              <p className="text-gray-600 mt-2">"{memory.description}"</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How meaningful was it? ⭐
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg transition-colors ${
                        rating >= star 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {rating === 5 ? 'Amazing! 🤩' : rating === 4 ? 'Great! 😊' : rating === 3 ? 'Good 👍' : rating === 2 ? 'Okay 😐' : 'Meh 😕'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional message 💌
                </label>
                <textarea
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Thank you for remembering my birthday! It meant so much to me 💝"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleVerifySubmit}
                  disabled={isVerifying}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify & Reward</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowVerifyModal(false)}
                  disabled={isVerifying}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemoryCard;