import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfigStore } from '../../stores/configStore';
import { 
  ArrowRight, 
  Check, 
  FileText, 
  Monitor, 
  Search, 
  Mail, 
  Workflow,
  Shield,
  Code,
  Zap
} from 'lucide-react';

const FeatureSelection = () => {
  const navigate = useNavigate();
  const { setFeatures, completeSetup } = useConfigStore();
  const [selectedFeatures, setSelectedFeatures] = useState([
    'filesystem', 'apps', 'websearch', 'email', 'automation', 'monitoring'
  ]);

  const features = [
    {
      id: 'filesystem',
      name: 'File System Access',
      icon: FileText,
      description: 'Find, open, and manage your files and documents',
      example: '"Find my resume PDF"',
      required: true
    },
    {
      id: 'apps',
      name: 'Application Control',
      icon: Monitor,
      description: 'Launch, close, and control applications',
      example: '"Open Photoshop"',
      required: true
    },
    {
      id: 'websearch',
      name: 'Web Search',
      icon: Search,
      description: 'Search the web and gather information',
      example: '"Search for AI trends 2024"',
      required: true
    },
    {
      id: 'email',
      name: 'Email Management',
      icon: Mail,
      description: 'Read, compose, and manage your emails',
      example: '"Read my new emails"',
      required: false
    },
    {
      id: 'automation',
      name: 'Task Automation',
      icon: Workflow,
      description: 'Create and run automated workflows',
      example: '"Create command work setup"',
      required: false
    },
    {
      id: 'monitoring',
      name: 'System Monitoring',
      icon: Zap,
      description: 'Monitor system resources and performance',
      example: '"What\'s my CPU usage?"',
      required: false
    },
    {
      id: 'blockchain',
      name: 'Blockchain Features',
      icon: Shield,
      description: 'Decentralized identity and blockchain operations',
      example: '"Create my decentralized identity"',
      required: false
    },
    {
      id: 'developer',
      name: 'Developer Tools',
      icon: Code,
      description: 'Advanced development and debugging tools',
      example: '"Show API documentation"',
      required: false
    }
  ];

  const toggleFeature = (featureId) => {
    if (features.find(f => f.id === featureId)?.required) {
      return; // Don't allow disabling required features
    }

    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleCompleteSetup = () => {
    setFeatures(selectedFeatures);
    completeSetup();
    navigate('/');
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
            Enable Features You Need
          </h1>
          <p className="text-gray-400">
            Select the capabilities you want your AI assistant to have. You can always change these later.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {features.map((feature) => {
            const isSelected = selectedFeatures.includes(feature.id);
            const isRequired = feature.required;

            return (
              <motion.div
                key={feature.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isRequired && toggleFeature(feature.id)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                } ${isRequired ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                      isSelected ? 'bg-blue-500' : 'bg-white/10'
                    }`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {feature.name}
                        {isRequired && (
                          <span className="text-blue-400 text-sm ml-2">(Required)</span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-blue-400 text-sm font-mono">
                    {feature.example}
                  </p>
                </div>

                {isRequired && (
                  <div className="mt-3 text-xs text-gray-400">
                    This feature is essential for basic functionality
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Privacy Note */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <h3 className="text-white font-semibold mb-3">Privacy & Permissions</h3>
          <p className="text-gray-400 text-sm">
            Each feature requires specific permissions to function properly. Your data is encrypted 
            end-to-end and you maintain full control over what the assistant can access. 
            You can modify these permissions at any time in the settings.
          </p>
        </div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleCompleteSetup}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
        >
          Complete Setup & Start Using AI Assistant
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FeatureSelection;
