import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Calendar, User, MessageCircle, Gift, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MEMORY_TYPES = [
  { id: 0, name: 'Birthday', emoji: '🎂', reward: 10, description: 'Perfect for celebrating someone\'s special day' },
  { id: 1, name: 'Anniversary', emoji: '💑', reward: 15, description: 'Couple anniversaries or relationship milestones' },
  { id: 2, name: 'Job Interview', emoji: '💼', reward: 20, description: 'Show support before important career moments' },
  { id: 3, name: 'Medical Appointment', emoji: '🏥', reward: 25, description: 'Check in on health-related appointments' },
  { id: 4, name: 'Major Life Event', emoji: '🎉', reward: 30, description: 'Weddings, promotions, major achievements' },
  { id: 5, name: 'Pet Birthday', emoji: '🐕', reward: 8, description: 'Because pets are family too!' },
  { id: 6, name: 'Graduation', emoji: '🎓', reward: 35, description: 'Educational achievements and ceremonies' },
  { id: 7, name: 'First Date', emoji: '💕', reward: 5, description: 'Wish someone luck on their romantic journey' },
  { id: 8, name: 'Funeral', emoji: '⚰️', reward: 40, description: 'Be there during difficult times' },
];

const AddMemory = ({ contract, account, onMemoryCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    beneficiaryAddress: '',
    memoryType: '',
    description: '',
    eventDate: '',
    eventTime: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate beneficiary address
    if (!formData.beneficiaryAddress) {
      newErrors.beneficiaryAddress = 'Friend\'s wallet address is required';
    } else if (!ethers.isAddress(formData.beneficiaryAddress)) {
      newErrors.beneficiaryAddress = 'Please enter a valid wallet address';
    } else if (formData.beneficiaryAddress.toLowerCase() === account.toLowerCase()) {
      newErrors.beneficiaryAddress = 'You cannot create a memory for yourself';
    }

    // Validate memory type
    if (formData.memoryType === '') {
      newErrors.memoryType = 'Please select a memory type';
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe what to remember';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    }

    // Validate date and time
    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else if (!formData.eventTime) {
      newErrors.eventTime = 'Event time is required';
    } else {
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
      const now = new Date();
      
      if (eventDateTime <= now) {
        newErrors.eventDate = 'Event must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    if (!contract || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
      const eventTimestamp = Math.floor(eventDateTime.getTime() / 1000);
      
      // Create memory on blockchain
      const tx = await contract.createMemory(
        formData.beneficiaryAddress,
        parseInt(formData.memoryType),
        formData.description.trim(),
        eventTimestamp
      );
      
      toast.loading('Creating memory...', { id: 'create' });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast.success('Memory created successfully! 🎉', { id: 'create' });
      
      // Reset form
      setFormData({
        beneficiaryAddress: '',
        memoryType: '',
        description: '',
        eventDate: '',
        eventTime: ''
      });
      
      if (onMemoryCreated) {
        onMemoryCreated();
      }
      
    } catch (error) {
      console.error('Error creating memory:', error);
      toast.error('Failed to create memory: ' + (error.reason || error.message), { id: 'create' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMemoryType = MEMORY_TYPES.find(type => type.id === parseInt(formData.memoryType));
  
  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Gift className="w-8 h-8 mr-3" />
          Create New Memory
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Beneficiary Address */}
        <div>
          <label className="block text-white font-medium mb-2 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Friend's Wallet Address
          </label>
          <input
            type="text"
            name="beneficiaryAddress"
            value={formData.beneficiaryAddress}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border-2 ${
              errors.beneficiaryAddress ? 'border-red-500' : 'border-white/20'
            } bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors`}
            placeholder="0x1234567890abcdef..."
          />
          {errors.beneficiaryAddress && (
            <p className="text-red-400 text-sm mt-1">{errors.beneficiaryAddress}</p>
          )}
          <p className="text-blue-200 text-sm mt-1">
            The person you want to remember something for
          </p>
        </div>

        {/* Memory Type */}
        <div>
          <label className="block text-white font-medium mb-2">
            Memory Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MEMORY_TYPES.map((type) => (
              <label
                key={type.id}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  formData.memoryType === type.id.toString()
                    ? 'border-blue-400 bg-blue-400/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="memoryType"
                  value={type.id}
                  checked={formData.memoryType === type.id.toString()}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{type.emoji}</span>
                    <div>
                      <div className="text-white font-semibold">{type.name}</div>
                      <div className="text-blue-200 text-sm">{type.reward} $RMEM</div>
                    </div>
                  </div>
                </div>
                <p className="text-blue-200 text-xs mt-2">{type.description}</p>
              </label>
            ))}
          </div>
          {errors.memoryType && (
            <p className="text-red-400 text-sm mt-1">{errors.memoryType}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-white font-medium mb-2 flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border-2 ${
              errors.description ? 'border-red-500' : 'border-white/20'
            } bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors`}
            placeholder="John's 25th birthday party at 7PM"
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-blue-200 text-sm mt-1">
            What should you remember about this event?
          </p>
        </div>

        {/* Event Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Event Date
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              min={minDate}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                errors.eventDate ? 'border-red-500' : 'border-white/20'
              } bg-white/10 text-white focus:outline-none focus:border-blue-400 transition-colors`}
            />
            {errors.eventDate && (
              <p className="text-red-400 text-sm mt-1">{errors.eventDate}</p>
            )}
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Event Time
            </label>
            <input
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                errors.eventTime ? 'border-red-500' : 'border-white/20'
              } bg-white/10 text-white focus:outline-none focus:border-blue-400 transition-colors`}
            />
            {errors.eventTime && (
              <p className="text-red-400 text-sm mt-1">{errors.eventTime}</p>
            )}
          </div>
        </div>

        {/* Reward Preview */}
        {selectedMemoryType && (
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
            <div className="flex items-center text-white">
              <Gift className="w-5 h-5 mr-2" />
              <span className="font-semibold">
                You'll earn {selectedMemoryType.reward} $RMEM tokens when this memory is verified!
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Memory...</span>
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                <span>Create Memory</span>
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="bg-white/10 border-2 border-white/30 text-white py-4 px-6 rounded-lg font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddMemory;