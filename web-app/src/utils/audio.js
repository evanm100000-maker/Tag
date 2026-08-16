let audioCtx = null;

// Call this on a user interaction (like a click) to unlock audio
export const unlockAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playBeep = () => {
  try {
    // Fallback if not unlocked yet
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = 1000; // 1000 Hz tone
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.12); // Duration 120ms
  } catch (e) {
    console.error("Failed to play beep sound", e);
  }
};
