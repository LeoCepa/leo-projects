// ═══════════════════════════════════════════════════════════
//  LOS PIPIS MÍTICOS — Segunda parte
// ═══════════════════════════════════════════════════════════

const TILE = 32;
const SAVE_KEY = 'pipis-miticos-progress';
const PREQUEL_GAME_URL = '../cacas-maestras/index.html';
const SEQUEL_GAME_URL = '../pedos-rey-javi/index.html';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  running: false,
  paused: false,
  currentLevelIndex: 0,
  currentWorld: 'level_1',
  maxUnlockedLevel: 0,
  player: null,
  collected: new Set(),
  enemies: [],
  particles: [],
  slashes: [],
  projectiles: [],
  slamWaves: [],
  banners: [],
  keys: {},
  startTime: 0,
  camera: { x: 0, y: 0, targetX: 0, targetY: 0 },
  kills: 0,
  stepTimer: 0,
  walkFrame: 0,
  gfxReady: false,
  sanctuaryKey: false,
  keyDrop: null,
};

function world() { return WORLDS[state.currentWorld]; }
function currentLevel() { return getLevel(state.currentLevelIndex); }

function showGameBanner(title, text, duration = 210, urgent = false) {
  state.banners.push({ title, text, life: duration, maxLife: duration, urgent });
}

function updateBanners() {
  state.banners = state.banners.filter(b => --b.life > 0);
}

function getSaveData() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); }
  catch { return {}; }
}

function loadProgress() {
  const data = getSaveData();
  state.maxUnlockedLevel = data.unlocked ?? 0;
  state.collected = new Set(data.collected ?? []);
}

