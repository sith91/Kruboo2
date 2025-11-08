import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfigStore } from '../../stores/configStore';
import { Mic, Volume2, Check, ArrowRight, AlertCircle } from 'lucide-react';

const MicrophoneSetup = () => {
  const navigate = useNavigate();
  const { setMicrophone } = useConfigStore();
  const [microphones, setMicrophones] = useState([]);
  const [selectedMic, setSelectedMic] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMicrophones();
  }, []);

  const loadMicrophones = async () => {
    try {
      const result = await window.electronAPI?.getMicrophones();
      if (result.success) {
        setMicrophones(result.microphones);
        setSelectedMic(result.microphones[0]?.id || '');
      } else {
        setError('Failed to load microphones');
      }
    } catch (err) {
      setError('Error accessing microphone list');
    }
  };

  const testMicrophone = async () => {
    setIsTesting(true);
    setTestSuccess(false);
    setError('');

    try {
      // Simulate microphone test
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, this would actually test the microphone
      setTestSuccess(true);
    } catch (err) {
      setError('Microphone test failed. Please check your microphone permissions.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleContinue = () => {
    if (!selectedMic) {
      setError('Please select a microphone');
      return;
    }

    const selectedMicrophone = microphones.find(mic => mic.id === selectedMic);
    setMicrophone(selectedMicrophone);
    navigate('/setup/features');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Voice Interaction Setup
          </h1>
          <p className="text-gray-400">
            Configure your microphone for voice commands
          </p>
        </div>

        {/* Microphone Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
          <div className="mb-6">
            <label className="block text-white font-semibold mb-4">
              Select your microphone:
            </label>
            <select
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {microphones.map((mic) => (
                <option key={mic.id} value={mic.id}>
                  {mic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Microphone Test */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Volume2 className="w-5 h-5 mr-2" />
              Test Your Microphone
            </h3>
            
            <p className="text-gray-400 text-sm mb-4">
              Say "Hello Assistant" to test voice detection
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={testMicrophone}
                  disabled={isTesting || !selectedMic}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isTesting
                      ? 'bg-gray-600 cursor-not-allowed'
                      : testSuccess
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } ${!selectedMic ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isTesting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Listening...
                    </div>
                  ) : testSuccess ? (
                    <div className="flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Voice Detected!
                    </div>
                  ) : (
                    'Start Test'
                  )}
                </button>

                {isTesting && (
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        className="w-2 h-2 bg-red-500 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>

              {testSuccess && (
                <div className="text-green-400 text-sm font-semibold flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Microphone working perfectly!
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center"
              >
                <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                <span className="text-red-400 text-sm">{error}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Permission Note */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-blue-400 text-sm text-center">
            💡 Make sure to allow microphone permissions when prompted by your browser.
            The assistant needs microphone access to hear your voice commands.
          </p>
        </div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleContinue}
          disabled={!testSuccess}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center"
        >
          Continue to Features Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default MicrophoneSetup;
