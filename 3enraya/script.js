const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const STORAGE_KEY = 'tres-en-raya-scores';
const SETTINGS_KEY = 'tres-en-raya-settings';

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const statusPieceEl = document.getElementById('status-piece');
const statusTextEl = document.getElementById('status-text');
const winLineEl = document.getElementById('win-line');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');
const labelOEl = document.getElementById('label-o');
const btnRestart = document.getElementById('btn-restart');
const btnResetScores = document.getElementById('btn-reset-scores');
const btnSound = document.getElementById('btn-sound');
const particlesCanvas = document.getElementById('particles');
const modeBtns = document.querySelectorAll('.mode-btn');
const cpuOptionsEl = document.getElementById('cpu-options');
const tournamentOptionsEl = document.getElementById('tournament-options');
const tournamentBarEl = document.getElementById('tournament-bar');
const tournamentFormatLabel = document.getElementById('tournament-format-label');
const tournamentXEl = document.getElementById('tournament-x');
const tournamentOEl = document.getElementById('tournament-o');
const tournamentDotsEl = document.getElementById('tournament-dots');
const tournamentOverlay = document.getElementById('tournament-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySubtitle = document.getElementById('overlay-subtitle');
const btnNewTournament = document.getElementById('btn-new-tournament');
const difficultyBtns = document.querySelectorAll('[data-difficulty]');
const formatBtns = document.querySelectorAll('[data-format]');
const tournamentTypeBtns = document.querySelectorAll('[data-tournament-type]');
const chatPanel = document.getElementById('chat-panel');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatSenderBtns = document.querySelectorAll('.chat__sender-btn');
const onlinePanel = document.getElementById('online-panel');
const onlineMenu = document.getElementById('online-menu');
const onlineWaiting = document.getElementById('online-waiting');
const onlineBar = document.getElementById('online-bar');
const gameArea = document.getElementById('game-area');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');
const btnCopyLink = document.getElementById('btn-copy-link');
const btnCancelRoom = document.getElementById('btn-cancel-room');
const roomCodeInput = document.getElementById('room-code-input');
const roomCodeDisplay = document.getElementById('room-code-display');
const onlineStatusEl = document.getElementById('online-status');
const onlineYouEl = document.getElementById('online-you');
const onlineRivalEl = document.getElementById('online-rival');
const connectionDot = document.getElementById('online-connection-dot');
const chatSenderGroup = document.querySelector('.chat__sender');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver = false;
let mode = 'pvp';
let difficulty = 'hard';
let tournamentFormat = 3;
let tournamentType = 'pvp';
let tournamentScores = { x: 0, o: 0 };
let tournamentFinished = false;
let scores = { x: 0, o: 0, draw: 0 };
let particles = [];
let animFrameId = null;
let chatSender = 'X';
const MAX_CHAT_MESSAGES = 50;

let peer = null;
let conn = null;
let onlineRole = null;
let myPlayer = null;
let onlineConnected = false;
let roomCode = '';
let joinTimeoutId = null;
const PEER_PREFIX = 'enraya-';

/* ── Filtro de palabrotas ── */
const BAD_WORDS = [
  'puta', 'puto', 'putas', 'putos', 'putita', 'putito', 'putear', 'puteo',
  'mierda', 'mierdas', 'mierdoso',
  'joder', 'jodete', 'jodido', 'jodida', 'jodidos', 'jodidas', 'jodanse', 'jodan',
  'coño', 'cono', 'cojones', 'cojon', 'cojona', 'cojonudo',
  'cabron', 'cabrona', 'cabrones', 'cabronazo',
  'hijoputa', 'hijaputa', 'hijodeputa', 'hijadeputa',
  'hostia', 'ostia', 'hostias', 'ostias',
  'gilipollas', 'gilipolla', 'gilipolleces',
  'maricon', 'marica', 'maricas', 'maricona',
  'imbecil', 'subnormal', 'mogolico', 'retrasado', 'retrasada',
  'pendejo', 'pendeja', 'pendejos', 'pendejada',
  'culero', 'culera', 'culeros',
  'chingar', 'chingada', 'chingado', 'chinga', 'chingas', 'chingatumadre',
  'carajo', 'carajos', 'carajillo',
  'verga', 'vergas',
  'mamada', 'mamadas', 'mamarracho', 'mamón', 'mamon', 'mamona',
  'polla', 'pollas',
  'zorra', 'zorras', 'zorron',
  'capulla', 'capullo', 'capullos',
  'boludo', 'boluda', 'boludos',
  'follar', 'follado', 'follada', 'follador',
  'pinche', 'pinches',
  'chingada', 'malparido', 'malparida',
  'gonorrea', 'huevon', 'huevona', 'weon', 'weona',
  'ctm', 'ctmr', 'lpm', 'vrg', 'ptm',
];

const BAD_PHRASES = [
  'hijo de puta', 'hija de puta', 'hijos de puta',
  'la puta madre', 'tu puta madre', 'vete a la mierda',
  'que te jodan', 'que os jodan', 'me cago en',
  'piece of shit', 'fuck you', 'fuck off',
];

function normalizeForFilter(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[@4]/g, 'a')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/\$/g, 's')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function maskWord(word) {
  if (word.length <= 2) return '**';
  return word[0] + '*'.repeat(word.length - 1);
}

