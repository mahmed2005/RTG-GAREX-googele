// Sound effects generator using Web Audio API (Zero external assets, instant, high fidelity)

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. Dynamic Intro Sound for Splash Screen / Entry
  public playIntroDynamicSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Deep Sub-bass Impact
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 1.2);
      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.5);

      // Sci-Fi Chime Harmony (A minor 9th gaming chord)
      const notes = [440, 554.37, 659.25, 830.61, 987.77];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = index % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0.0001, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + 2.5);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // 2. High-Tech Click Sound for Important Buttons
  public playButtonClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // 3. Success Chime (e.g. Adding to Cart, Ordering, Approving)
  public playSuccessSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.7);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
