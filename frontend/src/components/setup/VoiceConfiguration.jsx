import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfigStore } from '../../stores/configStore';
import { Volume2, Play, ArrowRight, Check } from 'lucide-react';

const VoiceConfiguration = () => {
  const navigate = useNavigate();
  const { languages, setVoiceSettings } = useConfigStore();
  const [primaryVoice, setPrimaryVoice] = useState('');
  const [secondaryVoice, setSecondaryVoice] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isTesting, setIsTesting] = useState(false);

  const voiceOptions = {
    english: [
      { id: 'david', name: 'David', description: 'American English - Neutral', gender: 'male' },
      { id: 'elizabeth', name: 'Elizabeth', description: 'British English - Formal', gender: 'female' },
      { id: 'jennifer', name: 'Jennifer', description: 'American English - Friendly', gender: 'female' },
      { id: 'brian', name: 'Brian', description: 'Australian English - Casual', gender: 'male' }
    ],
    sinhala: [
      { id: 'mahesh', name: 'මහේෂ', description: 'Sinhala - Male', gender: 'male' },
      { id: 'nisha', name: 'නිශා', description: 'Sinhala - Female', gender: 'female' }
    ],
    spanish: [
      { id: 'carlos', name: 'Carlos', description: 'Spanish - Neutral', gender: 'male' },
      { id: 'sofia', name: 'Sofía', description: 'Spanish - Friendly', gender: 'female' }
    ]
    // Add more languages as needed
  };

  useEffect(() => {
    // Set default voices
    if (languages.primary && voiceOptions[languages.primary]) {
      setPrimaryVoice(voiceOptions[languages.primary][0].id);
    }
    if (languages.secondary && voiceOptions[languages.secondary]) {
      setSecondaryVoice(voiceOptions[languages.secondary][0].id);
    }
  }, [languages]);

  const testVoice = async (voiceId, language) => {
    setIsTesting(true);
    
    // Simulate voice test - in real implementation, this would use TTS
    const testPhrases = {
      english: "Hello! I'm your AI assistant ready to help you",
      sinhala: "හෙලෝ! මම ඔබේ AI සහායකයා. මට ඔබට උදව් කළ හැකියි",
      spanish: "¡Hola! Soy tu asistente de IA listo para ayudarte"
    };

    const phrase = testPhrases[language] || testPhrases.english;
    
    // In real implementation, this would call the TTS system
    console.log(`Testing voice ${voiceId} with phrase: ${phrase}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTesting(false);
  };

  const handleContinue = () => {
    const voiceSettings = {
      primaryVoice,
      secondaryVoice: languages.secondary ? secondaryVoice : null,
      speechRate,
      pitch
    };
    
    setVoiceSettings(voiceSettings);
    navigate('/setup/model');
  };

  const getCurrentVoices = (language) => {
    return voiceOptions[language] || [];
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
              <Volume2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Configure Voices for Each Language
          </h1>
          <p className="text-gray-400">
            Choose how your AI assistant should sound in each language
          </p>
        </div>

        {/* Primary Language Voice */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
          <h3 className="text-white font-semibold text-lg mb-4">
            Primary Language: {languages.primary?.charAt(0).toUpperCase() + languages.primary?.slice(1)}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Voice Selection
              </label>
              <div className="grid gap-2">
                {getCurrentVoices(languages.primary).map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setPrimaryVoice(voice.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      primaryVoice === voice.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{voice.name}</div>
                        <div className="text-gray-400 text-sm">{voice.description}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            testVoice(voice.id, languages.primary);
                          }}
                          disabled={isTesting}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Play className="w-4 h-4 text-white" />
                        </button>
                        {primaryVoice === voice.id && (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Speech Rate
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Pitch
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Language Voice */}
        {languages.secondary && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
            <h3 className="text-white font-semibold text-lg mb-4">
              Secondary Language: {languages.secondary?.charAt(0).toUpperCase() + languages.secondary?.slice(1)}
            </h3>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Voice Selection
              </label>
              <div className="grid gap-2">
                {getCurrentVoices(languages.secondary).map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSecondaryVoice(voice.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      secondaryVoice === voice.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{voice.name}</div>
                        <div className="text-gray-400 text-sm">{voice.description}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            testVoice(voice.id, languages.secondary);
                          }}
                          disabled={isTesting}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Play className="w-4 h-4 text-white" />
                        </button>
                        {secondaryVoice === voice.id && (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleContinue}
          disabled={!primaryVoice || (languages.secondary && !secondaryVoice)}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center"
        >
          Continue to AI Model Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default VoiceConfiguration;
