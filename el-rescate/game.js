const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const TILE = 32;
const GROUND_Y = 400;
const GRAVITY = 0.52;
const GRAVITY_JUMP = 0.28;
const JUMP_VEL = -11.5;
const ACCEL = 0.42;
const MAX_SPEED = 4.8;
const FRICTION = 0.82;
const MAX_FALL = 11;

const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  LEVEL_COMPLETE: 'level_complete',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
};

let state = STATE.MENU;
let currentLevel = 0;
let lives = 3;
let coins = 0;
let rescued = { leo: false, nara: false };
let camera = { x: 0 };
let particles = [];
let animFrame = 0;
let jumpHeld = false;

const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
});
document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) jumpHeld = false;
});

const javi = {
  x: 64, y: 0, w: 26, h: 30,
  vx: 0, vy: 0,
  grounded: false,
  facing: 1,
  invincible: 0,
  anim: 0,
};

function resetPlayer(spawnX, spawnY) {
  javi.x = spawnX;
  javi.y = spawnY;
  javi.vx = 0;
  javi.vy = 0;
  javi.grounded = false;
  javi.invincible = 90;
  javi.anim = 0;
}

function plat(x, y, w, h, type = 'ground') {
  return { x, y, w, h, type };
}

function enemy(x, y, minX, maxX, speed = 1.4) {
  return { x, y, minX, maxX, speed, dir: 1, alive: true, squish: 0 };
}

function coin(x, y) {
  return { x, y, collected: false };
}