function saveProgress(opts = {}) {
  const payload = {
    unlocked: state.maxUnlockedLevel,
    collected: [...state.collected],
  };
  if (state.player) {
    payload.session = {
      levelIndex: opts.nextLevel ?? state.currentLevelIndex,
      player: {
        hp: state.player.hp,
        maxHp: state.player.maxHp,
        level: state.player.level,
        xp: state.player.xp,
        attackPower: state.player.attackPower,
      },
      kills: state.kills,
      startTime: state.startTime || Date.now(),
    };
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  updateContinueButtons();
}

function hasContinueSave() {
  const data = getSaveData();
  if (data.session) return true;
  return (data.unlocked ?? 0) > 0 || (data.collected?.length ?? 0) > 0;
}

function getContinueLevelIndex() {
  const data = getSaveData();
  if (data.session?.levelIndex != null) return data.session.levelIndex;
  return Math.min(state.maxUnlockedLevel, LEVELS.length - 1);
}

function updateContinueButtons() {
  const buttons = [
    document.getElementById('btn-continue'),
    document.getElementById('btn-continue-intro'),
    document.getElementById('btn-continue-gameover'),
  ].filter(Boolean);
  if (!buttons.length) return;

  const can = hasContinueSave();
  const data = getSaveData();
  let label;
  if (can) {
    const idx = Math.min(Math.max(getContinueLevelIndex(), 0), LEVELS.length - 1);
    const lv = getLevel(idx);
    const pipis = data.collected?.length ?? state.collected.size;
    label = `▶ Continuar — Nivel ${lv.num}: ${lv.name.split(' ').slice(0, 2).join(' ')} (${pipis}/7) <span class="key-hint">[Espacio / C]</span>`;
  } else {
    label = '▶ Continuar <span class="key-hint">(empieza una partida nueva primero)</span>';
  }

  buttons.forEach(btn => {
    btn.disabled = !can;
    btn.innerHTML = label;
  });
}

function makePlayer(tx, ty) {
  return {
    x: tx * TILE + TILE / 2,
    y: ty * TILE + TILE / 2,
    hp: 100, maxHp: 100,
    speed: 3,
    invuln: 0,
    attackCd: 0,
    attackPower: 25,
    facing: { x: 0, y: 1 },
    level: 1,
    xp: 0,
    jumpTimer: 0,
    jumpDuration: 24,
  };
}

function getJumpHeight(p) {
  if (!p || p.jumpTimer <= 0) return 0;
  const t = (p.jumpDuration - p.jumpTimer) / p.jumpDuration;
  return Math.sin(t * Math.PI) * 20;
}

function tryJump() {
  const p = state.player;
  if (!p || p.jumpTimer > 0) return;
  p.jumpTimer = p.jumpDuration;
  Sound.jump();
}

function initEnemies(worldId) {
  const defs = ENEMIES_BY_WORLD[worldId] || [];
  state.enemies = defs.map(e => ({
    ...e,
    world: worldId,
    px: e.x * TILE + TILE / 2,
    py: e.y * TILE + TILE / 2,
    maxHp: e.hp,
    patrolIdx: 0,
    moveTimer: 0,
    moveDelay: e.boss ? 55 : 40,
    hitFlash: 0,
    dead: false,
    radius: e.radius || (e.boss ? 16 : 12),
    phase: 0,
    phaseAnnounced: 0,
    slamTimer: 60,
    projTimer: 40,
  }));
}

function getBossPhase(e) {
  if (!e.boss) return 0;
  const pct = e.hp / e.maxHp;
  if (pct <= 0.25) return 2;
  if (pct <= 0.5) return 1;
  return 0;
}

function getBossDamage(e) {
  if (!e.boss) return 12;
  if (e.bossConfig?.damage) return e.bossConfig.damage[e.phase] ?? e.bossConfig.damage[0];
  const base = e.damage || 24;
  return e.phase >= 1 ? Math.round(base * 1.45) : base;
}

function getBossChase(e) {
  if (!e.boss) return 0;
  if (e.bossConfig?.chase) return e.bossConfig.chase[e.phase] ?? e.bossConfig.chase[0];
  return e.phase >= 1 ? 2.0 : 1.3;
}

function checkBossPhase(e) {
  if (!e.boss || e.dead) return;
  const newPhase = getBossPhase(e);
  e.phase = newPhase;
  if (newPhase <= e.phaseAnnounced || newPhase === 0) return;
  e.phaseAnnounced = newPhase;
  Sound.bossRoar();
  spawnParticles(e.px, e.py, newPhase >= 2 ? '#ffcc00' : '#ffe566', 12 + newPhase * 8, newPhase >= 2);

  const cfg = e.bossConfig;
  if (cfg?.phaseMsgs?.[newPhase]) {
    const [title, text] = cfg.phaseMsgs[newPhase];
    showGameBanner(title, text, 240, newPhase >= 2);
  } else if (newPhase === 1) {
    showGameBanner('⚠️ ¡El jefe se enfurece!', `${e.name} ataca con más fuerza y velocidad.`, 210);
  } else if (newPhase === 2) {
    showGameBanner('💀 ¡Furia máxima!', `${e.name} desata todo su poder.`, 240, true);
  }
}

function damagePlayer(amount, srcX, srcY) {
  const p = state.player;
  if (p.invuln > 0) return;
  p.hp -= amount;
  p.invuln = 50;
  Sound.hurt();
  spawnParticles(srcX ?? p.x, srcY ?? p.y, '#ff0000', 6);
  if (p.hp <= 0) showGameOver();
  updateHUD();
}

function spawnBossProjectile(boss) {
  const ang = Math.atan2(state.player.y - boss.py, state.player.x - boss.px);
  state.projectiles.push({
    x: boss.px, y: boss.py,
    vx: Math.cos(ang) * 4,
    vy: Math.sin(ang) * 4,
    radius: 10,
    damage: 28 + boss.phase * 8,
    life: 140,
    color: '#c9a020',
  });
}

function triggerBossSlam(boss) {
  state.slamWaves.push({
    x: boss.px, y: boss.py,
    radius: 16,
    maxRadius: 95,
    grow: 4,
    life: 24,
    damage: 22 + boss.phase * 8,
    hit: false,
  });
  Sound.hit();
}

function updateBossAbilities(e) {
  if (!e.boss || e.dead) return;
  const cfg = e.bossConfig;

  if (cfg?.slamFromPhase != null && e.phase >= cfg.slamFromPhase) {
    e.slamTimer--;
    const interval = cfg.slamInterval?.[e.phase] ?? 100;
    if (e.slamTimer <= 0) {
      e.slamTimer = interval;
      triggerBossSlam(e);
    }
  }

  if (cfg?.projectileFromPhase != null && e.phase >= cfg.projectileFromPhase) {
    e.projTimer--;
    if (e.projTimer <= 0) {
      e.projTimer = cfg.projectileInterval ?? 90;
      spawnBossProjectile(e);
    }
  }
}

function updateProjectiles() {
  const p = state.player;
  state.projectiles = state.projectiles.filter(pr => {
    pr.x += pr.vx;
    pr.y += pr.vy;
    pr.life--;
    if (pr.life <= 0) return false;
    if (Math.hypot(p.x - pr.x, p.y - pr.y) < pr.radius + 10) {
      damagePlayer(pr.damage, pr.x, pr.y);
      return false;
    }
    return true;
  });
}

function updateSlamWaves() {
  const p = state.player;
  state.slamWaves = state.slamWaves.filter(sw => {
    sw.radius += sw.grow;
    sw.life--;
    if (!sw.hit && Math.abs(Math.hypot(p.x - sw.x, p.y - sw.y) - sw.radius) < 14) {
      sw.hit = true;
      damagePlayer(sw.damage, sw.x, sw.y);
    }
    return sw.life > 0 && sw.radius < sw.maxRadius;
  });
}

function loadLevel(index, { resetPlayer = false, showIntro = true } = {}) {
  const lv = getLevel(index);
  state.currentLevelIndex = index;
  state.currentWorld = lv.id;
  state.particles = [];
  state.slashes = [];
  state.projectiles = [];
  state.slamWaves = [];
  state.banners = [];
  state.sanctuaryKey = false;
  state.keyDrop = null;

  if (resetPlayer || !state.player) {
    state.player = makePlayer(lv.spawn.x, lv.spawn.y);
  } else {
    state.player.x = lv.spawn.x * TILE + TILE / 2;
    state.player.y = lv.spawn.y * TILE + TILE / 2;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 25);
  }

  state.walkFrame = 0;
  state.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
  initEnemies(lv.id);
  updateHUD();
  updateInventory();
  renderLevelSelect();

  if (showIntro) {
    setTimeout(() => showDialog(`🗺️ Nivel ${lv.num}: ${lv.name}`, lv.intro), 300);
  }
  if (state.player) saveProgress();
}