function censorMessage(text) {
  let result = text;
  let censored = false;

  for (const phrase of BAD_PHRASES) {
    const parts = phrase.split(' ').map(w =>
      w.split('').join('[\\s\\W\\d@$037157!]*')
    );
    const pattern = new RegExp(parts.join('[\\s\\W\\d@$037157!]+'), 'gi');
    result = result.replace(pattern, (match) => {
      censored = true;
      return '*'.repeat(match.length);
    });
  }

  result = result.split(/(\s+)/).map((part) => {
    if (/^\s+$/.test(part)) return part;

    const lettersOnly = part.replace(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]/g, '');
    const normalized = normalizeForFilter(lettersOnly);

    for (const bad of BAD_WORDS) {
      if (normalized === bad || (bad.length >= 4 && normalized.includes(bad))) {
        censored = true;
        return maskWord(part);
      }
    }

    if (lettersOnly.length >= 3) {
      const compact = normalized.replace(/\s/g, '');
      for (const bad of BAD_WORDS) {
        if (bad.length >= 4 && compact.includes(bad)) {
          censored = true;
          return maskWord(part);
        }
      }
    }

    return part;
  }).join('');

  return { text: result, censored };
}

/* ── Online multijugador (WebRTC / PeerJS) ── */
function isOnlineMode() {
  return mode === 'online';
}

function peerId(code) {
  return `${PEER_PREFIX}${code}`;
}

function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function roomLink(code) {
  const url = new URL(location.href);
  url.searchParams.set('room', code);
  return url.toString();
}

function showOnlineError(msg) {
  let el = onlinePanel.querySelector('.online-panel__error');
  if (!el) {
    el = document.createElement('p');
    el.className = 'online-panel__error';
    onlinePanel.appendChild(el);
  }
  el.textContent = msg;
  setTimeout(() => el.remove(), 5000);
}

function setOnlineLobbyState(state) {
  onlineMenu.hidden = state !== 'menu';
  onlineWaiting.hidden = state !== 'waiting';
}

function updateOnlineBar() {
  if (!onlineConnected || !myPlayer) return;
  const rival = myPlayer === 'X' ? 'O' : 'X';
  onlineYouEl.textContent = `Tú: ${myPlayer}`;
  onlineRivalEl.textContent = `Rival: ${rival}`;
  connectionDot.classList.toggle('online-bar__dot--off', !onlineConnected);
}

function sendOnline(data) {
  if (conn?.open) conn.send(data);
}

