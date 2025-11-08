// Voice recognition utilities
export class VoiceUtils {
  static async getAudioDevices() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Error getting audio devices:', error);
      return [];
    }
  }

  static async startRecording(stream, onDataAvailable) {
    const options = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000
    };

    const mediaRecorder = new MediaRecorder(stream, options);
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
      onDataAvailable(blob);
    };

    mediaRecorder.start(1000); // Collect data every second
    return mediaRecorder;
  }

  static calculateAudioLevel(analyser, dataArray) {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / dataArray.length / 256;
  }

  static async playAudio(audioBlob) {
    const audio = new Audio(URL.createObjectURL(audioBlob));
    return new Promise((resolve) => {
      audio.onended = resolve;
      audio.play();
    });
  }
}

// Wake word detection utilities
export class WakeWordManager {
  static defaultWakeWords = ['assistant', 'hey assistant'];

  static async trainCustomWakeWord(audioSamples, wakeWord) {
    // This would integrate with a wake word detection library
    // For now, simulate training
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          model: `custom_${wakeWord}_model`,
          confidence: 0.85
        });
      }, 2000);
    });
  }

  static validateWakeWord(wakeWord) {
    if (wakeWord.length < 2) {
      return { valid: false, error: 'Wake word too short' };
    }
    if (wakeWord.length > 20) {
      return { valid: false, error: 'Wake word too long' };
    }
    if (!/^[a-zA-Z\s]+$/.test(wakeWord)) {
      return { valid: false, error: 'Wake word can only contain letters and spaces' };
    }
    return { valid: true };
  }
}