function resetGame() {
  state.collected = new Set();
  state.kills = 0;
  state.startTime = Date.now();
  state.maxUnlockedLevel = 0;
  state.player = null;
  loadLevel(0, { resetPlayer: true, showIntro: true });
}

function isBossDefeated() {
  return !state.enemies.some(e => !e.dead && e.boss);
}

function isGateOpen() {
  return state.sanctuaryKey;
}

function getSanctuaryGateY() {
  return currentLevel().pipi.y + 2;
}

function isSanctuaryLocked(tx, ty) {
  if (isGateOpen() || isLevelPipiCollected()) return false;
  const c = currentLevel().pipi;
  const gateY = getSanctuaryGateY();
  if (tx === c.x && ty >= c.y && ty < gateY) return true;
  if (Math.abs(tx - c.x) <= 1 && Math.abs(ty - c.y) <= 2) return true;
  return false;
}

function getNearestKeyDrop() {
  if (!state.keyDrop || state.sanctuaryKey) return null;
  if (Math.hypot(state.player.x - state.keyDrop.x, state.player.y - state.keyDrop.y) < 40)
    return state.keyDrop;
  return null;
}

function pickupSanctuaryKey() {
  state.sanctuaryKey = true;
  state.keyDrop = null;
  Sound.keyPickup();
  spawnParticles(state.player.x, state.player.y, '#ffd700', 14, true);
  spawnGateOpenEffect();
  showDialog('🗝️ Llave obtenida', 'El muro sagrado se ha abierto. Sube al altar y reclama el Pipi Mítico.');
}

function getNearestGate() {
  if (isGateOpen()) return null;
  const w = world();
  const tx = Math.floor(state.player.x / TILE);
  const ty = Math.floor(state.player.y / TILE);
  for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const gx = tx + dx, gy = ty + dy;
    if (gx >= 0 && gy >= 0 && gx < w.cols && gy < w.rows && w.map[gy][gx] === T.GATE)
      return { x: gx, y: gy };
  }
  return null;
}

function isBlocked(tx, ty, forPlayer = false) {
  const w = world();
  if (tx < 0 || ty < 0 || tx >= w.cols || ty >= w.rows) return true;
  if (isSanctuaryLocked(tx, ty)) return true;
  const t = w.map[ty][tx];
  if (t === T.GATE) return !isGateOpen();
  if (t === T.PIT) return !forPlayer;
  return t === T.WATER || t === T.ROCK || t === T.SKY;
}

function checkPitFall() {
  const p = state.player;
  if (!p || p.jumpTimer > 0) return;
  const tx = Math.floor(p.x / TILE);
  const ty = Math.floor(p.y / TILE);
  if (world().map[ty]?.[tx] !== T.PIT) return;
  spawnParticles(p.x, p.y, '#2a2030', 18, true);
  Sound.hurt();
  showGameOver();
}

function spawnGateOpenEffect() {
  const w = world();
  for (let row = 0; row < w.rows; row++)
    for (let col = 0; col < w.cols; col++)
      if (w.map[row][col] === T.GATE)
        spawnParticles(col * TILE + TILE / 2, row * TILE + TILE / 2, '#ffd700', 14, true);
}

function isLevelPipiCollected() {
  return state.collected.has(currentLevel().pipi.id);
}

function getPipiInLevel() {
  const c = currentLevel().pipi;
  if (state.collected.has(c.id)) return null;
  return c;
}

function getNearestPipi() {
  const c = getPipiInLevel();
  if (!c || !isGateOpen()) return null;
  const cx = c.x * TILE + TILE / 2, cy = c.y * TILE + TILE / 2;
  if (Math.hypot(state.player.x - cx, state.player.y - cy) < 48) return c;
  return null;
}

function getNearestExit() {
  const ex = currentLevel().exit;
  const tx = Math.floor(state.player.x / TILE);
  const ty = Math.floor(state.player.y / TILE);
  if (tx === ex.x && ty === ex.y) {
    if (!isLevelPipiCollected()) return { ...ex, locked: true };
    return ex;
  }
  return null;
}

function getNearestNPC() {
  const npcs = NPCS_BY_WORLD[state.currentWorld] || [];
  for (const n of npcs) {
    if (Math.hypot(state.player.x - (n.x * TILE + TILE / 2), state.player.y - (n.y * TILE + TILE / 2)) < 48)
      return n;
  }
  return null;
}

function getNearestHeal() {
  for (const h of (HEALS_BY_WORLD[state.currentWorld] || [])) {
    if (Math.hypot(state.player.x - (h.x * TILE + TILE / 2), state.player.y - (h.y * TILE + TILE / 2)) < 40)
      return h;
  }
  return null;
}

function spawnParticles(x, y, color, count = 8, star = false) {
  for (let i = 0; i < count; i++) {
    const life = 20 + Math.random() * 20;
    state.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - (star ? 2 : 0),
      life, maxLife: life,
      color,
      size: star ? 3 + Math.random() * 2 : 2 + Math.random() * 3,
      star,
    });
  }
}

let dialogOnClose = null;

function getActiveScreenId() {
  const active = document.querySelectorAll('.screen.active');
  return active.length ? active[active.length - 1].id : null;
}

function isOverlayOpen() {
  return getActiveScreenId() !== null;
}

function focusOverlayButton(btnId) {
  const btn = document.getElementById(btnId);
  if (btn) requestAnimationFrame(() => btn.focus());
}

