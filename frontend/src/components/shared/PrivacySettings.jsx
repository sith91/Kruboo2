import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useConfigStore } from '../../stores/configStore';
import { Shield, Eye, EyeOff, Cloud, CloudOff, Database, Cpu } from 'lucide-react';

const PrivacySettings = () => {
  const { privacySettings, setPrivacySettings } = useConfigStore();
  const [activeTab, setActiveTab] = useState('data-collection');

  const tabs = [
    { id: 'data-collection', label: 'Data Collection', icon: Eye },
    { id: 'cloud-sync', label: 'Cloud Sync', icon: Cloud },
    { id: 'processing', label: 'Processing', icon: Cpu },
    { id: 'storage', label: 'Storage', icon: Database }
  ];

  const dataCollectionOptions = [
    {
      level: 'minimal',
      title: 'Minimal',
      description: 'Only essential data for core functionality',
      icon: EyeOff,
      features: [
        'Basic command history',
        'Anonymous crash reports',
        'Essential performance data'
      ]
    },
    {
      level: 'balanced',
      title: 'Balanced',
      description: 'Balance between features and privacy',
      icon: Eye,
      features: [
        'Enhanced command history',
        'Usage patterns for improvement',
        'Performance analytics',
        'Anonymous feature usage'
      ]
    },
    {
      level: 'full',
      title: 'Full Analytics',
      description: 'Help improve the assistant with detailed data',
      icon: Shield,
      features: [
        'Detailed command analytics',
        'Voice samples for improvement',
        'Full usage patterns',
        'Feature performance data'
      ]
    }
  ];

  const handleDataCollectionChange = (level) => {
    setPrivacySettings({
      ...privacySettings,
      dataCollection: level
    });
  };

  const handleCloudSyncToggle = (enabled) => {
    setPrivacySettings({
      ...privacySettings,
      cloudSync: enabled
    });
  };

  const handleAnalyticsToggle = (enabled) => {
    setPrivacySettings({
      ...privacySettings,
      shareAnalytics: enabled
    });
  };

  const ActiveTabIcon = tabs.find(tab => tab.id === activeTab)?.icon || Shield;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Privacy & Data Control</h1>
        <p className="text-gray-400">
          Your data is encrypted end-to-end. You maintain full control.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center py-4 px-6 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <TabIcon className="w-4 h-4 mr-2" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Data Collection Tab */}
          {activeTab === 'data-collection' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Data Collection Level</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Choose how much data you're comfortable sharing to improve your experience.
                </p>
                
                <div className="grid gap-4">
                  {dataCollectionOptions.map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <div
                        key={option.level}
                        onClick={() => handleDataCollectionChange(option.level)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          privacySettings.dataCollection === option.level
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              privacySettings.dataCollection === option.level
                                ? 'bg-blue-500'
                                : 'bg-white/10'
                            }`}>
                              <OptionIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{option.title}</h4>
                              <p className="text-gray-400 text-sm mt-1">{option.description}</p>
                              <ul className="mt-3 space-y-1">
                                {option.features.map((feature, index) => (
                                  <li key={index} className="text-gray-400 text-sm flex items-center">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            privacySettings.dataCollection === option.level
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-400'
                          }`}>
                            {privacySettings.dataCollection === option.level && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Analytics Toggle */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">Anonymous Usage Data</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Share anonymous data to help improve the assistant
                    </p>
                  </div>
                  <button
                    onClick={() => handleAnalyticsToggle(!privacySettings.shareAnalytics)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacySettings.shareAnalytics ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacySettings.shareAnalytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Cloud Sync Tab */}
          {activeTab === 'cloud-sync' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Cloud Synchronization</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Sync your settings and preferences across devices. All data is encrypted end-to-end.
                </p>
                
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-semibold">Enable Cloud Sync</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Sync your assistant settings across all your devices
                      </p>
                    </div>
                    <button
                      onClick={() => handleCloudSyncToggle(!privacySettings.cloudSync)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.cloudSync ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.cloudSync ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {privacySettings.cloudSync && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-black/20 rounded-lg"
                    >
                      <h5 className="text-white font-medium mb-2">Sync Status</h5>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex justify-between">
                          <span>Settings:</span>
                          <span className="text-green-400">Synced</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Command History:</span>
                          <span className="text-green-400">Synced</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Voice Profiles:</span>
                          <span className="text-green-400">Synced</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Add other tabs similarly */}
        </div>
      </div>

      {/* Security Assurance */}
      <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-green-400 mr-3" />
          <div>
            <h4 className="text-green-400 font-semibold">Your Data is Secure</h4>
            <p className="text-green-400 text-sm mt-1">
              All data is encrypted using military-grade encryption. We never sell your data to third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