function setupConnection(connection) {
  conn = connection;
  conn.on('open', () => {
    if (joinTimeoutId) clearTimeout(joinTimeoutId);
    onlineConnected = true;
    setOnlineLobbyState('hidden');
    onlinePanel.hidden = true;
    onlineBar.hidden = false;
    gameArea.classList.remove('game-area--hidden');
    updateOnlineBar();
    clearChat();
    const welcome = chatMessages.querySelector('.chat__welcome');
    if (welcome) welcome.textContent = '¡Conectados! Escribid en el chat.';
    if (onlineRole === 'host') {
      newRound({ remote: true });
      sendOnline({ type: 'sync', board, currentPlayer, gameOver });
    }
    updateStatus();
    sfx.click();
  });

  conn.on('data', (data) => handleOnlineMessage(data));

  conn.on('close', () => {
    onlineConnected = false;
    connectionDot.classList.add('online-bar__dot--off');
    statusTextEl.textContent = 'Rival desconectado';
    boardEl.querySelectorAll('.cell').forEach(c => c.disabled = true);
  });
}

function handleOnlineMessage(data) {
  switch (data.type) {
    case 'move':
      makeMove(data.index, { remote: true });
      break;
    case 'restart':
      newRound({ remote: true });
      break;
    case 'sync':
      applySync(data);
      break;
    case 'chat':
      addChatMessage(data.sender, data.text, data.censored);
      break;
  }
}

function applySync({ board: b, currentPlayer: cp, gameOver: over }) {
  board = [...b];
  currentPlayer = cp;
  gameOver = over;
  hideWinLine();
  boardEl.querySelectorAll('.cell').forEach((cell, i) => {
    cell.innerHTML = '';
    cell.className = 'cell';
    cell.disabled = over || Boolean(board[i]);
    if (board[i]) {
      cell.classList.add('taken');
      const piece = document.createElement('span');
      piece.className = `piece piece--${board[i].toLowerCase()}`;
      piece.textContent = board[i];
      cell.appendChild(piece);
    }
  });
  updateStatus();
}

function createRoom() {
  disconnectOnline();
  mode = 'online';
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === 'online'));
  updateUI();
  tryCreateRoom();
}

function tryCreateRoom(attempts = 0) {
  roomCode = genRoomCode();
  onlineRole = 'host';
  myPlayer = 'X';
  roomCodeDisplay.textContent = roomCode;
  onlineStatusEl.textContent = 'Esperando rival…';
  setOnlineLobbyState('waiting');
  history.replaceState(null, '', roomLink(roomCode));

  peer = new Peer(peerId(roomCode));

  peer.on('open', () => {
    onlineStatusEl.textContent = 'Sala creada — comparte el enlace';
  });

  peer.on('connection', (connection) => {
    if (conn?.open) {
      connection.close();
      return;
    }
    setupConnection(connection);
    onlineStatusEl.textContent = '¡Rival conectado!';
  });

  peer.on('error', (err) => {
    if (err.type === 'unavailable-id' && attempts < 5) {
      peer.destroy();
      tryCreateRoom(attempts + 1);
      return;
    }
    showOnlineError('No se pudo crear la sala. Inténtalo de nuevo.');
    setOnlineLobbyState('menu');
  });
}

function joinRoom(code) {
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length !== 6) {
    showOnlineError('El código debe tener 6 caracteres.');
    return;
  }

  disconnectOnline();
  roomCode = clean;
  onlineRole = 'guest';
  myPlayer = 'O';
  onlineStatusEl.textContent = 'Conectando…';
  setOnlineLobbyState('waiting');
  onlineMenu.hidden = true;
  onlineWaiting.hidden = false;
  roomCodeDisplay.textContent = roomCode;
  history.replaceState(null, '', roomLink(roomCode));

  peer = new Peer();

  joinTimeoutId = setTimeout(() => {
    if (!onlineConnected) {
      showOnlineError('Sala no encontrada. ¿El rival ha creado la sala?');
      leaveOnline();
    }
  }, 15000);

  peer.on('open', () => {
    const connection = peer.connect(peerId(roomCode), { reliable: true });
    setupConnection(connection);
  });

  peer.on('error', () => {
    if (joinTimeoutId) clearTimeout(joinTimeoutId);
    showOnlineError('Error de conexión. Revisa tu internet.');
    leaveOnline();
  });
}

async function copyRoomLink() {
  try {
    await navigator.clipboard.writeText(roomLink(roomCode));
    onlineStatusEl.textContent = '¡Enlace copiado!';
    sfx.click();
    setTimeout(() => {
      if (!onlineConnected) onlineStatusEl.textContent = 'Esperando rival…';
    }, 2000);
  } catch {
    showOnlineError('No se pudo copiar. Copia el código manualmente.');
  }
}