function openMainMenu() {
  document.getElementById('screen-intro').classList.remove('active');
  document.getElementById('screen-menu').classList.add('active');
  loadProgress();
  updateContinueButtons();
  renderLevelSelect();
  focusOverlayButton(hasContinueSave() ? 'btn-continue' : 'btn-start');
}

function showStoryIntro() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-intro').classList.add('active');
  focusOverlayButton('btn-intro');
}

function closeDialog() {
  const screen = document.getElementById('screen-dialog');
  if (!screen.classList.contains('active')) return false;
  screen.classList.remove('active');
  state.paused = false;
  const cb = dialogOnClose;
  dialogOnClose = null;
  if (cb) cb();
  return true;
}

function showDialog(title, text, onClose) {
  state.paused = true;
  dialogOnClose = onClose || null;
  document.getElementById('dialog-title').textContent = title;
  document.getElementById('dialog-text').textContent = text;
  document.getElementById('screen-dialog').classList.add('active');
  focusOverlayButton('btn-dialog');
}

function handleScreenContinue() {
  const screenId = getActiveScreenId();
  if (!screenId) return false;

  switch (screenId) {
    case 'screen-intro':
      if (hasContinueSave()) continueGame();
      else openMainMenu();
      return true;
    case 'screen-dialog':
      return closeDialog();
    case 'screen-level-complete':
      continueToNextLevel();
      return true;
    case 'screen-victory':
      showEpilogue();
      return true;
    case 'screen-epilogue':
      openSequelContinue();
      return true;
    case 'screen-gameover':
      retryLevel();
      return true;
    case 'screen-menu':
      if (hasContinueSave()) continueGame();
      else startGame();
      return true;
    default:
      return false;
  }
}

function collectPipi(pipi) {
  if (!isGateOpen()) {
    showDialog('🔒 Reliquia sellada', 'El muro sagrado sigue cerrado. Derrota al jefe, recoge la llave y abre el muro antes de reclamar el Pipi Mítico.');
    return;
  }
  state.collected.add(pipi.id);
  saveProgress();
  Sound.collect();
  spawnParticles(pipi.x * TILE + TILE / 2, pipi.y * TILE + TILE / 2, '#ffe566', 20, true);
  state.player.xp += 50;
  checkLevelUp();
  updateHUD();
  updateInventory();
  renderLevelSelect();

  const isFinal = state.currentLevelIndex === LEVELS.length - 1;
  showDialog(`${pipi.emoji} ¡${pipi.name} obtenido!`, pipi.desc + (isFinal
    ? ' Ve al portal del sur para reclamar tu trono dorado.'
    : ' Ve al portal azul del sur para pasar al siguiente nivel.'), () => {});
}

function checkLevelUp() {
  const p = state.player;
  const needed = p.level * 60;
  if (p.xp >= needed) {
    p.xp -= needed;
    p.level++;
    p.maxHp += 15;
    p.hp = p.maxHp;
    p.attackPower += 5;
    Sound.heal();
    saveProgress();
    showGameBanner('⬆️ ¡Subiste de poder!', `Nv. ${p.level}. +15 HP máx, +5 de ataque.`, 180);
  }
}

function completeLevel() {
  Sound.portal();
  Sound.stopMusic();
  const next = state.currentLevelIndex + 1;
  if (next >= LEVELS.length) {
    saveProgress();
    showVictory();
    return;
  }
  state.maxUnlockedLevel = Math.max(state.maxUnlockedLevel, next);
  saveProgress({ nextLevel: next });
  state.running = false;
  const lv = currentLevel();
  document.getElementById('level-complete-num').textContent = lv.num;
  document.getElementById('level-complete-name').textContent = lv.name;
  document.getElementById('level-complete-pipi').textContent = `${lv.pipi.emoji} ${lv.pipi.name} conseguido`;
  const nxt = getLevel(next);
  document.getElementById('level-complete-next').textContent = `Siguiente: Nivel ${nxt.num} — ${nxt.name}`;
  document.getElementById('screen-level-complete').classList.add('active');
  focusOverlayButton('btn-continue-level');
}

function showVictory() {
  state.running = false;
  Sound.victory();
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  document.getElementById('victory-time').textContent =
    `Tiempo: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s · Enemigos: ${state.kills} · Poder Nv.${state.player.level}`;
  document.getElementById('screen-victory').classList.add('active');
  focusOverlayButton('btn-restart');
}

function showEpilogue() {
  document.getElementById('screen-victory').classList.remove('active');
  loadProgress();
  updateEpilogueButtons();
  document.getElementById('screen-epilogue').classList.add('active');
  const pedosBtn = document.getElementById('btn-continue-epilogue');
  const focusId = pedosBtn && !pedosBtn.disabled ? 'btn-continue-epilogue' : 'btn-sequel-pedos';
  focusOverlayButton(focusId);
}

