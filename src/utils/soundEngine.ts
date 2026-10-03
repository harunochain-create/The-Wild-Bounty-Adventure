// High-fidelity Web Audio API Cowboy & Western Sound Engine
// Authentic synthesis for Western BGM, Spur Jingle (Bet), Revolver Ratchet (Spin),
// Colt .45 Gunshot & Ricochet (Wild), and Cash Register "Cring" (Scatter Hit).

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isBgmPlaying) {
      this.stopBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- 1. COWBOY BET SOUND (Spur Jingle & Saloon Poker Chip) ---
  public playBetChange() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High-frequency brass spur jingle (3 quick metallic pings)
      [0, 0.035, 0.07].forEach((delay, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3200 + idx * 400 + Math.random() * 200, now + delay);
        gain.gain.setValueAtTime(0.09, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.08);
      });

      // Leather holster thump
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(220, now);
      thud.frequency.exponentialRampToValueAtTime(80, now + 0.09);
      thudGain.gain.setValueAtTime(0.12, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      thud.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thud.start(now);
      thud.stop(now + 0.09);
    } catch {
      // Audio catch
    }
  }

  // --- 2. COWBOY SPIN SOUND (Revolver Cylinder Ratchet & Lasso Whoosh) ---
  public playCowboySpin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Rapid revolver cylinder clicks (5 rapid ratchet teeth)
      for (let i = 0; i < 5; i++) {
        const t = now + i * 0.032;
        const click = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        click.type = 'triangle';
        click.frequency.setValueAtTime(850 + i * 60, t);
        click.frequency.exponentialRampToValueAtTime(200, t + 0.02);

        clickGain.gain.setValueAtTime(0.14, t);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        click.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        click.start(t);
        click.stop(t + 0.02);
      }

      // Lasso air whoosh
      const bufferSize = this.ctx.sampleRate * 0.22;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.22);
      filter.Q.value = 3;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Audio catch
    }
  }

  // --- TURBO TUMBLE DESCENT (Dedicated High-Speed Whip-Crack Swoosh & Fast Reel Zip) ---
  public playTurboTumble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High-speed whip swoosh / laser drop sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);

      // Fast metallic zip clatter (3 rapid micro ticks)
      [0.02, 0.06, 0.10].forEach((delay, idx) => {
        if (!this.ctx) return;
        const tick = this.ctx.createOscillator();
        const tGain = this.ctx.createGain();
        tick.type = 'triangle';
        tick.frequency.setValueAtTime(1800 + idx * 300, now + delay);
        tick.frequency.exponentialRampToValueAtTime(300, now + delay + 0.025);
        tGain.gain.setValueAtTime(0.12, now + delay);
        tGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.025);

        tick.connect(tGain);
        tGain.connect(this.ctx.destination);
        tick.start(now + delay);
        tick.stop(now + delay + 0.025);
      });
    } catch {
      // Audio catch
    }
  }

  public playSpinTick() {
    this.playCowboySpin();
  }

  // --- 3. REEL STOP (Heavy Saloon Oak Clack) ---
  public playReelStop(isScatter: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Heavy oak wood clack
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.14);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);

      if (isScatter) {
        this.playCashRegisterCring();
      }
    } catch {
      // Audio catch
    }
  }

  // --- 4. CASH REGISTER "CRING" (Mesin Kasir saat Scatter Mendarat) ---
  public playCashRegisterCring(step: number = 0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const clampedStep = Math.min(5, Math.max(0, step));
      const pitchMul = Math.pow(1.08, clampedStep);

      // 1. Mechanical Cashier Latch Click ("Ka-")
      const latch = this.ctx.createOscillator();
      const latchGain = this.ctx.createGain();
      latch.type = 'triangle';
      latch.frequency.setValueAtTime(1200 * pitchMul, now);
      latch.frequency.exponentialRampToValueAtTime(250, now + 0.035);
      latchGain.gain.setValueAtTime(0.3, now);
      latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      latch.connect(latchGain);
      latchGain.connect(this.ctx.destination);
      latch.start(now);
      latch.stop(now + 0.04);

      // 2. Iconic Bright Resonant Cash Register Bell Chord ("-Ching! Cringgg!")
      // Harmonics: 2093Hz (C7), 2637Hz (E7), 3136Hz (G7), 4186Hz (C8)
      const bellFreqs = [2093.0, 2637.02, 3135.96, 4186.01];
      bellFreqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(freq * pitchMul, now + 0.015);

        const decay = 0.55 + idx * 0.08;
        bGain.gain.setValueAtTime(0.24 / (idx + 1), now + 0.015);
        bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015 + decay);

        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start(now + 0.015);
        bOsc.stop(now + 0.015 + decay);
      });

      // 3. Crisp coins dropping inside metal drawer (rapid clinks)
      [0.045, 0.085, 0.125].forEach((delay, cIdx) => {
        if (!this.ctx) return;
        const coin = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        coin.type = 'sine';
        coin.frequency.setValueAtTime((3300 + cIdx * 450) * pitchMul, now + delay);
        cGain.gain.setValueAtTime(0.14, now + delay);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);

        coin.connect(cGain);
        cGain.connect(this.ctx.destination);
        coin.start(now + delay);
        coin.stop(now + delay + 0.06);
      });
    } catch {
      // Audio catch
    }
  }

  // Alias for backward compatibility
  public playScatterHit(step: number = 0) {
    this.playCashRegisterCring(step);
  }

  // --- 5. SCATTER POP-UP FANFARE (Showdown Brass Horns) ---
  public playScatterFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // First play double cash register ring
      this.playCashRegisterCring(1);
      setTimeout(() => {
        this.playCashRegisterCring(3);
      }, 180);

      // Dramatic Western trumpet arpeggio: D4 -> F#4 -> A4 -> D5 -> F#5
      const notes = [293.66, 369.99, 440.0, 587.33, 739.99];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + 0.2 + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.01, noteTime);
        gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.55);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, noteTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.55);
      });
    } catch {
      // Audio catch
    }
  }

  // --- 6. WILD COLT .45 GUNSHOT & CANYON RICOCHET ---
  public playGunshot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Heavy explosion powder blast
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const blastFilter = this.ctx.createBiquadFilter();
      blastFilter.type = 'lowpass';
      blastFilter.frequency.setValueAtTime(1200, now);
      blastFilter.frequency.exponentialRampToValueAtTime(60, now + 0.2);

      const blastGain = this.ctx.createGain();
      blastGain.gain.setValueAtTime(0.5, now);
      blastGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      whiteNoise.connect(blastFilter);
      blastFilter.connect(blastGain);
      blastGain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // Whistling bullet ricochet
      const ricochet = this.ctx.createOscillator();
      const ricochetGain = this.ctx.createGain();
      ricochet.type = 'sawtooth';
      ricochet.frequency.setValueAtTime(2600, now + 0.04);
      ricochet.frequency.exponentialRampToValueAtTime(480, now + 0.42);

      ricochetGain.gain.setValueAtTime(0.2, now + 0.04);
      ricochetGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      ricochet.connect(ricochetGain);
      ricochetGain.connect(this.ctx.destination);
      ricochet.start(now + 0.04);
      ricochet.stop(now + 0.42);
    } catch {
      // Audio catch
    }
  }

  // --- 7. WIN & LEVEL UP FLOURISHES ---
  public playLevelUp() {
    this.playScatterFanfare();
  }

  public playWin(isBig: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const chords = isBig
        ? [523.25, 659.25, 783.99, 1046.5]
        : [440, 554.37, 659.25];

      chords.forEach((freq) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    } catch {
      // Audio catch
    }
  }

  // --- 8. COIN DROP CLINK ---
  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2100 + Math.random() * 400, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio catch
    }
  }

  // --- 8B. COUNTING TICK ("Tung, Tung, Tung, Tung") ---
  public playCountingTick(pitchMod: number = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Primary wood/metal resonant "tung" tap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(920 * pitchMod, now);
      osc.frequency.exponentialRampToValueAtTime(460 * pitchMod, now + 0.05);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);

      // Bright chime harmonic ringing overtone
      const chime = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(1840 * pitchMod, now);
      cGain.gain.setValueAtTime(0.08, now);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      chime.connect(cGain);
      cGain.connect(this.ctx.destination);
      chime.start(now);
      chime.stop(now + 0.08);
    } catch {
      // Audio catch
    }
  }

  // --- 9. COWBOY SALOON & SHOWDOWN AMBIENT GUITAR BGM ---
  public startCowboyBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    const chordsProgression = [
      [220, 261.63, 329.63], // Am
      [146.83, 220, 293.66], // Dm
      [164.81, 246.94, 329.63], // E
      [220, 261.63, 329.63], // Am
    ];

    let chordIdx = 0;
    const playNextStrum = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = chordsProgression[chordIdx % chordsProgression.length];
      chordIdx++;

      notes.forEach((freq, nIdx) => {
        if (!this.ctx) return;
        const t = now + nIdx * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 1.2);
      });

      if (chordIdx % 4 === 0 && this.ctx) {
        const whistle = this.ctx.createOscillator();
        const wGain = this.ctx.createGain();
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(1174.66, now + 0.3); // D6
        whistle.frequency.linearRampToValueAtTime(1318.51, now + 0.6); // E6
        whistle.frequency.linearRampToValueAtTime(1046.5, now + 0.9); // C6

        wGain.gain.setValueAtTime(0.02, now + 0.3);
        wGain.gain.linearRampToValueAtTime(0.035, now + 0.6);
        wGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        whistle.connect(wGain);
        wGain.connect(this.ctx.destination);
        whistle.start(now + 0.3);
        whistle.stop(now + 1.2);
      }
    };

    playNextStrum();
    this.bgmInterval = window.setInterval(playNextStrum, 1600);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startCowboyBGM();
      return true;
    }
  }

  public isMusicPlaying(): boolean {
    return this.isBgmPlaying;
  }
}

export const sound = new SoundEngine();
