import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceStore } from '../../stores/voiceStore';
import { User, Bot, Copy, Volume2 } from 'lucide-react';

const TranscriptDisplay = () => {
  const { transcript } = useVoiceStore();

  // Mock conversation data - replace with actual data from store
  const conversation = [
    {
      id: 1,
      type: 'user',
      text: 'Hello assistant, how are you today?',
      timestamp: new Date(Date.now() - 5000)
    },
    {
      id: 2,
      type: 'assistant',
      text: "Hello! I'm doing great, thank you for asking. I'm here and ready to help you with whatever you need. What can I assist you with today?",
      timestamp: new Date(Date.now() - 3000)
    },
    ...(transcript ? [{
      id: 3,
      type: 'user',
      text: transcript,
      timestamp: new Date()
    }] : [])
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <AnimatePresence>
        {conversation.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex gap-3 ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' 
                ? 'bg-blue-500' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              {message.type === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message */}
            <div className={`flex-1 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`inline-block rounded-2xl px-4 py-2 max-w-xs lg:max-w-md ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              
              {/* Actions */}
              <div className={`flex gap-2 mt-1 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <button
                  onClick={() => copyToClipboard(message.text)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  title="Copy text"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {message.type === 'assistant' && (
                  <button
                    onClick={() => speakText(message.text)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    title="Speak text"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {conversation.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No conversation yet. Start talking to your assistant!</p>
        </div>
      )}
    </div>
  );
};

export default TranscriptDisplay;