function updateEpilogueButtons() {
  const pedosBtn = document.getElementById('btn-continue-epilogue');
  if (!pedosBtn) return;
  try {
    const pedos = JSON.parse(localStorage.getItem('pedos-rey-javi-progress') || '{}');
    const pedosCan = !!(pedos.session || (pedos.unlocked ?? 0) > 0 || pedos.collected?.length);
    pedosBtn.disabled = false;
    if (pedosCan) {
      const count = pedos.collected?.length ?? 0;
      const lvl = (pedos.session?.levelIndex ?? pedos.unlocked ?? 0) + 1;
      pedosBtn.innerHTML = `▶ Continuar — Los Pedos del Rey Javi — Nivel ${Math.min(lvl, 7)} (${count}/7) <span class="key-hint">[Espacio / C]</span>`;
    } else {
      pedosBtn.innerHTML = '▶ Continuar — Los Pedos del Rey Javi <span class="key-hint">[Espacio / C]</span>';
    }
  } catch {
    pedosBtn.disabled = false;
    pedosBtn.innerHTML = '▶ Continuar — Los Pedos del Rey Javi';
  }
}

function openPrequelGame() {
  if (!PREQUEL_GAME_URL) return;
  window.location.href = PREQUEL_GAME_URL;
}

function openSequelGame() {
  if (!SEQUEL_GAME_URL) return;
  window.location.href = SEQUEL_GAME_URL;
}

function openSequelContinue() {
  if (!SEQUEL_GAME_URL) return;
  sessionStorage.setItem('pedos-auto-continue', '1');
  window.location.href = SEQUEL_GAME_URL;
}

function showGameOver() {
  state.running = false;
  Sound.stopMusic();
  updateContinueButtons();
  document.getElementById('screen-gameover').classList.add('active');
  focusOverlayButton(hasContinueSave() ? 'btn-continue-gameover' : 'btn-retry');
}

function updateHUD() {
  const p = state.player;
  const lv = currentLevel();
  document.getElementById('hp-bar').style.width = Math.max(0, p.hp / p.maxHp * 100) + '%';
  document.getElementById('hp-text').textContent = `${Math.max(0, Math.ceil(p.hp))}/${p.maxHp}`;
  document.getElementById('pipi-count').textContent = `${state.collected.size} / 7`;
  document.getElementById('level-stage').textContent = `Nivel ${lv.num}/7`;
  document.getElementById('zone-name').textContent = lv.name;
  document.getElementById('player-level').textContent = `Nv.${p.level}`;
  document.getElementById('attack-text').textContent = `⚔️ ${p.attackPower}`;
  document.getElementById('kill-text').textContent = state.kills;
}

function updateInventory() {
  const list = document.getElementById('pipi-list');
  list.innerHTML = '';
  for (const c of PIPIS) {
    const li = document.createElement('li');
    if (state.collected.has(c.id)) li.textContent = `${c.emoji} ${c.name}`;
    else { li.textContent = '❓ ???'; li.classList.add('empty'); }
    list.appendChild(li);
  }
}

function renderLevelSelect() {
  const grid = document.getElementById('level-select');
  if (!grid) return;
  grid.innerHTML = '';
  LEVELS.forEach((lv, i) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn' + (i > state.maxUnlockedLevel ? ' locked' : '') + (state.collected.has(lv.pipi.id) ? ' done' : '');
    btn.innerHTML = i > state.maxUnlockedLevel
      ? `🔒 ${lv.num}`
      : `${lv.num}. ${lv.name.split(' ')[0]}`;
    btn.title = lv.name;
    if (i <= state.maxUnlockedLevel) {
      btn.onclick = () => startFromLevel(i);
    }
    grid.appendChild(btn);
  });
}

function attack() {
  const p = state.player;
  if (p.attackCd > 0) return false;
  p.attackCd = 22;
  Sound.attack();

  const reach = 42;
  state.slashes.push({
    x: p.x + p.facing.x * reach,
    y: p.y + p.facing.y * reach,
    angle: Math.atan2(p.facing.y, p.facing.x),
    life: 12, maxLife: 12,
  });

  for (const e of state.enemies) {
    if (e.dead) continue;
    if (Math.hypot(p.x - e.px, p.y - e.py) < reach + e.radius) {
      e.hp -= p.attackPower;
      e.hitFlash = 8;
      checkBossPhase(e);
      Sound.hit();
      spawnParticles(e.px, e.py, e.color, 6);
      if (e.hp <= 0) {
        e.dead = true;
        state.kills++;
        state.player.xp += e.boss ? 40 : 15;
        checkLevelUp();
        Sound.enemyDie();
        spawnParticles(e.px, e.py, '#fff', 12);
        if (e.boss) {
          state.keyDrop = { x: e.px, y: e.py };
          showDialog('💀 ¡Jefe derrotado!', `${e.name} ha caído y ha soltado la llave del muro sagrado. Recógela para abrir la puerta.`);
        }
      }
    }
  }
  updateHUD();
}

function interact() {
  const exit = getNearestExit();
  if (exit) {
    if (exit.locked) {
      showDialog('🔒 Portal sellado', 'Primero debes derrotar al jefe y recoger el Pipi Mítico de este nivel.');
      return;
    }
    completeLevel();
    return;
  }

  const keyDrop = getNearestKeyDrop();
  if (keyDrop) {
    pickupSanctuaryKey();
    return;
  }

  const gate = getNearestGate();
  if (gate) {
    if (state.keyDrop)
      showDialog('🔒 Muro sellado', 'El jefe dejó una llave en el suelo. ¡Recógela con Espacio!');
    else if (!isBossDefeated())
      showDialog('🔒 Muro sellado', 'Derrota al jefe para que suelte la llave del muro sagrado.');
    else
      showDialog('🔒 Muro sellado', 'Necesitas la llave del jefe para abrir este muro.');
    return;
  }

  const heal = getNearestHeal();
  if (heal && state.player.hp < state.player.maxHp) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal.amount);
    Sound.heal();
    spawnParticles(heal.x * TILE + TILE / 2, heal.y * TILE + TILE / 2, '#44ff44', 10);
    updateHUD();
    return;
  }

  const pipi = getNearestPipi();
  if (pipi) {
    collectPipi(pipi);
    return;
  }

  const npc = getNearestNPC();
  if (npc) {
    showDialog(npc.name, npc.text);
    return;
  }

  attack();
}