const LEVELS = [
  {
    name: 'El Bosque Soleado',
    theme: 'forest',
    width: 2560,
    spawn: [48, GROUND_Y - 30],
    message: '¡Leo está al final del camino! Recoge estrellas.',
    platforms: [
      plat(0, GROUND_Y, 560, 80, 'ground'),
      plat(640, GROUND_Y, 320, 80, 'ground'),
      plat(1040, GROUND_Y, 400, 80, 'ground'),
      plat(1520, GROUND_Y, 480, 80, 'ground'),
      plat(2080, GROUND_Y, 480, 80, 'ground'),
      plat(256, 336, 96, 32, 'wood'),
      plat(416, 304, 64, 32, 'wood'),
      plat(560, 272, 96, 32, 'bonus'),
      plat(768, 336, 128, 32, 'wood'),
      plat(960, 304, 64, 32, 'wood'),
      plat(1152, 272, 96, 32, 'wood'),
      plat(1344, 336, 64, 32, 'wood'),
      plat(1472, 304, 96, 32, 'bonus'),
      plat(1728, 272, 128, 32, 'wood'),
      plat(1920, 336, 96, 32, 'wood'),
      plat(2144, 304, 64, 32, 'wood'),
      plat(480, GROUND_Y, 32, 96, 'trunk'),
      plat(1280, GROUND_Y, 32, 64, 'trunk'),
      plat(1888, GROUND_Y, 32, 96, 'trunk'),
    ],
    enemies: [
      enemy(320, GROUND_Y - 28, 280, 520, 1.2),
      enemy(720, GROUND_Y - 28, 660, 920, 1.5),
      enemy(1100, GROUND_Y - 28, 1060, 1400, 1.3),
      enemy(1600, GROUND_Y - 28, 1540, 1960, 1.6),
      enemy(1180, 272 - 28, 1152, 1240, 1.2),
    ],
    coins: [
      coin(288, 304), coin(320, 304), coin(352, 304),
      coin(448, 272), coin(592, 240),
      coin(800, 304), coin(832, 304),
      coin(992, 272), coin(1184, 240), coin(1216, 240),
      coin(1376, 304), coin(1760, 240), coin(1792, 240),
      coin(1952, 304), coin(2176, 272),
    ],
    collectibles: [{ type: 'leo', x: 2464, y: GROUND_Y - 34, rescued: false }],
    hills: [{ x: 80, scale: 1 }, { x: 400, scale: 0.7 }, { x: 900, scale: 1.2 }, { x: 1500, scale: 0.8 }, { x: 2100, scale: 1 }],
    clouds: [{ x: 120, y: 60 }, { x: 380, y: 90 }, { x: 700, y: 50 }, { x: 1100, y: 80 }, { x: 1600, y: 55 }, { x: 2000, y: 70 }],
    goalX: 2384,
  },
  {
    name: 'Las Cuevas Brillantes',
    theme: 'cave',
    width: 2208,
    spawn: [48, GROUND_Y - 30],
    message: '¡Cuevas luminosas! Nara espera al fondo.',
    platforms: [
      plat(0, GROUND_Y, 480, 80, 'ground'),
      plat(544, GROUND_Y, 384, 80, 'ground'),
      plat(992, GROUND_Y, 320, 80, 'ground'),
      plat(1376, GROUND_Y, 416, 80, 'ground'),
      plat(1856, GROUND_Y, 352, 80, 'ground'),
      plat(224, 336, 96, 32, 'wood'),
      plat(384, 304, 64, 32, 'wood'),
      plat(608, 336, 128, 32, 'wood'),
      plat(832, 272, 96, 32, 'bonus'),
      plat(1056, 304, 64, 32, 'wood'),
      plat(1184, 272, 96, 32, 'wood'),
      plat(1440, 336, 128, 32, 'wood'),
      plat(1632, 304, 64, 32, 'wood'),
      plat(1760, 272, 96, 32, 'wood'),
      plat(1952, 336, 96, 32, 'wood'),
    ],
    enemies: [
      enemy(300, GROUND_Y - 28, 240, 440, 1.4),
      enemy(620, GROUND_Y - 28, 560, 920, 1.6),
      enemy(1050, GROUND_Y - 28, 1000, 1280, 1.3),
      enemy(1480, GROUND_Y - 28, 1400, 1800, 1.5),
      enemy(840, 272 - 28, 832, 920, 1.2),
      enemy(1200, 272 - 28, 1184, 1270, 1.4),
    ],
    coins: [
      coin(256, 304), coin(288, 304), coin(416, 272),
      coin(640, 304), coin(672, 304), coin(864, 240),
      coin(1088, 272), coin(1216, 240), coin(1472, 304),
      coin(1664, 272), coin(1792, 240), coin(1984, 304),
    ],
    collectibles: [{ type: 'nara', x: 2112, y: GROUND_Y - 34, rescued: false }],
    goalX: 2048,
  },
  {
    name: 'Castillo del Duende',
    theme: 'castle',
    width: 1920,
    spawn: [48, GROUND_Y - 30],
    message: '¡El castillo del Duende Gruñón! Salva a Leo y Nara.',
    platforms: [
      plat(0, GROUND_Y, 384, 80, 'ground'),
      plat(448, GROUND_Y, 320, 80, 'ground'),
      plat(832, GROUND_Y, 256, 80, 'ground'),
      plat(1152, GROUND_Y, 384, 80, 'ground'),
      plat(1600, GROUND_Y, 320, 80, 'ground'),
      plat(192, 336, 96, 32, 'wood'),
      plat(352, 304, 64, 32, 'bonus'),
      plat(512, 272, 96, 32, 'wood'),
      plat(672, 336, 64, 32, 'wood'),
      plat(864, 304, 96, 32, 'wood'),
      plat(992, 272, 64, 32, 'wood'),
      plat(1184, 336, 128, 32, 'wood'),
      plat(1344, 304, 96, 32, 'wood'),
      plat(1504, 272, 96, 32, 'bonus'),
      plat(1664, 336, 64, 32, 'wood'),
    ],
    enemies: [
      enemy(260, GROUND_Y - 28, 220, 360, 1.5),
      enemy(520, GROUND_Y - 28, 460, 740, 1.7),
      enemy(880, GROUND_Y - 28, 840, 1060, 1.4),
      enemy(1220, GROUND_Y - 28, 1160, 1480, 1.6),
      enemy(1640, GROUND_Y - 28, 1610, 1880, 1.8),
      enemy(540, 272 - 28, 512, 600, 1.3),
      enemy(1210, 336 - 28, 1184, 1300, 1.5),
    ],
    coins: [
      coin(224, 304), coin(384, 272), coin(544, 240),
      coin(704, 304), coin(896, 272), coin(1024, 240),
      coin(1216, 304), coin(1376, 272), coin(1536, 240),
      coin(1696, 304),
    ],
    collectibles: [
      { type: 'leo', x: 1728, y: GROUND_Y - 34, rescued: false },
      { type: 'nara', x: 1792, y: GROUND_Y - 34, rescued: false },
    ],
    goalX: 1664,
  },
];

