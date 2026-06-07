// ═══ Sistema de sonido retro (Web Audio API) ═══
const N = {
  REST: 0,
  D2: 73.42, E2: 82.41, F2: 87.31, G2: 98, A2: 110, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880,
};

const MUSIC_THEMES = {
  level_1: {
    bpm: 128,
    melody: { type: 'triangle', vol: 0.05, pattern: [
      N.E4, N.G4, N.C5, N.G4, N.A4, N.G4, N.E4, N.REST,
      N.C4, N.E4, N.G4, N.E4, N.D4, N.E4, N.C4, N.REST,
    ]},
    bass: { type: 'square', vol: 0.028, pattern: [
      N.C3, N.REST, N.C3, N.G3, N.C3, N.REST, N.A3, N.G3,
      N.C3, N.REST, N.E3, N.G3, N.F3, N.G3, N.C3, N.REST,
    ]},
  },
  level_2: {
    bpm: 104,
    melody: { type: 'sine', vol: 0.048, pattern: [
      N.A4, N.C5, N.E5, N.C5, N.A4, N.G4, N.E4, N.REST,
      N.D4, N.E4, N.A4, N.E4, N.C4, N.D4, N.A3, N.REST,
    ]},
    bass: { type: 'triangle', vol: 0.03, pattern: [
      N.A3, N.REST, N.A3, N.E3, N.A3, N.REST, N.D3, N.E3,
      N.A3, N.REST, N.C3, N.E3, N.D3, N.E3, N.A2, N.REST,
    ]},
  },
  level_3: {
    bpm: 96,
    melody: { type: 'square', vol: 0.04, pattern: [
      N.E4, N.REST, N.G4, N.A4, N.G4, N.E4, N.D4, N.REST,
      N.C4, N.D4, N.E4, N.REST, N.G4, N.A4, N.B4, N.REST,
    ]},
    bass: { type: 'sawtooth', vol: 0.022, pattern: [
      N.E3, N.REST, N.E3, N.B3, N.E3, N.REST, N.C3, N.B3,
      N.A2, N.REST, N.C3, N.E3, N.G3, N.REST, N.E3, N.REST,
    ]},
  },
  level_4: {
    bpm: 88,
    melody: { type: 'sawtooth', vol: 0.038, pattern: [
      N.D4, N.F4, N.D4, N.REST, N.C4, N.D4, N.F4, N.REST,
      N.A3, N.C4, N.D4, N.F4, N.D4, N.C4, N.A3, N.REST,
    ]},
    bass: { type: 'square', vol: 0.025, pattern: [
      N.D3, N.REST, N.D3, N.REST, N.C3, N.REST, N.F3, N.REST,
      N.A2, N.REST, N.D3, N.REST, N.G2, N.REST, N.D3, N.REST,
    ]},
  },
  level_5: {
    bpm: 118,
    melody: { type: 'sawtooth', vol: 0.052, pattern: [
      N.E4, N.REST, N.G4, N.A4, N.B4, N.A4, N.G4, N.E4,
      N.D4, N.E4, N.G4, N.B4, N.A4, N.G4, N.E4, N.REST,
      N.A4, N.B4, N.C5, N.B4, N.A4, N.G4, N.E4, N.D4,
      N.E4, N.G4, N.A4, N.B4, N.C5, N.B4, N.A4, N.REST,
    ]},
    bass: { type: 'square', vol: 0.042, pattern: [
      N.E2, N.E2, N.B2, N.E2, N.G2, N.E2, N.B2, N.E2,
      N.A2, N.A2, N.E2, N.G2, N.B2, N.A2, N.E2, N.REST,
      N.E2, N.G2, N.E2, N.B2, N.E2, N.G2, N.A2, N.B2,
      N.E2, N.E2, N.B2, N.G2, N.E2, N.A2, N.E2, N.E2,
    ]},
  },
  level_6: {
    bpm: 112,
    melody: { type: 'sine', vol: 0.052, pattern: [
      N.E5, N.REST, N.G5, N.E5, N.C5, N.REST, N.A4, N.C5,
      N.D5, N.REST, N.E5, N.G5, N.E5, N.D5, N.C5, N.REST,
    ]},
    bass: { type: 'triangle', vol: 0.026, pattern: [
      N.C3, N.REST, N.G3, N.REST, N.A3, N.REST, N.E3, N.REST,
      N.D3, N.REST, N.G3, N.REST, N.C3, N.REST, N.G3, N.REST,
    ]},
  },
  level_7: {
    bpm: 132,
    melody: { type: 'square', vol: 0.058, pattern: [
      N.G4, N.B4, N.D5, N.G4, N.E4, N.G4, N.B4, N.D5,
      N.C5, N.B4, N.G4, N.E4, N.D4, N.E4, N.G4, N.B4,
      N.D5, N.C5, N.B4, N.A4, N.G4, N.F4, N.D4, N.REST,
      N.E4, N.G4, N.B4, N.D5, N.G5, N.D5, N.B4, N.G4,
    ]},
    bass: { type: 'sawtooth', vol: 0.038, pattern: [
      N.G2, N.G2, N.D3, N.G2, N.C3, N.C3, N.G3, N.C3,
      N.E3, N.E3, N.B3, N.E3, N.A2, N.A2, N.E3, N.G2,
      N.G2, N.B2, N.D3, N.G2, N.C3, N.G2, N.E3, N.REST,
      N.G2, N.G2, N.D3, N.B2, N.G2, N.A2, N.D3, N.G2,
    ]},
  },
};

