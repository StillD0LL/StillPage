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
   * Tactile pickup sound effect when user begins dragging an element.
   * Gentle upward pitch sweep with soft paper/card resonance.
   */
  public playPickup() {
    if (!this.settings.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0, Math.min(1, this.settings.volume)) * 0.35;
      if (vol <= 0) return;

      const pitchMod = this.settings.pitchVariation ? 1 + (Math.random() * 0.04 - 0.02) : 1;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(vol, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      masterGain.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260 * pitchMod, now);
      osc.frequency.exponentialRampToValueAtTime(440 * pitchMod, now + 0.05);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.8, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  /**
   * Satisfying drop/place sound effect when an element is placed or dropped.
   * Deep tactile thud with a slight wooden/desk resonance.
   */
  public playPlace() {
    if (!this.settings.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0, Math.min(1, this.settings.volume)) * 0.45;
      if (vol <= 0) return;

      const pitchMod = this.settings.pitchVariation ? 1 + (Math.random() * 0.04 - 0.02) : 1;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(vol, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      masterGain.connect(this.ctx.destination);

      // Low resonant physical impact
      const bodyOsc = this.ctx.createOscillator();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(140 * pitchMod, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(48 * pitchMod, now + 0.075);

      const bodyGain = this.ctx.createGain();
      bodyGain.gain.setValueAtTime(0.85, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(masterGain);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.085);

      // Soft paper/surface contact noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.015);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200 * pitchMod;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noise.start(now);
    } catch {}
  }

  /**
   * Micro mechanical ratchet tick when rotating an element.
   * Debounced for smooth tactile ratchet response.
   */
  private lastRotateSoundTime = 0;
  public playRotate() {
    if (!this.settings.enabled) return;
    const nowMs = Date.now();
    if (nowMs - this.lastRotateSoundTime < 35) return;
    this.lastRotateSoundTime = nowMs;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0, Math.min(1, this.settings.volume)) * 0.28;
      if (vol <= 0) return;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(vol, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      masterGain.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.018);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.022);
    } catch {}
  }

  /**
   * Pleasant bubble chime when creating/spawning a new element from toolbar.
   */
  public playSpawn() {
    if (!this.settings.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0, Math.min(1, this.settings.volume)) * 0.4;
      if (vol <= 0) return;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(vol, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      masterGain.connect(this.ctx.destination);

      // Rising harmonic double-tone
      [580, 880].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.045;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.15, start + 0.08);

        g.gain.setValueAtTime(0.6, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.09);

        osc.connect(g);
        g.connect(masterGain);

        osc.start(start);
        osc.stop(start + 0.1);
      });
    } catch {}
  }

  /**
   * Crisp delete sound when removing an element.
   */
  public playDelete() {
    if (!this.settings.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0, Math.min(1, this.settings.volume)) * 0.35;
      if (vol <= 0) return;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(vol, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      masterGain.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.1);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(filter);
      filter.connect(g);
      g.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {}
  }

  /**
   * Celebration cheer arpeggio for custom action buttons.
   */
  public playCheer() {
    if (!this.settings.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0, Math.min(1, this.settings.volume)) * 0.45;
      if (vol <= 0) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        const start = now + idx * 0.055;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        g.gain.setValueAtTime(vol * 0.7, start);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

        osc.connect(g);
        g.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch {}
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