function getLevel() {
  return LEVELS[currentLevel];
}

function initLevel() {
  const level = getLevel();
  lives = 3;
  resetPlayer(level.spawn[0], level.spawn[1]);
  camera.x = 0;
  level.enemies.forEach((e) => {
    e.alive = true;
    e.dir = 1;
    e.squish = 0;
  });
  level.collectibles.forEach((c) => { c.rescued = false; });
  level.coins.forEach((c) => { c.collected = false; });
  particles = [];
}

function startGame() {
  currentLevel = 0;
  lives = 3;
  coins = 0;
  rescued = { leo: false, nara: false };
  initLevel();
  state = STATE.PLAYING;
  showPanel(null);
  updateHud();
}

function retryCurrentLevel() {
  initLevel();
  state = STATE.PLAYING;
  showPanel(null);
  updateHud();
}

function nextLevel() {
  currentLevel++;
  if (currentLevel >= LEVELS.length) {
    state = STATE.VICTORY;
    showPanel('victory');
    document.getElementById('hud').classList.remove('visible');
    spawnVictoryParticles();
    return;
  }
  initLevel();
  state = STATE.PLAYING;
  showPanel(null);
  updateHud();
}

function showPanel(id) {
  ['menu', 'level-complete', 'game-over', 'victory'].forEach((p) => {
    document.getElementById(p).classList.toggle('hidden', p !== id);
  });
  document.getElementById('overlay').classList.toggle('hidden-overlay', id === null);
}

function respawnAtLevelStart() {
  const level = getLevel();
  resetPlayer(level.spawn[0], level.spawn[1]);
  camera.x = 0;
  level.enemies.forEach((e) => {
    e.alive = true;
    e.dir = 1;
    e.squish = 0;
  });
  level.collectibles.forEach((c) => { c.rescued = false; });
  level.coins.forEach((c) => { c.collected = false; });
  particles = [];
  updateHud();
}

function updateHud() {
  const hud = document.getElementById('hud');
  hud.classList.add('visible');
  document.getElementById('hud-level').textContent = `${getLevel().name}`;
  document.getElementById('hud-lives').textContent = '❤️'.repeat(lives) || '💀';
  document.getElementById('hud-stars').textContent = `⭐ ${String(coins).padStart(2, '0')}`;

  rescued.leo = currentLevel > 0 || getLevel().collectibles.some((c) => c.type === 'leo' && c.rescued);
  rescued.nara = currentLevel > 1 || getLevel().collectibles.some((c) => c.type === 'nara' && c.rescued);
  const rescuedText = [];
  if (rescued.leo) rescuedText.push('Leo ✓');
  if (rescued.nara) rescuedText.push('Nara ✓');
  document.getElementById('hud-rescued').textContent = rescuedText.join('  ');
}

function spawnParticles(x, y, color, count = 12, kind = 'square') {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * (kind === 'coin' ? 4 : 6),
      vy: (Math.random() - 0.5) * 6 - (kind === 'coin' ? 4 : 2),
      life: 30 + Math.random() * 25,
      color,
      size: kind === 'coin' ? 4 : 3 + Math.random() * 4,
      kind,
    });
  }
}

function spawnVictoryParticles() {
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 3,
      vy: -Math.random() * 4 - 1,
      life: 120 + Math.random() * 60,
      color: ['#ffd700', '#e94560', '#5eb3ff', '#6ecf4e', '#ffb347'][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 4,
      kind: 'square',
    });
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function handleInput() {
  const left = keys['ArrowLeft'] || keys['KeyA'];
  const right = keys['ArrowRight'] || keys['KeyD'];
  const jumpKey = keys['Space'] || keys['ArrowUp'] || keys['KeyW'];

  if (left) {
    javi.vx -= ACCEL;
    javi.facing = -1;
  } else if (right) {
    javi.vx += ACCEL;
    javi.facing = 1;
  } else if (javi.grounded) {
    javi.vx *= FRICTION;
    if (Math.abs(javi.vx) < 0.15) javi.vx = 0;
  } else {
    javi.vx *= 0.98;
  }

  javi.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, javi.vx));

  if (jumpKey && javi.grounded) {
    javi.vy = JUMP_VEL;
    javi.grounded = false;
    jumpHeld = true;
  }

  if (!jumpKey && jumpHeld && javi.vy < -3) {
    javi.vy *= 0.55;
    jumpHeld = false;
  }

  if (javi.grounded && Math.abs(javi.vx) > 0.5) {
    javi.anim += 0.18 + Math.abs(javi.vx) * 0.04;
  }
}

