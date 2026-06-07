// ═══ Sonido — Los Pipis Míticos (7 temas únicos) ═══
const N = {
  REST: 0,
  D2: 73.42, E2: 82.41, F2: 87.31, Fs2: 92.5, G2: 98, A2: 110, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196, A3: 220, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392, A4: 440, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880,
};

const MUSIC_THEMES = {
  level_1: {
    bpm: 132,
    melody: { type: 'triangle', vol: 0.05, pattern: [
      N.F4, N.A4, N.C5, N.A4, N.F4, N.G4, N.A4, N.REST,
      N.C4, N.F4, N.A4, N.F4, N.G4, N.A4, N.F4, N.REST,
    ]},
    bass: { type: 'square', vol: 0.03, pattern: [
      N.F2, N.REST, N.F2, N.C3, N.F2, N.REST, N.A2, N.C3,
      N.F2, N.G2, N.F2, N.C3, N.Bb2, N.C3, N.F2, N.REST,
    ]},
  },
  level_2: {
    bpm: 90,
    melody: { type: 'sine', vol: 0.046, pattern: [
      N.B3, N.D4, N.F4, N.D4, N.B3, N.A3, N.G3, N.REST,
      N.A3, N.B3, N.D4, N.F4, N.D4, N.B3, N.A3, N.REST,
      N.G3, N.B3, N.D4, N.B3, N.A3, N.G3, N.Fs2, N.REST,
    ]},
    bass: { type: 'triangle', vol: 0.028, pattern: [
      N.B2, N.REST, N.B2, N.Fs2, N.B2, N.REST, N.G2, N.Fs2,
      N.B2, N.REST, N.D3, N.Fs2, N.G2, N.B2, N.Fs2, N.REST,
    ]},
  },
  level_3: {
    bpm: 108,
    melody: { type: 'square', vol: 0.044, pattern: [
      N.D4, N.F4, N.A4, N.F4, N.D4, N.E4, N.F4, N.G4,
      N.A4, N.G4, N.F4, N.E4, N.D4, N.C4, N.D4, N.REST,
    ]},
    bass: { type: 'sawtooth', vol: 0.026, pattern: [
      N.D3, N.REST, N.A2, N.D3, N.G3, N.REST, N.D3, N.A2,
      N.D3, N.Fs2, N.G2, N.A2, N.D3, N.REST, N.A2, N.D3,
    ]},
  },
  level_4: {
    bpm: 116,
    melody: { type: 'sine', vol: 0.052, pattern: [
      N.G4, N.B4, N.D5, N.B4, N.G4, N.A4, N.B4, N.REST,
      N.D4, N.G4, N.B4, N.G4, N.A4, N.B4, N.G4, N.REST,
    ]},
    bass: { type: 'triangle', vol: 0.032, pattern: [
      N.G2, N.REST, N.D3, N.G2, N.C3, N.REST, N.G2, N.D3,
      N.G2, N.B2, N.G2, N.D3, N.C3, N.D3, N.G2, N.REST,
    ]},
  },
  level_5: {
    bpm: 125,
    melody: { type: 'sawtooth', vol: 0.048, pattern: [
      N.Bb3, N.D4, N.F4, N.Bb4, N.F4, N.D4, N.Bb3, N.REST,
      N.F3, N.Bb3, N.D4, N.F4, N.D4, N.Bb3, N.F3, N.REST,
    ]},
    bass: { type: 'square', vol: 0.038, pattern: [
      N.Bb2, N.Bb2, N.F2, N.Bb2, N.Eb3, N.REST, N.Bb2, N.F2,
      N.Bb2, N.D3, N.Bb2, N.F2, N.Eb3, N.F2, N.Bb2, N.Bb2,
    ]},
  },
  level_6: {
    bpm: 100,
    melody: { type: 'triangle', vol: 0.05, pattern: [
      N.E4, N.G4, N.B4, N.G4, N.E4, N.REST, N.D4, N.E4,
      N.G4, N.A4, N.B4, N.A4, N.G4, N.E4, N.D4, N.REST,
      N.C4, N.E4, N.G4, N.B4, N.A4, N.G4, N.E4, N.REST,
    ]},
    bass: { type: 'sine', vol: 0.03, pattern: [
      N.E2, N.REST, N.B2, N.E2, N.G2, N.REST, N.E2, N.B2,
      N.C3, N.REST, N.G2, N.B2, N.E2, N.G2, N.B2, N.E2,
    ]},
  },
  level_7: {
    bpm: 134,
    melody: { type: 'square', vol: 0.056, pattern: [
      N.C4, N.Eb4, N.G4, N.Bb4, N.G4, N.Eb4, N.C4, N.REST,
      N.Eb4, N.G4, N.Bb4, N.C5, N.Bb4, N.G4, N.Eb4, N.C4,
      N.G4, N.Bb4, N.C5, N.Bb4, N.G4, N.Eb4, N.C4, N.G3,
    ]},
    bass: { type: 'sawtooth', vol: 0.04, pattern: [
      N.C3, N.C3, N.G2, N.C3, N.Eb3, N.Eb3, N.Bb2, N.Eb3,
      N.G3, N.G3, N.Eb3, N.G3, N.C3, N.C3, N.G2, N.C3,
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
    if (this._musicGain) this._musicGain.gain.value = this.enabled ? this._musicVol : 0;
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
    if (this._musicTimer) { clearInterval(this._musicTimer); this._musicTimer = null; }
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

  attack()    { this.tone(520, 0.08, 'triangle', 0.06); this.tone(260, 0.12, 'sine', 0.04, 100); },
  hit()       { this.noise(0.08, 0.06); this.tone(200, 0.12, 'triangle', 0.05); },
  hurt()      { this.tone(220, 0.2, 'sawtooth', 0.07, -90); },
  enemyDie()  { this.tone(440, 0.1, 'triangle', 0.06); this.tone(220, 0.18, 'sine', 0.05, -100); },
  collect()   { [587,740,880,1175].forEach((f,i) => setTimeout(() => this.tone(f, 0.12, 'triangle', 0.06), i * 75)); },
  portal()    { this.tone(330, 0.3, 'sine', 0.07, 350); },
  bossRoar()  { this.tone(100, 0.35, 'sawtooth', 0.09); this.tone(660, 0.15, 'triangle', 0.04); },
  victory()   { [440,554,659,880,1109].forEach((f,i) => setTimeout(() => this.tone(f, 0.25, 'triangle', 0.07), i * 140)); },
  step()      { this.tone(180 + Math.random() * 40, 0.03, 'sine', 0.012); },
  heal()      { this.tone(523, 0.15, 'sine', 0.05); this.tone(784, 0.2, 'triangle', 0.04); },
  keyPickup() { [880, 1109, 1319].forEach((f, i) => setTimeout(() => this.tone(f, 0.1, 'triangle', 0.06), i * 65)); },
  jump()      { this.tone(350, 0.08, 'triangle', 0.05, 200); this.tone(600, 0.1, 'sine', 0.04); },
};
