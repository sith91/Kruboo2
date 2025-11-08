import { create } from 'zustand';

export const useVoiceStore = create((set, get) => ({
  // State
  isListening: false,
  isSpeaking: false,
  isMuted: false,
  transcript: '',
  wakeWordDetected: false,
  audioLevel: 0,
  error: null,
  
  // Actions
  startListening: async () => {
    try {
      set({ isListening: true, error: null });
      await window.electronAPI?.startVoiceRecognition();
    } catch (error) {
      set({ error: error.message, isListening: false });
    }
  },
  
  stopListening: async () => {
    try {
      set({ isListening: false });
      await window.electronAPI?.stopVoiceRecognition();
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  toggleMute: () => {
    set((state) => {
      const newMutedState = !state.isMuted;
      window.electronAPI?.toggleMute(newMutedState);
      return { isMuted: newMutedState };
    });
  },
  
  setTranscript: (transcript) => {
    set({ transcript });
  },
  
  setWakeWordDetected: (detected) => {
    set({ wakeWordDetected: detected });
  },
  
  setAudioLevel: (level) => {
    set({ audioLevel: level });
  },
  
  setSpeaking: (speaking) => {
    set({ isSpeaking: speaking });
  },
  
  clearTranscript: () => {
    set({ transcript: '' });
  }
}));