function updatePhysics() {
  const level = getLevel();

  javi.vy += javi.vy < 0 && jumpHeld ? GRAVITY_JUMP : GRAVITY;
  if (javi.vy > MAX_FALL) javi.vy = MAX_FALL;

  javi.x += javi.vx;
  javi.y += javi.vy;
  javi.grounded = false;

  if (javi.x < 0) javi.x = 0;
  if (javi.x + javi.w > level.width) javi.x = level.width - javi.w;

  for (const p of level.platforms) {
    const plat = { x: p.x, y: p.y, w: p.w, h: p.h };
    const player = { x: javi.x, y: javi.y, w: javi.w, h: javi.h };
    if (!rectsOverlap(player, plat)) continue;

    const overlapX = Math.min(javi.x + javi.w - p.x, p.x + p.w - javi.x);
    const overlapY = Math.min(javi.y + javi.h - p.y, p.y + p.h - javi.y);

    if (overlapX < overlapY) {
      if (javi.x + javi.w / 2 < p.x + p.w / 2) javi.x = p.x - javi.w;
      else javi.x = p.x + p.w;
      javi.vx = 0;
    } else if (javi.vy >= 0 && javi.y + javi.h - javi.vy <= p.y + 4) {
      javi.y = p.y - javi.h;
      javi.vy = 0;
      javi.grounded = true;
    } else {
      javi.y = p.y + p.h;
      javi.vy = 0;
    }
  }

  if (javi.y > canvas.height + 40) takeDamage();
  if (javi.invincible > 0) javi.invincible--;
}

function updateEnemies() {
  const level = getLevel();
  const playerBox = { x: javi.x, y: javi.y, w: javi.w, h: javi.h };

  for (const e of level.enemies) {
    if (e.squish > 0) {
      e.squish--;
      if (e.squish <= 0) e.alive = false;
      continue;
    }
    if (!e.alive) continue;

    e.x += e.speed * e.dir;
    if (e.x <= e.minX || e.x + 28 >= e.maxX) e.dir *= -1;

    const enemyBox = { x: e.x, y: e.y, w: 28, h: 28 };
    if (javi.invincible <= 0 && rectsOverlap(playerBox, enemyBox)) {
      const stomp = javi.vy > 0 && javi.y + javi.h - 8 <= e.y + 10;
      if (stomp) {
        e.squish = 18;
        javi.vy = JUMP_VEL * 0.55;
        spawnParticles(e.x + 14, e.y + 20, '#7b5ea7', 10);
        spawnParticles(e.x + 14, e.y + 14, '#b89ee0', 6);
      } else {
        takeDamage();
      }
    }
  }
}

function updateCoins() {
  const level = getLevel();
  const playerBox = { x: javi.x, y: javi.y, w: javi.w, h: javi.h };
  for (const c of level.coins) {
    if (c.collected) continue;
    if (rectsOverlap(playerBox, { x: c.x, y: c.y, w: 20, h: 20 })) {
      c.collected = true;
      coins++;
      spawnParticles(c.x + 10, c.y + 10, '#ffd700', 6, 'coin');
      updateHud();
    }
  }
}

function updateCollectibles() {
  const level = getLevel();
  const playerBox = { x: javi.x, y: javi.y, w: javi.w, h: javi.h };

  for (const c of level.collectibles) {
    if (c.rescued) continue;
    if (rectsOverlap(playerBox, { x: c.x, y: c.y, w: 28, h: 34 })) {
      c.rescued = true;
      spawnParticles(c.x + 14, c.y + 16, c.type === 'leo' ? '#43b047' : '#ff9800', 20);
      updateHud();
    }
  }

  if (level.collectibles.every((c) => c.rescued)) levelComplete();
}