// ── Input ──
const SCROLL_LOCK_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Enter',
]);

function toggleFullscreen() {
  const el = document.getElementById('game-app');
  if (!el) return;
  const active = document.fullscreenElement || document.webkitFullscreenElement;
  if (!active) {
    (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
  }
}

function onKeyDown(e) {
  if (SCROLL_LOCK_KEYS.has(e.code)) e.preventDefault();
  state.keys[e.code] = true;

  if (e.code === 'Enter' && !e.repeat) {
    if (getActiveScreenId() === 'screen-dialog') {
      closeDialog();
      return;
    }
    toggleFullscreen();
    return;
  }

  if (e.code === 'Space') {
    if (isOverlayOpen()) {
      if (!e.repeat) handleScreenContinue();
      return;
    }
    if (state.running && !state.paused) {
      interact();
    }
  }

  if (e.code === 'KeyX' && !e.repeat && state.running && !state.paused) {
    tryJump();
  }
  if (e.code === 'KeyM') Sound.toggle();
  if (e.code === 'KeyC' && !e.repeat) {
    const screen = getActiveScreenId();
    if (screen === 'screen-epilogue') {
      e.preventDefault();
      openSequelContinue();
      return;
    }
    if (hasContinueSave() && (screen === 'screen-menu' || screen === 'screen-intro' || screen === 'screen-gameover')) {
      e.preventDefault();
      continueGame();
    }
  }
}

window.addEventListener('keydown', onKeyDown, true);
window.addEventListener('keyup', e => { state.keys[e.code] = false; });

document.getElementById('btn-dialog').addEventListener('click', closeDialog);

document.getElementById('btn-sound').addEventListener('click', () => {
  Sound.init();
  const on = Sound.toggle();
  document.getElementById('btn-sound').textContent = on ? '🔊' : '🔇';
});

// ── Update ──
function updatePlayer() {
  const p = state.player;
  if (p.invuln > 0) p.invuln--;
  if (p.attackCd > 0) p.attackCd--;
  if (p.jumpTimer > 0) p.jumpTimer--;

  let dx = 0, dy = 0;
  if (state.keys['ArrowUp'] || state.keys['KeyW']) dy = -1;
  if (state.keys['ArrowDown'] || state.keys['KeyS']) dy = 1;
  if (state.keys['ArrowLeft'] || state.keys['KeyA']) dx = -1;
  if (state.keys['ArrowRight'] || state.keys['KeyD']) dx = 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    p.facing = { x: dx / len, y: dy / len };
    dx = (dx / len) * p.speed;
    dy = (dy / len) * p.speed;

    const tile = world().map[Math.floor(p.y / TILE)]?.[Math.floor(p.x / TILE)];
    let mult = tile === T.SWAMP ? 0.5 : tile === T.ICE ? 1.3 : 1;
    dx *= mult; dy *= mult;

    const margin = 8;
    const newX = p.x + dx, newY = p.y + dy;
    if (!isBlocked(Math.floor((newX - margin) / TILE), Math.floor(p.y / TILE), true) &&
        !isBlocked(Math.floor((newX + margin) / TILE), Math.floor(p.y / TILE), true)) p.x = newX;
    if (!isBlocked(Math.floor(p.x / TILE), Math.floor((newY - margin) / TILE), true) &&
        !isBlocked(Math.floor(p.x / TILE), Math.floor((newY + margin) / TILE), true)) p.y = newY;

    state.stepTimer++;
    state.walkFrame++;
    if (state.stepTimer > 18) { state.stepTimer = 0; Sound.step(); }

    if (tile === T.LAVA && p.invuln <= 0) {
      p.hp -= 0.8; p.invuln = 30;
      Sound.hurt();
      if (p.hp <= 0) showGameOver();
    }
  }
  checkPitFall();
  updateHUD();
}

function updateEnemies() {
  const p = state.player;
  for (const e of state.enemies) {
    if (e.dead) continue;
    if (e.hitFlash > 0) e.hitFlash--;
    e.phase = getBossPhase(e);

    // Patrulla (jefes dejan de patrullar cuando persiguen)
    const chaseRange = e.boss ? 200 : 0;
    const distToPlayer = Math.hypot(p.x - e.px, p.y - e.py);
    const isChasing = e.boss && distToPlayer < chaseRange;

    if (!isChasing) {
      e.moveTimer++;
      if (e.moveTimer >= e.moveDelay) {
        e.moveTimer = 0;
        const dir = e.patrol[e.patrolIdx];
        const ntx = Math.floor(e.px / TILE) + dir.dx;
        const nty = Math.floor(e.py / TILE) + dir.dy;
        if (!isBlocked(ntx, nty)) {
          e.px = ntx * TILE + TILE / 2;
          e.py = nty * TILE + TILE / 2;
        } else {
          e.patrolIdx = (e.patrolIdx + 1) % e.patrol.length;
        }
      }
    }

    if (isChasing) {
      const ang = Math.atan2(p.y - e.py, p.x - e.px);
      const spd = getBossChase(e);
      e.px += Math.cos(ang) * spd;
      e.py += Math.sin(ang) * spd;
      updateBossAbilities(e);
    }

    if (p.invuln <= 0 && Math.hypot(p.x - e.px, p.y - e.py) < e.radius + 8) {
      damagePlayer(getBossDamage(e), e.px, e.py);
    }
  }
}

