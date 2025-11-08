import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfigStore } from '../../stores/configStore';
import { ArrowRight, Globe } from 'lucide-react';

const LanguageSetup = () => {
  const navigate = useNavigate();
  const { setLanguages } = useConfigStore();
  const [primaryLanguage, setPrimaryLanguage] = useState('english');
  const [secondaryLanguage, setSecondaryLanguage] = useState('none');

  const languages = [
    { code: 'english', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'spanish', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'sinhala', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
    { code: 'tamil', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'french', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'german', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'chinese', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'japanese', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'hindi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'arabic', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
  ];

  const handleContinue = () => {
    setLanguages({
      primary: primaryLanguage,
      secondary: secondaryLanguage === 'none' ? null : secondaryLanguage
    });
    navigate('/setup/voice');
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
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Choose Your Communication Languages
          </h1>
          <p className="text-gray-400">
            Select up to 2 languages for seamless communication with your AI assistant
          </p>
        </div>

        {/* Language Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {/* Primary Language */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-4">
              Primary Language (Required)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setPrimaryLanguage(lang.code)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    primaryLanguage === lang.code
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-2">{lang.flag}</div>
                  <div className="text-white font-medium text-sm">{lang.name}</div>
                  <div className="text-gray-400 text-xs">{lang.nativeName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Language */}
          <div>
            <label className="block text-white font-semibold mb-4">
              Secondary Language (Optional)
            </label>
            <select
              value={secondaryLanguage}
              onChange={(e) => setSecondaryLanguage(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="none">None</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} - {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleContinue}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center"
        >
          Continue to Voice Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LanguageSetup;