function takeDamage() {
  lives--;
  updateHud();
  if (lives <= 0) {
    state = STATE.GAME_OVER;
    showPanel('game-over');
    document.getElementById('hud').classList.remove('visible');
    return;
  }
  respawnAtLevelStart();
  const level = getLevel();
  spawnParticles(level.spawn[0] + javi.w / 2, level.spawn[1] + javi.h / 2, '#e52521', 16);
}

function levelComplete() {
  getLevel().collectibles.forEach((c) => { rescued[c.type] = true; });
  updateHud();
  state = STATE.LEVEL_COMPLETE;
  const level = getLevel();
  document.getElementById('level-title').textContent = `¡${level.name} completado!`;
  document.getElementById('level-message').textContent = level.message;
  showPanel('level-complete');
}

function updateCamera() {
  const level = getLevel();
  const target = javi.x - canvas.width * 0.35;
  camera.x += (target - camera.x) * 0.12;
  camera.x = Math.max(0, Math.min(camera.x, level.width - canvas.width));
}

function updateParticles() {
  particles = particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.kind === 'coin' ? 0.05 : 0.12;
    p.life--;
    return p.life > 0;
  });
}

// ─── DIBUJO ORIGINAL EL RESCATE ───

const PALETTE = {
  skyTop: '#9ed4ff',
  skyBot: '#c8f0a0',
  caveTop: '#ddd0f5',
  caveBot: '#f5eeff',
  castleTop: '#ffd4b8',
  castleBot: '#ffe8cc',
  grass: '#6ecf4e',
  grassDark: '#4da838',
  wood: '#c49a6c',
  woodDark: '#9a7048',
  stone: '#b8c4d0',
  stoneDark: '#8a9aaa',
};

function drawSky(theme) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (theme === 'forest') {
    grad.addColorStop(0, PALETTE.skyTop);
    grad.addColorStop(1, PALETTE.skyBot);
  } else if (theme === 'cave') {
    grad.addColorStop(0, PALETTE.caveTop);
    grad.addColorStop(1, PALETTE.caveBot);
  } else {
    grad.addColorStop(0, PALETTE.castleTop);
    grad.addColorStop(1, PALETTE.castleBot);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCloud(cx, cy) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(cx + 16, cy + 12, 14, 0, Math.PI * 2);
  ctx.arc(cx + 36, cy + 8, 18, 0, Math.PI * 2);
  ctx.arc(cx + 58, cy + 12, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawHill(hx, scale) {
  const w = 120 * scale;
  const h = 55 * scale;
  ctx.fillStyle = '#7dd957';
  ctx.beginPath();
  ctx.moveTo(hx, GROUND_Y);
  ctx.quadraticCurveTo(hx + w / 2, GROUND_Y - h, hx + w, GROUND_Y);
  ctx.fill();
  ctx.fillStyle = '#93e065';
  ctx.beginPath();
  ctx.moveTo(hx + w * 0.15, GROUND_Y);
  ctx.quadraticCurveTo(hx + w / 2, GROUND_Y - h * 0.75, hx + w * 0.5, GROUND_Y);
  ctx.fill();
}

function drawBackground(level) {
  drawSky(level.theme);

  if (level.theme === 'forest' && level.hills) {
    for (const h of level.hills) {
      const hx = h.x - camera.x * 0.35;
      if (hx > -200 && hx < canvas.width + 100) drawHill(hx, h.scale);
    }
    if (level.clouds) {
      for (const c of level.clouds) {
        const cx = c.x - camera.x * 0.15;
        if (cx > -80 && cx < canvas.width + 80) drawCloud(cx, c.y);
      }
    }
  }

  if (level.theme === 'cave') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 10; i++) {
      const gx = (i * 160 - camera.x * 0.08) % (canvas.width + 40);
      const gy = 80 + (i % 3) * 90;
      ctx.beginPath();
      ctx.moveTo(gx, gy + 20);
      ctx.lineTo(gx + 8, gy);
      ctx.lineTo(gx + 16, gy + 20);
      ctx.fill();
    }
  }

  if (level.theme === 'castle') {
    ctx.fillStyle = 'rgba(255, 200, 180, 0.35)';
    for (let i = 0; i < 6; i++) {
      const bx = i * 140 - (camera.x * 0.1 % 140);
      ctx.fillRect(bx, 60, 8, canvas.height - 120);
    }
  }
}