function updateParticles() {
  state.particles = state.particles.filter(pt => {
    pt.x += pt.vx; pt.y += pt.vy; pt.life--;
    pt.vy += 0.15;
    return pt.life > 0;
  });
  state.slashes = state.slashes.filter(s => --s.life > 0);
}

function updateCamera() {
  const w = world(), p = state.player;
  state.camera.targetX = Math.max(0, Math.min(p.x - canvas.width / 2, w.cols * TILE - canvas.width));
  state.camera.targetY = Math.max(0, Math.min(p.y - canvas.height / 2, w.rows * TILE - canvas.height));
  state.camera.x += (state.camera.targetX - state.camera.x) * 0.14;
  state.camera.y += (state.camera.targetY - state.camera.y) * 0.14;
}

// ── Render ──
function render() {
  Gfx.time = Date.now();
  const cam = state.camera;
  const w = world();

  Gfx.drawBackground(ctx, cam.x, cam.y, canvas.width, canvas.height, state.currentWorld);

  const sc = Math.floor(cam.x / TILE), sr = Math.floor(cam.y / TILE);
  const ec = sc + Math.ceil(canvas.width / TILE) + 1;
  const er = sr + Math.ceil(canvas.height / TILE) + 1;
  for (let row = sr; row < er; row++)
    for (let col = sc; col < ec; col++)
      if (row >= 0 && col >= 0 && row < w.rows && col < w.cols)
        Gfx.drawTile(ctx, col * TILE - cam.x, row * TILE - cam.y, w.map[row][col], col, row);

  const layers = [];
  const pipi = getPipiInLevel();
  if (pipi) {
    const near = Math.hypot(state.player.x - (pipi.x * TILE + TILE / 2), state.player.y - (pipi.y * TILE + TILE / 2)) < 48;
    layers.push({ y: pipi.y, draw: () => Gfx.drawPipi(ctx, pipi.x * TILE + TILE / 2 - cam.x, pipi.y * TILE + TILE / 2 - cam.y, pipi, near) });
  }

  for (const n of (NPCS_BY_WORLD[state.currentWorld] || []))
    layers.push({ y: n.y, draw: () => Gfx.drawNPC(ctx, n.x * TILE + TILE / 2 - cam.x, n.y * TILE + TILE / 2 - cam.y) });

  for (const e of state.enemies)
    if (!e.dead) layers.push({ y: e.py / TILE, draw: () => Gfx.drawEnemy(ctx, e, e.px - cam.x, e.py - cam.y) });

  const p = state.player;
  if (!(p.invuln > 0 && Math.floor(p.invuln / 4) % 2 === 0)) {
    const jumpH = getJumpHeight(p);
    layers.push({ y: p.y, draw: () => Gfx.drawPlayer(ctx, p.x - cam.x, p.y - cam.y, p.facing, state.walkFrame, p.attackCd > 14, jumpH) });
  }

  layers.sort((a, b) => a.y - b.y);
  layers.forEach(l => l.draw());

  for (const h of (HEALS_BY_WORLD[state.currentWorld] || []))
    Gfx.drawHeal(ctx, h.x * TILE + TILE / 2 - cam.x, h.y * TILE + TILE / 2 - cam.y);
  if (state.keyDrop) {
    const nearKey = Math.hypot(state.player.x - state.keyDrop.x, state.player.y - state.keyDrop.y) < 40;
    Gfx.drawKeyDrop(ctx, state.keyDrop.x - cam.x, state.keyDrop.y - cam.y, nearKey);
  }

  for (const s of state.slashes)
    Gfx.drawSlash(ctx, s.x - cam.x, s.y - cam.y, s.angle, s.life, s.maxLife);
  for (const pr of state.projectiles)
    Gfx.drawProjectile(ctx, pr.x - cam.x, pr.y - cam.y, pr.radius, pr.color);
  for (const sw of state.slamWaves)
    Gfx.drawSlamWave(ctx, sw.x - cam.x, sw.y - cam.y, sw.radius, sw.life);
  for (const pt of state.particles)
    Gfx.drawParticle(ctx, { ...pt, x: pt.x - cam.x, y: pt.y - cam.y });

  Gfx.drawSceneLighting(ctx, canvas.width, canvas.height);

  const tx = Math.floor(p.x / TILE), ty = Math.floor(p.y / TILE);
  const ex = currentLevel().exit;
  if (tx === ex.x && ty === ex.y) {
    Gfx.drawPortalLabel(ctx, ex.x * TILE + TILE / 2 - cam.x, ex.y * TILE - cam.y - 10,
      !isLevelPipiCollected() ? '🔒 ' + ex.label : '[Espacio] ' + ex.label,
      !isLevelPipiCollected());
  }

  Gfx.drawMinimap(ctx, w, p.x, p.y, PIPIS, state.collected);
  for (const bn of state.banners)
    Gfx.drawGameBanner(ctx, canvas.width, bn);
  Gfx.drawVignette(ctx, canvas.width, canvas.height);

  // Banner nivel en canvas
  ctx.font = 'bold 11px Nunito,sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(8, 8, 130, 22);
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'left';
  ctx.fillText(`NIVEL ${currentLevel().num}: ${currentLevel().name}`, 14, 23);
}