function disconnectOnline() {
  if (conn) {
    conn.close();
    conn = null;
  }
  if (peer) {
    peer.destroy();
    peer = null;
  }
  onlineConnected = false;
  onlineRole = null;
  myPlayer = null;
  roomCode = '';

  const url = new URL(location.href);
  url.searchParams.delete('room');
  history.replaceState(null, '', url.toString());
}

function leaveOnline() {
  disconnectOnline();
  setOnlineLobbyState('menu');
  onlinePanel.hidden = false;
  onlineBar.hidden = true;
  gameArea.classList.remove('game-area--hidden');
  roomCodeInput.value = '';
  newRound({ remote: true });
}

/* ── Chat ── */
function isChatEnabled() {
  return isOnlineMode() || !isCpuMode();
}

function addChatMessage(sender, rawText, wasCensored) {
  const welcome = chatMessages.querySelector('.chat__welcome');
  if (welcome) welcome.remove();

  const msg = document.createElement('div');
  msg.className = `chat__msg chat__msg--${sender.toLowerCase()}${wasCensored ? ' chat__msg--censored' : ''}`;

  const author = document.createElement('span');
  author.className = 'chat__msg-author';
  if (isOnlineMode() && myPlayer) {
    author.textContent = sender === myPlayer ? `Tú (${sender})` : `Rival (${sender})`;
  } else {
    author.textContent = sender === 'X' ? 'Jugador X' : 'Jugador O';
  }

  const bubble = document.createElement('span');
  bubble.className = 'chat__msg-bubble';
  bubble.textContent = rawText;

  msg.append(author, bubble);

  if (wasCensored) {
    const flag = document.createElement('span');
    flag.className = 'chat__msg-flag';
    flag.textContent = '⚠ palabrota censurada';
    msg.appendChild(flag);
  }

  chatMessages.appendChild(msg);

  while (chatMessages.children.length > MAX_CHAT_MESSAGES) {
    chatMessages.firstChild.remove();
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage(text) {
  const trimmed = text.trim();
  if (!trimmed || !isChatEnabled()) return;
  if (isOnlineMode() && !onlineConnected) return;

  const sender = isOnlineMode() ? myPlayer : chatSender;
  const { text: clean, censored } = censorMessage(trimmed);
  addChatMessage(sender, clean, censored);

  if (isOnlineMode()) {
    sendOnline({ type: 'chat', sender, text: clean, censored });
  }
  sfx.click();
}

function clearChat() {
  chatMessages.innerHTML = '<p class="chat__welcome">¡Echad un par de palabras! Escribid como X u O.</p>';
}

function updateChatSenderUI() {
  chatSenderBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sender === chatSender);
  });
}

/* ── Sound engine (Web Audio API) ── */
const sfx = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  tone(freq, duration, { type = 'sine', volume = 0.25, delay = 0 } = {}) {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  },

  place(player) {
    const freq = player === 'X' ? 880 : 660;
    this.tone(freq, 0.12, { type: 'sine', volume: 0.2 });
    this.tone(freq * 1.5, 0.08, { type: 'triangle', volume: 0.08, delay: 0.04 });
  },

  win() {
    [523, 659, 784, 1047].forEach((f, i) => {
      this.tone(f, 0.25, { type: 'square', volume: 0.12, delay: i * 0.1 });
    });
  },

  draw() {
    this.tone(330, 0.3, { type: 'sawtooth', volume: 0.1 });
    this.tone(220, 0.4, { type: 'sawtooth', volume: 0.08, delay: 0.15 });
  },

  click() {
    this.tone(1200, 0.05, { type: 'sine', volume: 0.1 });
  },

  tournamentWin() {
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => {
      this.tone(f, 0.3, { type: 'square', volume: 0.1, delay: i * 0.12 });
    });
  },

  toggle() {
    this.enabled = !this.enabled;
    btnSound.textContent = this.enabled ? '🔊' : '🔇';
    btnSound.classList.toggle('muted', !this.enabled);
    btnSound.setAttribute('aria-label', this.enabled ? 'Desactivar sonido' : 'Activar sonido');
    saveSettings();
    if (this.enabled) this.click();
  },
};

