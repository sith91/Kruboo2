import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfigStore } from '../../stores/configStore';
import { 
  Brain, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight, 
  Check,
  Download,
  FolderOpen
} from 'lucide-react';

const ModelConfiguration = () => {
  const navigate = useNavigate();
  const { setAIModel } = useConfigStore();
  const [selectedModel, setSelectedModel] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [localModelPath, setLocalModelPath] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const models = [
    {
      id: 'deepseek',
      name: 'DeepSeek AI',
      icon: Zap,
      description: 'Advanced reasoning & coding',
      features: ['Free tier available', 'Fast response times', 'Excellent for coding'],
      recommended: 'RECOMMENDED FOR DEVELOPERS',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      icon: Brain,
      description: 'Creative writing & analysis',
      features: ['Extensive knowledge', 'Best for creatives', 'Pay-per-use pricing'],
      recommended: 'BEST FOR CREATIVES',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'llama',
      name: 'Local Llama 2',
      icon: Shield,
      description: 'Complete privacy & offline',
      features: ['Works completely offline', 'Requires 8GB+ RAM', 'Full data control'],
      recommended: 'PRIVACY-FOCUSED USERS',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      icon: Users,
      description: 'Helpful & harmless responses',
      features: ['Business-focused', 'Strong reasoning', 'Enterprise ready'],
      recommended: 'ENTERPRISE USERS',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  const handleConfigure = async () => {
    if (!selectedModel) return;

    const config = {
      model: selectedModel.id,
      apiKey: selectedModel.id !== 'llama' ? apiKey : null,
      localPath: selectedModel.id === 'llama' ? localModelPath : null
    };

    await setAIModel(config);
    navigate('/setup/microphone');
  };

  const handleDownloadModel = async () => {
    setIsDownloading(true);
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsDownloading(false);
    setLocalModelPath('/models/llama2/');
  };

  const handleSelectModelPath = () => {
    // In Electron, this would open a file dialog
    window.electronAPI?.openFileDialog().then(path => {
      setLocalModelPath(path);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Select Your Primary AI Model
          </h1>
          <p className="text-gray-400">
            Choose the AI model that best fits your needs. You can add more models later.
          </p>
        </div>

        {/* Model Selection Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {models.map((model) => (
            <motion.div
              key={model.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModelSelect(model)}
              className={`cursor-pointer rounded-2xl border-2 transition-all duration-200 ${
                selectedModel?.id === model.id
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="p-6">
                {/* Model Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${model.color} rounded-xl flex items-center justify-center mr-4`}>
                      <model.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{model.name}</h3>
                      <p className="text-gray-400 text-sm">{model.description}</p>
                    </div>
                  </div>
                  {selectedModel?.id === model.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-4">
                  {model.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Recommended Badge */}
                <div className="bg-white/10 rounded-lg px-3 py-1 inline-block">
                  <span className="text-blue-400 text-xs font-semibold">
                    {model.recommended}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Configuration Panel */}
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
          >
            <h3 className="text-white font-semibold text-lg mb-4">
              Configure {selectedModel.name}
            </h3>

            {selectedModel.id !== 'llama' ? (
              // Cloud Model Configuration
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your API key here..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <span>Don't have an API key?</span>
                  <button
                    onClick={() => window.open('https://platform.deepseek.com/api_keys', '_blank')}
                    className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Get One
                  </button>
                </div>
              </div>
            ) : (
              // Local Model Configuration
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleDownloadModel}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl transition-colors"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Downloading (8GB)...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download Model
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSelectModelPath}
                    className="flex-1 flex items-center justify-center p-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  >
                    <FolderOpen className="w-5 h-5 mr-2" />
                    Use Existing
                  </button>
                </div>
                {localModelPath && (
                  <p className="text-green-400 text-sm">
                    ✅ Model ready at: {localModelPath}
                  </p>
                )}
              </div>
            )}

            {/* Test Connection */}
            {apiKey && selectedModel.id !== 'llama' && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Testing connection...</span>
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleConfigure}
          disabled={!selectedModel || (selectedModel.id !== 'llama' && !apiKey) || (selectedModel.id === 'llama' && !localModelPath)}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center"
        >
          Continue to Microphone Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ModelConfiguration;