const Sound = {
  ctx: null,
  enabled: true,
  _musicTimer: null,
  _musicStep: 0,
  _musicTheme: null,
  _musicGain: null,
  _musicVol: 0.85,

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._musicGain = this.ctx.createGain();
    this._musicGain.gain.value = this.enabled ? this._musicVol : 0;
    this._musicGain.connect(this.ctx.destination);
  },

  toggle() {
    this.enabled = !this.enabled;
    if (this._musicGain) {
      this._musicGain.gain.value = this.enabled ? this._musicVol : 0;
    }
    return this.enabled;
  },

  _playMusicNote(freq, dur, type, vol) {
    if (!this.enabled || !this.ctx || !this._musicGain || !freq) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.92);
    osc.connect(gain);
    gain.connect(this._musicGain);
    osc.start(t);
    osc.stop(t + dur);
  },

  _musicTick() {
    const theme = MUSIC_THEMES[this._musicTheme];
    if (!theme || !this.enabled) return;
    const stepDur = 15 / theme.bpm;
    const i = this._musicStep % theme.melody.pattern.length;
    this._playMusicNote(theme.melody.pattern[i], stepDur, theme.melody.type, theme.melody.vol);
    this._playMusicNote(theme.bass.pattern[i], stepDur * 1.1, theme.bass.type, theme.bass.vol);
    this._musicStep++;
  },

  startMusic(themeId) {
    this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    if (this._musicTheme === themeId && this._musicTimer) return;
    this.stopMusic();
    const theme = MUSIC_THEMES[themeId];
    if (!theme) return;
    this._musicTheme = themeId;
    this._musicStep = 0;
    const stepMs = (15 / theme.bpm) * 1000;
    this._musicTick();
    this._musicTimer = setInterval(() => this._musicTick(), stepMs);
  },

  stopMusic() {
    if (this._musicTimer) {
      clearInterval(this._musicTimer);
      this._musicTimer = null;
    }
    this._musicTheme = null;
    this._musicStep = 0;
  },

  tone(freq, dur, type = 'square', vol = 0.08, slide = 0) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  },

  noise(dur, vol = 0.06) {
    if (!this.enabled || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start();
  },

  attack()    { this.tone(440, 0.08, 'square', 0.06); this.tone(220, 0.12, 'sawtooth', 0.04, -80); },
  hit()       { this.noise(0.1, 0.07); this.tone(120, 0.15, 'square', 0.05); },
  hurt()      { this.tone(180, 0.2, 'sawtooth', 0.07, -100); },
  enemyDie()  { this.tone(300, 0.1, 'square', 0.06); this.tone(150, 0.2, 'square', 0.05, -120); },
  collect()   { [523,659,784,1047].forEach((f,i) => setTimeout(() => this.tone(f, 0.12, 'square', 0.06), i * 80)); },
  portal()    { this.tone(200, 0.3, 'sine', 0.07, 400); },
  bossRoar()  { this.tone(80, 0.4, 'sawtooth', 0.1); this.noise(0.3, 0.05); },
  victory()   { [392,494,587,784,988].forEach((f,i) => setTimeout(() => this.tone(f, 0.25, 'square', 0.07), i * 150)); },
  step()      { this.tone(100 + Math.random() * 30, 0.03, 'triangle', 0.015); },
  heal()      { this.tone(440, 0.15, 'sine', 0.05); this.tone(660, 0.2, 'sine', 0.04); },
  keyPickup() { [784, 988, 1175].forEach((f, i) => setTimeout(() => this.tone(f, 0.1, 'triangle', 0.06), i * 70)); },
  jump()      { this.tone(280, 0.08, 'square', 0.05, 180); this.tone(520, 0.1, 'triangle', 0.04); },
  fart() {
    const pitch = 40 + Math.random() * 35;
    this.noise(0.14 + Math.random() * 0.08, 0.07 + Math.random() * 0.04);
    this.tone(pitch, 0.2 + Math.random() * 0.2, 'sawtooth', 0.05, -20 - Math.random() * 30);
    if (Math.random() > 0.5) this.tone(pitch * 0.7, 0.15, 'triangle', 0.03);
  },
  fartNuclear() {
    this.noise(0.35, 0.12);
    this.tone(55, 0.5, 'sawtooth', 0.08, -45);
    this.tone(38, 0.4, 'square', 0.06, -25);
    setTimeout(() => this.tone(72, 0.2, 'triangle', 0.04, 40), 120);
  },
  fartHit() { this.tone(220, 0.12, 'sine', 0.05); this.noise(0.08, 0.05); },
};