function init() {
  buildBoard();
  loadScores();
  loadSettings();
  bindEvents();
  updateUI();
  newRound();

  const roomParam = new URLSearchParams(location.search).get('room');
  if (roomParam) {
    mode = 'online';
    modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === 'online'));
    updateUI();
    roomCodeInput.value = roomParam.toUpperCase();
    joinRoom(roomParam);
  }
}

function buildBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `Celda ${i + 1}`);
    cell.addEventListener('click', () => handleCellClick(i));
    boardEl.appendChild(cell);
  }
}

function bindEvents() {
  btnRestart.addEventListener('click', () => { sfx.click(); newRound(); });
  btnResetScores.addEventListener('click', () => { sfx.click(); resetScores(); });
  btnSound.addEventListener('click', () => sfx.toggle());
  btnNewTournament.addEventListener('click', () => { sfx.click(); startTournament(); });

  btnCreateRoom.addEventListener('click', () => { sfx.click(); createRoom(); });
  btnJoinRoom.addEventListener('click', () => {
    sfx.click();
    joinRoom(roomCodeInput.value);
  });
  btnCopyLink.addEventListener('click', () => copyRoomLink());
  btnCancelRoom.addEventListener('click', () => { sfx.click(); leaveOnline(); });

  roomCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      joinRoom(roomCodeInput.value);
    }
  });

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.click();
      if (mode === 'online') leaveOnline();
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      if (mode === 'tournament') startTournament();
      else if (mode === 'online') {
        tournamentFinished = false;
        tournamentOverlay.hidden = true;
        updateUI();
      } else {
        tournamentFinished = false;
        tournamentOverlay.hidden = true;
        updateUI();
        newRound();
      }
      saveSettings();
    });
  });

  difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.click();
      difficultyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      difficulty = btn.dataset.difficulty;
      saveSettings();
    });
  });

  formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.click();
      formatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tournamentFormat = parseInt(btn.dataset.format, 10);
      startTournament();
      saveSettings();
    });
  });

  tournamentTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.click();
      tournamentTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tournamentType = btn.dataset.tournamentType;
      startTournament();
      saveSettings();
    });
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendChatMessage(chatInput.value);
    chatInput.value = '';
  });

  chatSenderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      chatSender = btn.dataset.sender;
      updateChatSenderUI();
      sfx.click();
    });
  });

  document.addEventListener('click', () => sfx.init(), { once: true });
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

function isCpuMode() {
  return mode === 'cpu' || (mode === 'tournament' && tournamentType === 'cpu');
}

function winsNeeded() {
  return Math.ceil(tournamentFormat / 2);
}

function updateUI() {
  const cpu = isCpuMode();
  const online = isOnlineMode();
  cpuOptionsEl.hidden = !cpu;
  tournamentOptionsEl.hidden = mode !== 'tournament';
  tournamentBarEl.hidden = mode !== 'tournament';
  onlinePanel.hidden = !online || onlineConnected;
  onlineBar.hidden = !online || !onlineConnected;
  gameArea.classList.toggle('game-area--hidden', online && !onlineConnected);

  if (online) {
    setOnlineLobbyState(onlineConnected ? 'hidden' : 'menu');
    labelOEl.textContent = 'Jugador O';
    chatPanel.hidden = false;
    if (chatSenderGroup) chatSenderGroup.hidden = true;
    if (myPlayer) chatSender = myPlayer;
  } else {
    if (cpu) clearChat();
    chatPanel.hidden = cpu;
    if (chatSenderGroup) chatSenderGroup.hidden = false;
    labelOEl.textContent = cpu ? 'CPU' : 'Jugador O';
  }

  tournamentFormatLabel.textContent = `Al mejor de ${tournamentFormat}`;
  updateTournamentDisplay();
  updateOnlineBar();
}

function startTournament() {
  tournamentScores = { x: 0, o: 0 };
  tournamentFinished = false;
  tournamentOverlay.hidden = true;
  updateUI();
  newRound();
}