function drawWoodPlank(x, y, w, h) {
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.woodDark;
  for (let row = 0; row < h; row += 8) {
    ctx.fillRect(x, y + row, w, 2);
    for (let col = (row / 8 % 2) * 10; col < w; col += 20) {
      ctx.fillRect(x + col, y + row, 1, 8);
    }
  }
}

function drawStoneBlock(x, y, w, h) {
  ctx.fillStyle = PALETTE.stone;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.stoneDark;
  for (let row = 0; row < h; row += 10) {
    ctx.fillRect(x, y + row, w, 2);
    for (let col = 0; col < w; col += 14) {
      ctx.fillRect(x + col, y + row, 12, 8);
    }
  }
}

function drawBonusBlock(x, y) {
  const pulse = Math.sin(animFrame * 0.1) * 1.5;
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(x, y + pulse, 32, 32);
  ctx.fillStyle = '#ffcc66';
  ctx.fillRect(x + 3, y + 3 + pulse, 26, 26);
  ctx.fillStyle = '#e94560';
  ctx.font = '14px serif';
  ctx.fillText('♥', x + 10, y + 23 + pulse);
}

function drawGroundBlock(x, y, w, h) {
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(x, y + 10, w, h - 10);
  ctx.fillStyle = PALETTE.grass;
  ctx.fillRect(x, y, w, 12);
  ctx.fillStyle = PALETTE.grassDark;
  for (let i = 0; i < w; i += 14) {
    ctx.fillRect(x + i + 2, y + 2, 3, 8);
    ctx.fillRect(x + i + 8, y + 4, 3, 6);
  }
}

