import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceStore } from '../../stores/voiceStore';
import { Mic, MicOff, Brain, Settings, X, MessageCircle } from 'lucide-react';

const FloatingOrb = () => {
  const {
    isListening,
    isSpeaking,
    wakeWordDetected,
    startListening,
    stopListening,
    transcript
  } = useVoiceStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 120 });

  const handleMicClick = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const handleDragStart = (e, info) => {
    setIsDragging(true);
  };

  const handleDragEnd = (e, info) => {
    setIsDragging(false);
    // Save position to localStorage
    localStorage.setItem('orbPosition', JSON.stringify({
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    }));
  };

  useEffect(() => {
    // Load saved position
    const savedPosition = localStorage.getItem('orbPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  const getOrbState = () => {
    if (wakeWordDetected) return 'wake-word';
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const orbState = getOrbState();

  const stateConfig = {
    'idle': {
      color: 'from-purple-600 to-blue-600',
      icon: Brain,
      pulse: false
    },
    'listening': {
      color: 'from-red-500 to-pink-600',
      icon: Mic,
      pulse: true
    },
    'speaking': {
      color: 'from-blue-500 to-cyan-600',
      icon: MessageCircle,
      pulse: true
    },
    'wake-word': {
      color: 'from-green-500 to-emerald-600',
      icon: Mic,
      pulse: true
    }
  };

  const config = stateConfig[orbState];
  const IconComponent = config.icon;

  return (
    <>
      {/* Floating Orb */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={position}
        animate={position}
        className={`fixed z-50 cursor-move ${
          isExpanded ? 'w-80 h-96' : 'w-20 h-20'
        } transition-all duration-300`}
        style={{
          x: position.x,
          y: position.y
        }}
      >
        {/* Main Orb */}
        <motion.div
          className={`w-full h-full rounded-full bg-gradient-to-r ${config.color} shadow-2xl flex items-center justify-center relative ${
            config.pulse ? 'floating-orb' : ''
          } ${isDragging ? 'scale-110' : ''}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button
            onClick={handleMicClick}
            className="w-full h-full flex items-center justify-center text-white relative"
            disabled={isDragging}
          >
            {/* Animated rings when listening/speaking */}
            <AnimatePresence>
              {(isListening || isSpeaking) && (
                <>
                  <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-white"
                  />
                  <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 rounded-full border-2 border-white"
                  />
                </>
              )}
            </AnimatePresence>

            {/* Main icon */}
            <IconComponent className={`${isExpanded ? 'w-8 h-8' : 'w-6 h-6'}`} />

            {/* Status indicator */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
              orbState === 'listening' ? 'bg-red-400' :
              orbState === 'speaking' ? 'bg-blue-400' :
              orbState === 'wake-word' ? 'bg-green-400' :
              'bg-gray-400'
            }`} />
          </button>

          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`absolute -top-2 -left-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors ${
              isExpanded ? 'rotate-45' : ''
            }`}
          >
            {isExpanded ? <X className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
          </button>
        </motion.div>

        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute top-full left-0 mt-4 w-80 bg-slate-800/90 backdrop-blur-lg rounded-2xl p-4 border border-white/10 shadow-2xl"
            >
              <div className="space-y-4">
                {/* Status */}
                <div className="text-center">
                  <h3 className="text-white font-semibold mb-2">Assistant Status</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    orbState === 'idle' ? 'bg-gray-500 text-white' :
                    orbState === 'listening' ? 'bg-red-500 text-white' :
                    orbState === 'speaking' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                    {orbState.replace('-', ' ').toUpperCase()}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="text-white text-sm font-medium mb-2">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors">
                      Open Apps
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors">
                      Search Web
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors">
                      Check Email
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors">
                      System Info
                    </button>
                  </div>
                </div>

                {/* Recent Transcript */}
                {transcript && (
                  <div>
                    <h4 className="text-white text-sm font-medium mb-2">Last Command</h4>
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-white text-sm">{transcript}</p>
                    </div>
                  </div>
                )}

                {/* Settings Shortcut */}
                <div className="pt-2 border-t border-white/10">
                  <button className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors flex items-center justify-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Open Settings
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        .floating-orb {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
};

export default FloatingOrb;