function updateTournamentDisplay() {
  tournamentXEl.textContent = tournamentScores.x;
  tournamentOEl.textContent = tournamentScores.o;

  const needed = winsNeeded();
  tournamentDotsEl.innerHTML = '';

  const groupX = document.createElement('div');
  groupX.className = 'tournament-bar__dot-group';
  for (let i = 0; i < needed; i++) {
    const dot = document.createElement('span');
    dot.className = 'tournament-dot' + (i < tournamentScores.x ? ' tournament-dot--x' : '');
    groupX.appendChild(dot);
  }

  const groupO = document.createElement('div');
  groupO.className = 'tournament-bar__dot-group';
  for (let i = 0; i < needed; i++) {
    const dot = document.createElement('span');
    dot.className = 'tournament-dot' + (i < tournamentScores.o ? ' tournament-dot--o' : '');
    groupO.appendChild(dot);
  }

  tournamentDotsEl.append(groupX, groupO);
}

function loadScores() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) scores = { ...scores, ...JSON.parse(saved) };
  } catch (_) { /* ignore */ }
  updateScoreDisplay();
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return;
    const s = JSON.parse(saved);
    mode = s.mode ?? mode;
    difficulty = s.difficulty ?? difficulty;
    tournamentFormat = s.tournamentFormat ?? tournamentFormat;
    tournamentType = s.tournamentType ?? tournamentType;
    sfx.enabled = s.soundEnabled ?? true;

    modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    difficultyBtns.forEach(b => b.classList.toggle('active', b.dataset.difficulty === difficulty));
    formatBtns.forEach(b => b.classList.toggle('active', parseInt(b.dataset.format, 10) === tournamentFormat));
    tournamentTypeBtns.forEach(b => b.classList.toggle('active', b.dataset.tournamentType === tournamentType));
    btnSound.textContent = sfx.enabled ? '🔊' : '🔇';
    btnSound.classList.toggle('muted', !sfx.enabled);
  } catch (_) { /* ignore */ }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    mode,
    difficulty,
    tournamentFormat,
    tournamentType,
    soundEnabled: sfx.enabled,
  }));
}

function saveScores() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

function updateScoreDisplay() {
  scoreXEl.textContent = scores.x;
  scoreOEl.textContent = scores.o;
  scoreDrawEl.textContent = scores.draw;
}

function resetScores() {
  scores = { x: 0, o: 0, draw: 0 };
  saveScores();
  updateScoreDisplay();
}

function newRound({ remote = false } = {}) {
  if (mode === 'tournament' && tournamentFinished) return;

  if (!isOnlineMode()) {
    chatSender = 'X';
    updateChatSenderUI();
  } else if (myPlayer) {
    chatSender = myPlayer;
  }

  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  hideWinLine();
  stopParticles();

  boardEl.querySelectorAll('.cell').forEach(cell => {
    cell.innerHTML = '';
    cell.className = 'cell';
    cell.disabled = false;
  });

  updateStatus();

  if (isOnlineMode() && onlineConnected && !remote) {
    sendOnline({ type: 'restart' });
  }
}

function handleCellClick(index) {
  if (gameOver || board[index] || tournamentFinished) return;
  if (isCpuMode() && currentPlayer === 'O') return;
  if (isOnlineMode()) {
    if (!onlineConnected || currentPlayer !== myPlayer) return;
  }

  makeMove(index);

  if (!gameOver && isCpuMode() && currentPlayer === 'O') {
    cpuTurn();
  }
}

function cpuTurn() {
  statusEl.classList.add('status--thinking');
  statusTextEl.textContent = 'CPU pensando';
  statusPieceEl.style.display = 'none';

  const delay = difficulty === 'easy' ? 300 : difficulty === 'medium' ? 500 : 700;
  setTimeout(() => {
    const move = getCpuMove();
    if (move !== -1) makeMove(move);
    statusEl.classList.remove('status--thinking');
    statusPieceEl.style.display = '';
  }, delay + Math.random() * 300);
}

