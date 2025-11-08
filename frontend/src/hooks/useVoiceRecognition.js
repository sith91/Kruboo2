import { useState, useEffect, useCallback } from 'react';
import { useVoiceStore } from '../stores/voiceStore';

export const useVoiceRecognition = () => {
  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    setTranscript,
    setAudioLevel
  } = useVoiceStore();

  const [recognition, setRecognition] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setHasPermission(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setHasPermission(false);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
      };

      setRecognition(recognition);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [setTranscript]);

  const startListeningWithPermissions = useCallback(async () => {
    try {
      // Request microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start audio level monitoring
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const checkAudioLevel = () => {
        if (!isListening) return;
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setAudioLevel(average / 256);
        
        requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
      
      // Start speech recognition
      if (recognition) {
        recognition.start();
        await startListening();
      }
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setHasPermission(false);
    }
  }, [recognition, isListening, startListening, setAudioLevel]);

  const stopListeningWithCleanup = useCallback(async () => {
    if (recognition) {
      recognition.stop();
    }
    await stopListening();
    setAudioLevel(0);
  }, [recognition, stopListening, setAudioLevel]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListeningWithCleanup();
    } else {
      startListeningWithPermissions();
    }
  }, [isListening, startListeningWithPermissions, stopListeningWithCleanup]);

  return {
    isListening,
    isSpeaking,
    transcript,
    hasPermission,
    startListening: startListeningWithPermissions,
    stopListening: stopListeningWithCleanup,
    toggleListening,
    setTranscript
  };
};
