// Web Audio API Synthesizer - 100% Client-side 8-bit Retro Sounds
class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('neon_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('neon_muted', this.muted);
    return this.muted;
  }

  playTone(freq, type = 'square', duration = 0.1, gain = 0.15, slideTo = null) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, slideTo), this.ctx.currentTime + duration);
      }

      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // Preset Arcade SFX
  click() {
    this.playTone(600, 'sine', 0.04, 0.08);
  }

  jump() {
    this.playTone(150, 'square', 0.18, 0.15, 600);
    this.vibrate(20);
  }

  score() {
    this.playTone(523.25, 'triangle', 0.08, 0.15);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.08, 0.15), 60);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.14, 0.18), 120);
    this.vibrate(30);
  }

  laser() {
    this.playTone(880, 'sawtooth', 0.12, 0.12, 110);
    this.vibrate(15);
  }

  hit() {
    this.playTone(120, 'sawtooth', 0.15, 0.2, 40);
    this.vibrate(40);
  }

  explosion() {
    this.playTone(90, 'sawtooth', 0.3, 0.25, 20);
    this.vibrate([40, 30, 60]);
  }

  powerup() {
    [300, 450, 600, 750, 900].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.08, 0.12), i * 40);
    });
    this.vibrate([20, 20, 40]);
  }

  gameOver() {
    [400, 350, 300, 220, 160].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sawtooth', 0.16, 0.2, f * 0.7), i * 80);
    });
    this.vibrate([60, 40, 100]);
  }

  victory() {
    const notes = [523, 659, 783, 1046];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.14, 0.2), i * 100);
    });
    this.vibrate([30, 20, 30, 20, 60]);
  }

  nitro() {
    this.playTone(200, 'sawtooth', 0.4, 0.22, 1100);
    this.vibrate([30, 40, 50]);
  }

  screech() {
    this.playTone(950, 'sawtooth', 0.15, 0.12, 420);
  }

  engineRev(speedNorm) {
    if (this.muted) return;
    const freq = 60 + Math.min(220, speedNorm * 180);
    this.playTone(freq, 'sawtooth', 0.05, 0.05);
  }

  vibrate(pattern) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }
}

window.retroAudio = new RetroAudioEngine();