function makeMove(index, { remote = false } = {}) {
  if (board[index]) return;

  board[index] = currentPlayer;
  const cell = boardEl.children[index];
  cell.classList.add('taken');
  cell.disabled = true;

  const piece = document.createElement('span');
  piece.className = `piece piece--${currentPlayer.toLowerCase()}`;
  piece.textContent = currentPlayer;
  cell.appendChild(piece);

  sfx.place(currentPlayer);

  const result = checkWinner();
  if (result) {
    endGame(result);
    if (isOnlineMode() && onlineConnected && !remote) {
      sendOnline({ type: 'move', index });
    }
    return;
  }

  if (board.every(c => c !== null)) {
    endGame({ winner: null });
    if (isOnlineMode() && onlineConnected && !remote) {
      sendOnline({ type: 'move', index });
    }
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();

  if (isOnlineMode() && onlineConnected && !remote) {
    sendOnline({ type: 'move', index });
  }
}

function checkWinner() {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

function endGame({ winner, line }) {
  gameOver = true;
  boardEl.querySelectorAll('.cell').forEach(c => c.disabled = true);

  if (winner) {
    scores[winner.toLowerCase()]++;
    saveScores();
    updateScoreDisplay();

    line.forEach(i => boardEl.children[i].classList.add('winning'));
    drawWinLine(line);

    statusEl.classList.add('status--win');
    statusPieceEl.textContent = winner;
    statusPieceEl.className = `status__piece status__piece--${winner.toLowerCase()}`;

    if (mode === 'tournament') {
      tournamentScores[winner.toLowerCase()]++;
      updateTournamentDisplay();
      const needed = winsNeeded();

      if (tournamentScores[winner.toLowerCase()] >= needed) {
        tournamentFinished = true;
        const name = winner === 'X' ? 'Jugador X' : (isCpuMode() ? 'CPU' : 'Jugador O');
        overlayTitle.textContent = '¡Campeón del torneo!';
        overlaySubtitle.textContent = `${name} gana el torneo al mejor de ${tournamentFormat}`;
        tournamentOverlay.hidden = false;
        sfx.tournamentWin();
        launchParticles('#ffd700');
      } else {
        statusTextEl.textContent = `¡gana la ronda! (${tournamentScores[winner.toLowerCase()]}/${needed})`;
        sfx.win();
        launchParticles(winner === 'X' ? '#00f0ff' : '#ff2d6a');
        setTimeout(() => { if (!tournamentFinished) newRound(); }, 1800);
      }
    } else {
      statusTextEl.textContent = '¡gana la partida!';
      sfx.win();
      launchParticles(winner === 'X' ? '#00f0ff' : '#ff2d6a');
    }
  } else {
    scores.draw++;
    saveScores();
    updateScoreDisplay();

    statusPieceEl.style.display = 'none';
    statusTextEl.textContent = mode === 'tournament' ? '¡Empate! — siguiente ronda' : '¡Empate!';
    boardEl.classList.add('shake');
    sfx.draw();
    setTimeout(() => boardEl.classList.remove('shake'), 400);

    if (mode === 'tournament') {
      setTimeout(() => newRound(), 1500);
    }
  }
}

function updateStatus() {
  statusEl.classList.remove('status--win');
  statusPieceEl.style.display = '';
  statusPieceEl.textContent = currentPlayer;
  statusPieceEl.className = `status__piece status__piece--${currentPlayer.toLowerCase()}`;

  if (mode === 'tournament' && !tournamentFinished) {
    const needed = winsNeeded();
    statusTextEl.textContent = `— ronda (${tournamentScores.x} vs ${tournamentScores.o}, a ${needed})`;
  } else if (isOnlineMode()) {
    if (!onlineConnected) {
      statusTextEl.textContent = '— conecta con un rival';
    } else if (gameOver) {
      statusTextEl.textContent = '— partida terminada';
    } else if (currentPlayer === myPlayer) {
      statusTextEl.textContent = '— tu turno';
    } else {
      statusTextEl.textContent = '— turno del rival';
    }
  } else if (isCpuMode() && currentPlayer === 'O') {
    statusTextEl.textContent = '— turno CPU';
  } else {
    statusTextEl.textContent = '— tu turno';
  }
}

function getCellCenter(index) {
  const cell = boardEl.children[index];
  const boardRect = boardEl.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  return {
    x: cellRect.left + cellRect.width / 2 - boardRect.left - 8,
    y: cellRect.top + cellRect.height / 2 - boardRect.top - 8,
  };
}

function drawWinLine(indices) {
  const [a, , c] = indices;
  const start = getCellCenter(a);
  const end = getCellCenter(c);
  const line = winLineEl.querySelector('line');

  const length = Math.hypot(end.x - start.x, end.y - start.y);
  line.setAttribute('x1', start.x);
  line.setAttribute('y1', start.y);
  line.setAttribute('x2', end.x);
  line.setAttribute('y2', end.y);
  line.style.strokeDasharray = length + 20;
  line.style.strokeDashoffset = length + 20;

  winLineEl.classList.add('visible');
}

function hideWinLine() {
  winLineEl.classList.remove('visible');
}

/* ── CPU AI ── */
function getCpuMove() {
  if (difficulty === 'easy') return getEasyMove();
  if (difficulty === 'medium') return getMediumMove();
  return getBestMove();
}

function getEmptyCells(b = board) {
  return b.map((c, i) => c === null ? i : -1).filter(i => i !== -1);
}

function findWinningMove(player, b = board) {
  for (const i of getEmptyCells(b)) {
    b[i] = player;
    const won = checkWinnerOn(b)?.winner === player;
    b[i] = null;
    if (won) return i;
  }
  return -1;
}

function getEasyMove() {
  const win = findWinningMove('O');
  if (win !== -1 && Math.random() < 0.6) return win;

  const block = findWinningMove('X');
  if (block !== -1 && Math.random() < 0.5) return block;

  const empty = getEmptyCells();
  if (board[4] === null && Math.random() < 0.4) return 4;
  return empty[Math.floor(Math.random() * empty.length)];
}

function getMediumMove() {
  const win = findWinningMove('O');
  if (win !== -1) return win;

  const block = findWinningMove('X');
  if (block !== -1) return block;

  if (Math.random() < 0.25) {
    const empty = getEmptyCells();
    return empty[Math.floor(Math.random() * empty.length)];
  }

  const scored = [];
  for (const i of getEmptyCells()) {
    board[i] = 'O';
    const score = minimax(board, 0, false);
    board[i] = null;
    scored.push({ i, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0].score;
  const candidates = scored.filter(s => s.score >= best - 2);
  return candidates[Math.floor(Math.random() * candidates.length)].i;
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(b, depth, isMaximizing) {
  const result = checkWinnerOn(b);
  if (result?.winner === 'O') return 10 - depth;
  if (result?.winner === 'X') return depth - 10;
  if (b.every(c => c !== null)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = 'O';
        best = Math.max(best, minimax(b, depth + 1, false));
        b[i] = null;
      }
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = 'X';
      best = Math.min(best, minimax(b, depth + 1, true));
      b[i] = null;
    }
  }
  return best;
}

function checkWinnerOn(b) {
  for (const [a, bb, c] of WIN_LINES) {
    if (b[a] && b[a] === b[bb] && b[a] === b[c]) {
      return { winner: b[a] };
    }
  }
  return null;
}

/* ── Particles ── */
function resizeCanvas() {
  particlesCanvas.width = window.innerWidth;
  particlesCanvas.height = window.innerHeight;
}

function launchParticles(color) {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < 80; i++) {
    const angle = (Math.PI * 2 * i) / 80 + Math.random() * 0.3;
    const speed = 2 + Math.random() * 6;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      size: 2 + Math.random() * 4,
      color,
    });
  }

  if (!animFrameId) animateParticles();
}

function animateParticles() {
  const ctx = particlesCanvas.getContext('2d');
  ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

  particles = particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= p.decay;

    if (p.life <= 0) return false;

    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    return true;
  });

  ctx.globalAlpha = 1;

  if (particles.length > 0) {
    animFrameId = requestAnimationFrame(animateParticles);
  } else {
    animFrameId = null;
  }
}

function stopParticles() {
  particles = [];
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  particlesCanvas.getContext('2d').clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
}

init();
