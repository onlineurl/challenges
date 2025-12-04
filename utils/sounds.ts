let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch(e) {
        console.error("Web Audio API is not supported in this browser");
        return null;
      }
    }
  }
  return audioContext;
};

const playSound = (type: 'sine' | 'square' | 'sawtooth' | 'triangle', frequency: number, duration: number, volume: number) => {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') {
    ctx?.resume();
  }
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

export const playSuccessSound = () => {
  playSound('sine', 600, 0.2, 0.3);
  setTimeout(() => playSound('sine', 800, 0.3, 0.3), 100);
};

export const playSpecialSuccessSound = () => {
  playSound('triangle', 523.25, 0.2, 0.4); // C5
  setTimeout(() => playSound('triangle', 659.25, 0.2, 0.4), 150); // E5
  setTimeout(() => playSound('triangle', 783.99, 0.3, 0.4), 300); // G5
};