function drawTreeTrunk(x, y, w, h) {
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#6d4f10';
  ctx.fillRect(x + w - 6, y + 8, 4, h - 12);
  ctx.fillStyle = '#5cb85c';
  ctx.beginPath();
  ctx.arc(x + w / 2, y - 8, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7dd957';
  ctx.beginPath();
  ctx.arc(x + w / 2 - 10, y - 12, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlatforms(level) {
  for (const p of level.platforms) {
    const x = p.x - camera.x;
    if (x + p.w < 0 || x > canvas.width) continue;

    if (p.type === 'ground') drawGroundBlock(x, p.y, p.w, p.h);
    else if (p.type === 'trunk') drawTreeTrunk(x, p.y, p.w, p.h);
    else if (p.type === 'bonus') drawBonusBlock(x, p.y);
    else if (level.theme === 'forest') drawWoodPlank(x, p.y, p.w, p.h);
    else drawStoneBlock(x, p.y, p.w, p.h);
  }
}

function drawGoalArch(x) {
  const gx = x - camera.x;
  if (gx < -80 || gx > canvas.width + 80) return;

  ctx.fillStyle = '#c49a6c';
  ctx.fillRect(gx + 10, GROUND_Y - 130, 8, 130);
  ctx.fillRect(gx + 50, GROUND_Y - 130, 8, 130);
  ctx.fillRect(gx + 10, GROUND_Y - 130, 48, 10);
  ctx.fillStyle = '#e94560';
  ctx.fillRect(gx + 14, GROUND_Y - 118, 40, 28);
  ctx.fillStyle = '#fff';
  ctx.font = '8px "Press Start 2P"';
  ctx.fillText('META', gx + 16, GROUND_Y - 100);
}

function drawStar(x, y) {
  const bob = Math.sin(animFrame * 0.12 + x * 0.05) * 3;
  const cy = y + bob;
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = x + 10 + Math.cos(angle) * 10;
    const py = cy + 10 + Math.sin(angle) * 10;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff8a0';
  ctx.beginPath();
  ctx.arc(x + 10, cy + 10, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars(level) {
  for (const c of level.coins) {
    if (c.collected) continue;
    const cx = c.x - camera.x;
    if (cx < -30 || cx > canvas.width + 30) continue;
    drawStar(cx, c.y);
  }
}

function drawDuende(x, y, squish) {
  const sy = squish ? Math.min(squish * 1.5, 18) : 0;
  const sh = squish ? Math.max(28 - squish, 6) : 28;

  ctx.fillStyle = '#7b5ea7';
  ctx.fillRect(x + 4, y + 8 - sy, 20, sh - 8);
  ctx.fillStyle = '#9b7ec8';
  ctx.fillRect(x + 6, y + 2 - sy, 16, 12);

  ctx.fillStyle = '#5a4080';
  ctx.fillRect(x + 2, y + 4 - sy, 6, 8);
  ctx.fillRect(x + 20, y + 4 - sy, 6, 8);

  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(x + 8, y + 8 - sy, 8, 3);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 9, y + 9 - sy, 3, 2);
  ctx.fillRect(x + 16, y + 9 - sy, 3, 2);
  ctx.fillStyle = '#333';
  ctx.fillRect(x + 10, y + 10 - sy, 2, 2);
  ctx.fillRect(x + 17, y + 10 - sy, 2, 2);

  const step = Math.floor(animFrame / 7) % 2;
  ctx.fillStyle = '#4a3568';
  ctx.fillRect(x + 5, y + sh - 4 - sy + step, 7, 4);
  ctx.fillRect(x + 16, y + sh - 4 - sy - step, 7, 4);
}

function drawJavi(x, y) {
  if (javi.invincible > 0 && Math.floor(javi.invincible / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  const walk = javi.grounded && Math.abs(javi.vx) > 0.3;
  const frame = walk ? Math.floor(javi.anim) % 2 : 0;
  const jumpPose = !javi.grounded;
  const legOff = frame === 1 ? 2 : 0;
  const dir = javi.facing;

  ctx.save();
  if (dir === -1) {
    ctx.translate(x + javi.w, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  }

  ctx.fillStyle = '#f0f0f0';
  if (jumpPose) {
    ctx.fillRect(x + 4, y + 22, 8, 5);
    ctx.fillRect(x + 14, y + 20, 8, 5);
  } else {
    ctx.fillRect(x + 4 + legOff, y + 24, 8, 5);
    ctx.fillRect(x + 14 - legOff, y + 24, 8, 5);
  }

  ctx.fillStyle = '#3d5a80';
  ctx.fillRect(x + 4, y + 16, 18, 10);

  ctx.fillStyle = '#5eb3ff';
  ctx.fillRect(x + 4, y + 10, 18, 10);

  ctx.fillStyle = '#f5c898';
  ctx.fillRect(x + 1, y + 12 + legOff, 4, 8);
  ctx.fillRect(x + 21, y + 12 - legOff, 4, 8);
  if (jumpPose) {
    ctx.fillRect(x + 0, y + 8, 5, 10);
    ctx.fillRect(x + 21, y + 6, 5, 10);
  }

  ctx.fillStyle = '#f5c898';
  ctx.fillRect(x + 6, y + 4, 14, 11);

  ctx.fillStyle = '#4a3728';
  ctx.fillRect(x + 5, y + 0, 16, 6);
  ctx.fillRect(x + 7, y + 2, 4, 3);
  ctx.fillRect(x + 15, y + 2, 4, 3);

  ctx.fillStyle = '#333';
  ctx.fillRect(x + 9, y + 7, 2, 3);
  ctx.fillRect(x + 15, y + 7, 2, 3);
  ctx.fillStyle = '#c68642';
  ctx.fillRect(x + 10, y + 11, 6, 2);

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawChildWaiting(x, y, type) {
  const bob = Math.sin(animFrame * 0.1 + x) * 3;
  const cy = y + bob;
  const color = type === 'leo' ? '#6ecf4e' : '#ffb347';

  ctx.fillStyle = '#e8dcc8';
  ctx.fillRect(x - 2, cy + 28, 32, 8);
  ctx.fillStyle = '#d4c4a8';
  ctx.fillRect(x, cy - 6, 28, 36);

  ctx.fillStyle = color;
  ctx.fillRect(x + 6, cy + 14, 16, 14);
  ctx.fillStyle = '#f5c898';
  ctx.fillRect(x + 8, cy + 4, 12, 12);
  ctx.fillStyle = type === 'leo' ? '#3d8b40' : '#e08a20';
  ctx.fillRect(x + 6, cy + 2, 16, 6);
  ctx.fillStyle = '#333';
  ctx.fillRect(x + 10, cy + 7, 2, 2);
  ctx.fillRect(x + 16, cy + 7, 2, 2);
  ctx.fillStyle = '#333';
  ctx.fillRect(x + 12, cy + 11, 4, 1);

  ctx.fillStyle = '#fff';
  ctx.font = '7px "Press Start 2P"';
  ctx.fillText('¡PAPÁ!', x - 2, cy - 10);
}

function drawCollectibles(level) {
  for (const c of level.collectibles) {
    if (c.rescued) continue;
    const cx = c.x - camera.x;
    if (cx < -50 || cx > canvas.width + 50) continue;
    drawChildWaiting(cx, c.y, c.type);
  }
}

function drawEnemies(level) {
  for (const e of level.enemies) {
    if (!e.alive && e.squish <= 0) continue;
    const ex = e.x - camera.x;
    if (ex < -40 || ex > canvas.width + 40) continue;
    drawDuende(ex, e.y, e.squish);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life / 30);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - camera.x, p.y, p.size, p.kind === 'coin' ? p.size * 1.3 : p.size);
  }
  ctx.globalAlpha = 1;
}

function drawChildHappy(x, y, type) {
  const bob = Math.sin(animFrame * 0.1 + x) * 3;
  const cy = y + bob;
  const color = type === 'leo' ? '#6ecf4e' : '#ffb347';

  ctx.fillStyle = color;
  ctx.fillRect(x + 6, cy + 14, 16, 14);
  ctx.fillStyle = '#f5c898';
  ctx.fillRect(x + 8, cy + 4, 12, 12);
  ctx.fillStyle = type === 'leo' ? '#3d8b40' : '#e08a20';
  ctx.fillRect(x + 6, cy + 2, 16, 6);
  ctx.fillStyle = '#333';
  ctx.fillRect(x + 10, cy + 7, 2, 2);
  ctx.fillRect(x + 16, cy + 7, 2, 2);
  ctx.fillStyle = '#333';
  ctx.fillRect(x + 12, cy + 11, 4, 2);
}

function drawVictoryScene() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#9ed4ff');
  grad.addColorStop(1, '#ffe8a0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawParticles();

  const cx = canvas.width / 2;
  const cy = 290;
  const bob = Math.sin(animFrame * 0.08) * 3;

  drawJavi(cx - 70, cy - 44 + bob);
  drawChildHappy(cx + 0, cy - 24 + bob, 'leo');
  drawChildHappy(cx + 46, cy - 24 + bob, 'nara');

  ctx.fillStyle = '#ffd700';
  ctx.font = '18px serif';
  for (let i = 0; i < 8; i++) {
    const angle = animFrame * 0.02 + i * Math.PI / 4;
    ctx.fillText('⭐', cx + Math.cos(angle) * 110, cy - 90 + Math.sin(angle) * 30);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === STATE.VICTORY) {
    drawVictoryScene();
    return;
  }
  if (state !== STATE.PLAYING) return;

  const level = getLevel();
  drawBackground(level);
  drawPlatforms(level);
  if (level.goalX) drawGoalArch(level.goalX);
  drawStars(level);
  drawEnemies(level);
  drawCollectibles(level);
  drawJavi(javi.x - camera.x, javi.y);
  drawParticles();
}

function update() {
  animFrame++;
  if (state === STATE.PLAYING) {
    handleInput();
    updatePhysics();
    updateEnemies();
    updateCoins();
    updateCollectibles();
    updateCamera();
  }
  updateParticles();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-next').addEventListener('click', nextLevel);
document.getElementById('btn-retry').addEventListener('click', retryCurrentLevel);
document.getElementById('btn-replay').addEventListener('click', () => {
  showPanel('menu');
  state = STATE.MENU;
  document.getElementById('hud').classList.remove('visible');
  particles = [];
});

gameLoop();