function gameLoop() {
  if (!state.running) return;
  if (!state.paused) {
    updatePlayer();
    updateEnemies();
    updateProjectiles();
    updateSlamWaves();
    updateParticles();
    updateBanners();
    updateCamera();
  }
  render();
  requestAnimationFrame(gameLoop);
}

function beginPlay() {
  Sound.init();
  Sound.startMusic(state.currentWorld);
  if (!state.gfxReady) { Gfx.init(); state.gfxReady = true; }
  ctx.imageSmoothingEnabled = false;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  state.running = true;
  saveProgress();
  gameLoop();
}

function startGame() {
  resetGame();
  beginPlay();
}

function continueGame() {
  if (!hasContinueSave()) {
    showDialog('💾 Sin partida guardada', 'Empieza con «Partida nueva» y podrás continuar después desde aquí.');
    return;
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  loadProgress();
  const data = getSaveData();

  if (data.session) {
    const s = data.session;
    const idx = Math.min(Math.max(s.levelIndex, 0), LEVELS.length - 1);
    state.kills = s.kills ?? 0;
    state.startTime = s.startTime ?? Date.now();
    loadLevel(idx, { resetPlayer: true, showIntro: false });
    state.player = {
      ...state.player,
      ...s.player,
      x: getLevel(idx).spawn.x * TILE + TILE / 2,
      y: getLevel(idx).spawn.y * TILE + TILE / 2,
      invuln: 0,
      attackCd: 0,
      jumpTimer: 0,
    };
    updateHUD();
    updateInventory();
    saveProgress();
    beginPlay();
    return;
  }

  startFromLevel(getContinueLevelIndex());
}

function startFromLevel(index) {
  document.getElementById('screen-menu').classList.remove('active');
  if (index === 0 && state.collected.size === 0) {
    resetGame();
    beginPlay();
    return;
  }
  loadProgress();
  if (!state.player) state.startTime = Date.now();
  loadLevel(index, { resetPlayer: !state.player, showIntro: true });
  beginPlay();
}

function continueToNextLevel() {
  document.getElementById('screen-level-complete').classList.remove('active');
  loadLevel(state.currentLevelIndex + 1, { resetPlayer: false, showIntro: true });
  state.running = true;
  Sound.startMusic(state.currentWorld);
  gameLoop();
}

function retryLevel() {
  document.getElementById('screen-gameover').classList.remove('active');
  loadLevel(state.currentLevelIndex, { resetPlayer: false, showIntro: false });
  state.player.hp = state.player.maxHp;
  beginPlay();
}

document.getElementById('btn-intro').addEventListener('click', openMainMenu);
document.getElementById('btn-continue-intro').addEventListener('click', continueGame);
document.getElementById('btn-story').addEventListener('click', showStoryIntro);
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-continue').addEventListener('click', continueGame);
document.getElementById('btn-continue-epilogue').addEventListener('click', openSequelContinue);
document.getElementById('btn-sequel-pedos').addEventListener('click', openSequelGame);
document.getElementById('btn-continue-gameover').addEventListener('click', continueGame);
document.getElementById('btn-continue-level').addEventListener('click', continueToNextLevel);
document.getElementById('btn-restart').addEventListener('click', showEpilogue);
document.getElementById('btn-prequel-menu').addEventListener('click', openPrequelGame);
document.getElementById('btn-prequel-epilogue').addEventListener('click', openPrequelGame);
document.getElementById('btn-epilogue').addEventListener('click', () => {
  document.getElementById('screen-epilogue').classList.remove('active');
  startGame();
});
document.getElementById('btn-retry').addEventListener('click', retryLevel);
document.getElementById('btn-menu').addEventListener('click', () => {
  document.getElementById('screen-gameover').classList.remove('active');
  state.running = false;
  Sound.stopMusic();
  loadProgress();
  renderLevelSelect();
  updateContinueButtons();
  document.getElementById('screen-menu').classList.add('active');
  focusOverlayButton(hasContinueSave() ? 'btn-continue' : 'btn-start');
});

loadProgress();
renderLevelSelect();
updateInventory();
updateContinueButtons();
if (sessionStorage.getItem('pipis-auto-continue') === '1') {
  sessionStorage.removeItem('pipis-auto-continue');
  if (hasContinueSave()) continueGame();
} else if (document.getElementById('screen-intro').classList.contains('active')) {
  focusOverlayButton(hasContinueSave() ? 'btn-continue-intro' : 'btn-intro');
} else if (document.getElementById('screen-menu').classList.contains('active')) {
  focusOverlayButton(hasContinueSave() ? 'btn-continue' : 'btn-start');
}
