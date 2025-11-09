import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAIStore } from '../../stores/aiStore';
import { useVoiceStore } from '../../stores/voiceStore';
import { Send, Mic, MicOff, Square } from 'lucide-react';

const CommandInput = () => {
  const [input, setInput] = useState('');
  const { processCommand, isProcessing } = useAIStore();
  const { isListening, startListening, stopListening } = useVoiceStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const result = await processCommand(input, {
      source: 'text',
      timestamp: new Date()
    });

    if (result.success) {
      setInput('');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleVoiceToggle = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const quickCommands = [
    { text: 'What can you do?', emoji: '❓' },
    { text: 'Open file manager', emoji: '📁' },
    { text: 'Check system status', emoji: '💻' },
    { text: 'Search web for AI news', emoji: '🔍' },
    { text: 'Create a new note', emoji: '📝' },
    { text: 'What time is it?', emoji: '⏰' }
  ];

  const handleQuickCommand = (command) => {
    setInput(command);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
    >
      <h3 className="text-white font-semibold mb-4 text-lg">Send Command</h3>
      
      {/* Quick Commands */}
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-2">Try these commands:</p>
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickCommand(cmd.text)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors flex items-center"
            >
              <span className="mr-2">{cmd.emoji}</span>
              {cmd.text}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Command Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your command here... (e.g., 'What's the weather?' or 'Open calculator')"
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors pr-24"
            disabled={isProcessing}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
            {isProcessing ? 'Processing...' : 'Press Enter'}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center min-w-[120px]"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing
              </div>
            ) : (
              <div className="flex items-center">
                <Send className="w-4 h-4 mr-2" />
                Send
              </div>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={isProcessing}
            className={`px-6 py-4 rounded-xl transition-colors flex items-center justify-center min-w-[120px] ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } disabled:bg-gray-600 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </div>
            ) : (
              <div className="flex items-center">
                <Mic className="w-4 h-4 mr-2" />
                Voice
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Status Indicators */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-blue-400 flex items-center"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
              AI is processing your command...
            </motion.div>
          )}
          
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 flex items-center"
            >
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></div>
              Listening for voice input...
            </motion.div>
          )}
        </div>
        
        <div className="text-gray-400">
          {input.length > 0 && `${input.length} characters`}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-sm">
          💡 <strong>Tip:</strong> You can ask me to open applications, search the web, 
          manage files, check system status, or answer any questions you have!
        </p>
      </div>
    </motion.div>
  );
};

export default CommandInput;
