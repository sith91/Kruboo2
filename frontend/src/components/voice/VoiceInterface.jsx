import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceStore } from '../../stores/voiceStore';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  X
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import TranscriptDisplay from './TranscriptDisplay';

const VoiceInterface = () => {
  const {
    isListening,
    isSpeaking,
    transcript,
    wakeWordDetected,
    startListening,
    stopListening,
    toggleMute
  } = useVoiceStore();

  const [isOpen, setIsOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const handleMicClick = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  return (
    <>
      {/* Floating Orb */}
      <motion.div
        drag
        dragConstraints={{
          top: 0,
          left: 0,
          right: window.innerWidth - 100,
          bottom: window.innerHeight - 100
        }}
        className={`fixed bottom-8 right-8 z-50 ${
          wakeWordDetected ? 'w-24 h-24' : 'w-20 h-20'
        } rounded-full shadow-2xl cursor-move transition-all duration-300 ${
          isListening 
            ? 'bg-red-500' 
            : isSpeaking 
            ? 'bg-blue-500'
            : wakeWordDetected
            ? 'bg-green-500'
            : 'bg-gradient-to-r from-purple-600 to-blue-600'
        }`}
      >
        {/* Main Orb */}
        <button
          onClick={handleMicClick}
          className="w-full h-full flex items-center justify-center text-white relative"
        >
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-white"
              />
            )}
          </AnimatePresence>

          {isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>

        {/* Wake Word Indicator */}
        <AnimatePresence>
          {wakeWordDetected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold"
            >
              Listening
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Transcript Panel */}
      <AnimatePresence>
        {isOpen && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-8 right-8 bg-black/80 backdrop-blur-lg rounded-2xl border border-white/20 p-6 max-w-2xl mx-auto z-40"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Conversation</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <TranscriptDisplay />
            
            {/* Audio Visualizer */}
            <div className="mt-4">
              <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceInterface;
