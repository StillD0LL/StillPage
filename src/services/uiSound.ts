import { UiSoundSettings } from '../types';
import { storage } from './storage';

export const DEFAULT_UI_SOUND_SETTINGS: UiSoundSettings = {
  enabled: true, // Enabled by default
  volume: 0.4, // 0.0 to 1.0 (40% default volume)
  pitchVariation: true, // Subtle variation for organic feel
};

class UiSoundEngine {
  private ctx: AudioContext | null = null;
  private settings: UiSoundSettings = DEFAULT_UI_SOUND_SETTINGS;
  private isInitialized = false;
  private lastPlayTime = 0;

  constructor() {
    // Load persisted settings
    this.settings = storage.getUiSoundSettings();
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getSettings(): UiSoundSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<UiSoundSettings>): UiSoundSettings {
    this.settings = { ...this.settings, ...updates };
    storage.saveUiSoundSettings(this.settings);
    return this.getSettings();
  }

  public isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Play the crisp tactile UI click sound effect.
   * Accurately reproduces the uploaded snappy mechanical switch / soft UI pop.
   */
  public playClick(force = false) {
    if (!force && !this.settings.enabled) return;

    // Debounce rapid fire within 25ms to avoid stacking glitches
    const nowMs = Date.now();
    if (nowMs - this.lastPlayTime < 25) return;
    this.lastPlayTime = nowMs;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0, Math.min(1, this.settings.volume));
      if (vol <= 0) return;

      // Subtle organic pitch variation (+/- 3%) so fast clicks feel satisfyingly tactile
      const pitchMod = this.settings.pitchVariation ? 1 + (Math.random() * 0.06 - 0.03) : 1;

      // Master Gain for Click
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(vol * 0.45, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      masterGain.connect(this.ctx.destination);

      // 1. High-frequency transient snap (the crisp attack)
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'sine';
      snapOsc.frequency.setValueAtTime(2300 * pitchMod, now);
      snapOsc.frequency.exponentialRampToValueAtTime(750 * pitchMod, now + 0.015);

      snapGain.gain.setValueAtTime(0.7, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      snapOsc.connect(snapGain);
      snapGain.connect(masterGain);

      snapOsc.start(now);
      snapOsc.stop(now + 0.02);

      // 2. Resonant warm body pop (gives the switch/bubble tactile depth)
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(520 * pitchMod, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(140 * pitchMod, now + 0.038);

      bodyGain.gain.setValueAtTime(0.6, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(masterGain);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.048);

      // 3. Filtered micro-noise burst for physical tactile switch click texture
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.01); // 10ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 3400 * pitchMod;
      noiseFilter.Q.value = 3.2;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noise.start(now);
    } catch {
      // Audio context might be restricted before first user interaction
    }
  }

  /**
   * Initializes a global delegated listener on window to capture user interaction clicks.
   */
  public initGlobalListener() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    const handleGlobalClick = (event: MouseEvent) => {
      if (!this.settings.enabled) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Check if clicked element or parent is interactive
      const interactiveEl = target.closest(
        'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="menuitem"], [role="option"], .cursor-pointer, [data-sound="click"], [data-clickable="true"]'
      );

      if (interactiveEl) {
        // Allow elements to opt out via data-no-sound="true"
        if (interactiveEl.closest('[data-no-sound="true"]')) {
          return;
        }
        this.playClick();
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
  }
}

export const uiSound = new UiSoundEngine();
