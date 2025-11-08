import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useConfigStore = create(
  persist(
    (set, get) => ({
      // State
      setupComplete: false,
      languages: {
        primary: 'english',
        secondary: null
      },
      voiceSettings: {
        primaryVoice: null,
        secondaryVoice: null,
        speechRate: 1.0,
        pitch: 1.0
      },
      aiModel: null,
      microphone: null,
      features: [],
      privacySettings: {
        dataCollection: 'minimal',
        cloudSync: true,
        shareAnalytics: false
      },
      
      // Actions
      setLanguages: (languages) => {
        set({ languages });
        // Save to backend
        window.electronAPI?.saveConfig({ languages });
      },
      
      setVoiceSettings: (voiceSettings) => {
        set({ voiceSettings });
        window.electronAPI?.saveConfig({ voiceSettings });
      },
      
      setAIModel: async (modelConfig) => {
        set({ aiModel: modelConfig });
        // Test connection and save
        const success = await window.electronAPI?.testAIConnection(modelConfig);
        if (success) {
          window.electronAPI?.saveConfig({ aiModel: modelConfig });
        }
        return success;
      },
      
      setMicrophone: (microphone) => {
        set({ microphone });
        window.electronAPI?.saveConfig({ microphone });
      },
      
      setFeatures: (features) => {
        set({ features });
        window.electronAPI?.saveConfig({ features });
      },
      
      setPrivacySettings: (privacySettings) => {
        set({ privacySettings });
        window.electronAPI?.saveConfig({ privacySettings });
      },
      
      completeSetup: () => {
        set({ setupComplete: true });
        window.electronAPI?.completeSetup();
      },
      
      resetSetup: () => {
        set({
          setupComplete: false,
          languages: { primary: 'english', secondary: null },
          voiceSettings: { primaryVoice: null, secondaryVoice: null, speechRate: 1.0, pitch: 1.0 },
          aiModel: null,
          microphone: null,
          features: [],
          privacySettings: {
            dataCollection: 'minimal',
            cloudSync: true,
            shareAnalytics: false
          }
        });
      }
    }),
    {
      name: 'config-storage'
    }
  )
);
