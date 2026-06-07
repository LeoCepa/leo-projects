const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const TILE = 32;
const GROUND_Y = 400;
const GRAVITY = 0.5;
const JUMP_VEL = -12;
const ACCEL = 0.5;
const MAX_SPEED = 5.5;
const FRICTION = 0.82;
const MAX_FALL = 12;

const PULSE_RADIUS = 165;
const PULSE_STUN = 300;
const PULSE_COOLDOWN = 90;
const DASH_SPEED = 11;
const DASH_TIME = 22;
const DASH_COOLDOWN = 40;
const BOSS_PULSES = 2;
const CHASE_RANGE = 80;
const START_LIVES = 5;

const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  LEVEL_COMPLETE: 'level_complete',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
};

let state = STATE.MENU;
let currentLevel = 0;
let spheres = 0;
let lives = START_LIVES;
let camera = { x: 0 };
let particles = [];
let pulseWaves = [];
let projectiles = [];
let animFrame = 0;

const keys = {};
const touch = { left: false, right: false, jump: false, pulse: false, dash: false };

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'KeyE'].includes(e.code)) {
    e.preventDefault();
  }
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

document.querySelectorAll('.touch-btn').forEach((btn) => {
  const action = btn.dataset.action;
  const down = () => { touch[action] = true; };
  const up = () => { touch[action] = false; };
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); down(); });
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointerleave', up);
  btn.addEventListener('pointercancel', up);
});

const hero = {
  x: 64, y: 0, w: 22, h: 28,
  vx: 0, vy: 0,
  grounded: false,
  facing: 1,
  invincible: 0,
  pulseCd: 0,
  dashCd: 0,
  dashing: 0,
  anim: 0,
};

function plat(x, y, w, h, type = 'floor') {
  return { x, y, w, h, type };
}

function obj(x, y, minX, maxX, kind, speed = 0.75) {
  return {
    x, y, minX, maxX, kind, speed, dir: 1,
    w: kind === 'boss' ? 48 : kind === 'sofa' ? 40 : 28,
    h: kind === 'boss' ? 44 : kind === 'sofa' ? 24 : 28,
    stun: 0, alive: true, shootCd: 0, phase: 0,
  };
}

function resetHero(spawnX, spawnY) {
  hero.x = spawnX;
  hero.y = spawnY;
  hero.vx = 0;
  hero.vy = 0;
  hero.grounded = false;
  hero.invincible = 120;
  hero.pulseCd = 0;
  hero.dashCd = 0;
  hero.dashing = 0;
  hero.anim = 0;
}

const LEVELS = [
  {
    name: 'Habitación Rebelde',
    theme: 'room',
    width: 1960,
    spawn: [72, GROUND_Y - 28],
    message: 'Los peluches ocupan la cama y el estante. ¡La esfera está encima del armario!',
    noPits: true,
    platforms: [
      plat(0, GROUND_Y, 1960, 80, 'bed'),
      plat(320, 368, 200, 28, 'desk'),
      plat(720, 368, 220, 28, 'toybox'),
      plat(1120, 368, 200, 28, 'rug'),
      plat(1380, 368, 96, 24, 'shelf'),
      plat(1476, 336, 96, 24, 'shelf'),
      plat(1572, 304, 96, 24, 'shelf'),
      plat(1668, 272, 200, 28, 'wardrobe'),
    ],
    objects: [
      obj(200, GROUND_Y - 28, 100, 400, 'teddy', 0.5),
      obj(560, GROUND_Y - 28, 480, 720, 'block', 0.6),
      obj(900, GROUND_Y - 28, 800, 1040, 'teddy', 0.55),
      obj(1280, GROUND_Y - 28, 1160, 1420, 'block', 0.65),
      obj(1520, 304 - 28, 1580, 1640, 'teddy', 0.55),
    ],
    sphere: { x: 1768, y: 272 - 40, got: false },
  },
  {
    name: 'Cocina Conquistadora',
    theme: 'kitchen',
    width: 2400,
    spawn: [48, GROUND_Y - 28],
    message: 'El Cucharón Supremo planea controlar toda la comida del mundo.',
    platforms: [
      plat(0, GROUND_Y, 480, 80),
      plat(560, GROUND_Y, 320, 80),
      plat(960, GROUND_Y, 400, 80),
      plat(1420, GROUND_Y, 360, 80),
      plat(1840, GROUND_Y, 560, 80),
      plat(200, 336, 96, 28, 'counter'),
      plat(400, 304, 64, 28, 'counter'),
      plat(640, 336, 128, 28, 'counter'),
      plat(1040, 272, 96, 28, 'counter'),
      plat(1240, 304, 80, 28, 'counter'),
      plat(1500, 336, 96, 28, 'counter'),
      plat(1680, 272, 128, 28, 'counter'),
      plat(1960, 304, 96, 28, 'counter'),
    ],
    objects: [
      obj(680, GROUND_Y - 28, 580, 880, 'spoon', 0.8),
      obj(1580, GROUND_Y - 28, 1440, 1780, 'pot', 0.7),
      obj(2000, GROUND_Y - 28, 1860, 2280, 'spoon', 0.85),
    ],
    sphere: { x: 2280, y: GROUND_Y - 36, got: false },
  },
  {
    name: 'Salón Tiránico',
    theme: 'living',
    width: 2600,
    spawn: [48, GROUND_Y - 28],
    message: 'La Tele Dictadora quiere controlar lo que ve todo el planeta.',
    platforms: [
      plat(0, GROUND_Y, 560, 80),
      plat(640, GROUND_Y, 400, 80),
      plat(1100, GROUND_Y, 480, 80),
      plat(1640, GROUND_Y, 400, 80),
      plat(2100, GROUND_Y, 500, 80),
      plat(280, 336, 96, 28),
      plat(480, 304, 80, 28),
      plat(760, 336, 128, 28),
      plat(1000, 272, 96, 28),
      plat(1240, 304, 64, 28),
      plat(1420, 272, 96, 28),
      plat(1720, 336, 128, 28),
      plat(1920, 304, 96, 28),
      plat(2200, 272, 128, 28),
    ],
    objects: [
      obj(360, GROUND_Y - 24, 280, 520, 'sofa', 0.55),
      obj(780, GROUND_Y - 28, 660, 1020, 'remote', 0.75),
      obj(1200, GROUND_Y - 28, 1120, 1540, 'tv', 0.7),
      obj(1760, GROUND_Y - 24, 1660, 2060, 'sofa', 0.6),
      obj(2280, GROUND_Y - 28, 2120, 2520, 'tv', 0.75),
    ],
    sphere: { x: 2480, y: GROUND_Y - 36, got: false },
  },
  {
    name: 'Baño Secreto',
    theme: 'bath',
    width: 2400,
    spawn: [48, GROUND_Y - 28],
    message: 'Las toallas persiguen a cualquiera que se atreva a entrar.',
    platforms: [
      plat(0, GROUND_Y, 500, 80),
      plat(580, GROUND_Y, 360, 80),
      plat(1000, GROUND_Y, 400, 80),
      plat(1460, GROUND_Y, 380, 80),
      plat(1900, GROUND_Y, 500, 80),
      plat(220, 336, 96, 28, 'tile'),
      plat(420, 304, 80, 28, 'tile'),
      plat(700, 336, 128, 28, 'tile'),
      plat(1080, 272, 96, 28, 'tile'),
      plat(1320, 304, 80, 28, 'tile'),
      plat(1560, 336, 96, 28, 'tile'),
      plat(1760, 272, 128, 28, 'tile'),
      plat(2020, 304, 96, 28, 'tile'),
    ],
    objects: [
      obj(680, GROUND_Y - 28, 600, 920, 'brush', 0.75),
      obj(1120, GROUND_Y - 28, 1020, 1360, 'towel', 0.85),
      obj(2100, GROUND_Y - 28, 1920, 2320, 'brush', 0.8),
    ],
    sphere: { x: 2280, y: GROUND_Y - 36, got: false },
  },
  {
    name: 'Azotea del Conquistador',
    theme: 'roof',
    width: 2000,
    spawn: [48, GROUND_Y - 28],
    message: 'El Orbe Maldito lidera la conquista mundial. ¡Esta es la batalla final!',
    noPits: true,
    platforms: [
      plat(0, GROUND_Y, 2000, 80, 'floor'),
      plat(320, 336, 96, 28),
      plat(520, 304, 80, 28),
      plat(800, 336, 128, 28),
      plat(1040, 272, 96, 28),
      plat(1280, 304, 96, 28),
      plat(1520, 336, 128, 28),
      plat(1760, 272, 96, 28),
    ],
    objects: [
      obj(960, GROUND_Y - 44, 400, 1400, 'boss', 0.55),
    ],
    sphere: { x: 1840, y: GROUND_Y - 36, got: false },
  },
];

let levelData = null;

function loadLevel(idx) {
  const src = LEVELS[idx];
  levelData = {
    ...src,
    platforms: src.platforms.map((p) => ({ ...p })),
    objects: src.objects.map((o) => ({ ...o, stun: 0, alive: true, shootCd: 60 + Math.random() * 60 })),
    sphere: { ...src.sphere, got: false },
  };
  projectiles = [];
  resetHero(src.spawn[0], src.spawn[1]);
  camera.x = 0;
}

function inputLeft() { return keys.ArrowLeft || keys.KeyA || touch.left; }
function inputRight() { return keys.ArrowRight || keys.KeyD || touch.right; }
function inputJump() { return keys.Space || keys.ArrowUp || keys.KeyW || touch.jump; }
function inputPulse() { return keys.KeyE || touch.pulse; }
function inputDash() { return keys.ShiftLeft || keys.ShiftRight || touch.dash; }

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function spawnParticles(x, y, color, n = 8) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5 - 1,
      life: 30 + Math.random() * 20,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function pulseHitsObject(o) {
  const hx = hero.x + hero.w / 2;
  const hy = hero.y + hero.h / 2;
  const ox = o.x + o.w / 2;
  const oy = o.y + o.h / 2;
  if (o.kind === 'boss') {
    return rectsOverlap(hero, { x: o.x - 60, y: o.y - 40, w: o.w + 120, h: o.h + 80 })
      || Math.hypot(ox - hx, oy - hy) < PULSE_RADIUS + 80;
  }
  return Math.hypot(ox - hx, oy - hy) < PULSE_RADIUS;
}

function collectSphere() {
  if (!levelData || levelData.sphere.got) return;
  const boss = levelData.objects.find((o) => o.kind === 'boss' && o.alive);
  if (boss && boss.phase < BOSS_PULSES) return;

  levelData.sphere.got = true;
  spheres++;
  spawnParticles(levelData.sphere.x, levelData.sphere.y, '#c084fc', 24);
  if (currentLevel >= LEVELS.length - 1) {
    state = STATE.VICTORY;
    showPanel('victory');
  } else {
    state = STATE.LEVEL_COMPLETE;
    document.getElementById('level-title').textContent = `¡Esfera ${spheres}/5!`;
    document.getElementById('level-message').textContent = LEVELS[currentLevel].message;
    showPanel('level-complete');
  }
}

function firePulse() {
  if (hero.pulseCd > 0) return;
  hero.pulseCd = PULSE_COOLDOWN;
  pulseWaves.push({ x: hero.x + hero.w / 2, y: hero.y + hero.h / 2, r: 0, life: 28 });
  levelData.objects.forEach((o) => {
    if (!o.alive) return;
    if (!pulseHitsObject(o)) return;

    o.stun = PULSE_STUN;
    if (o.kind === 'boss') {
      o.phase += 1;
      spawnParticles(o.x + o.w / 2, o.y + o.h / 2, '#6ee7ff', 16);
      if (o.phase >= BOSS_PULSES) {
        o.stun = 9999;
        levelData.sphere.x = o.x + o.w / 2;
        levelData.sphere.y = GROUND_Y - 36;
        if (currentLevel >= LEVELS.length - 1) {
          collectSphere();
        }
      }
    }
  });
  spawnParticles(hero.x + hero.w / 2, hero.y + hero.h / 2, '#c084fc', 14);
}

function tryDash() {
  if (hero.dashCd > 0 || hero.dashing > 0) return;
  const dir = hero.facing || (inputLeft() ? -1 : 1);
  hero.dashing = DASH_TIME;
  hero.dashCd = DASH_COOLDOWN;
  hero.invincible = Math.max(hero.invincible, DASH_TIME);
  hero.vx = dir * DASH_SPEED;
  spawnParticles(hero.x + hero.w / 2, hero.y + hero.h, '#ffd93d', 6);
}

let pulsePressed = false;
let dashPressed = false;

function updateHero() {
  if (hero.invincible > 0) hero.invincible--;
  if (hero.pulseCd > 0) hero.pulseCd--;
  if (hero.dashCd > 0) hero.dashCd--;
  if (hero.dashing > 0) hero.dashing--;

  if (inputPulse() && !pulsePressed) firePulse();
  pulsePressed = inputPulse();

  if (inputDash() && !dashPressed) tryDash();
  dashPressed = inputDash();

  if (hero.dashing <= 0) {
    if (inputLeft()) { hero.vx -= ACCEL; hero.facing = -1; }
    if (inputRight()) { hero.vx += ACCEL; hero.facing = 1; }
    hero.vx *= FRICTION;
    hero.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, hero.vx));
  }

  if (inputJump() && hero.grounded) {
    hero.vy = JUMP_VEL;
    hero.grounded = false;
  }

  hero.vy += GRAVITY;
  if (hero.vy > MAX_FALL) hero.vy = MAX_FALL;

  hero.x += hero.vx;
  hero.y += hero.vy;
  hero.grounded = false;

  levelData.platforms.forEach((p) => {
    if (!rectsOverlap(hero, p)) return;
    const overlapX = Math.min(hero.x + hero.w - p.x, p.x + p.w - hero.x);
    const overlapY = Math.min(hero.y + hero.h - p.y, p.y + p.h - hero.y);
    if (overlapX < overlapY) {
      if (hero.x + hero.w / 2 < p.x + p.w / 2) hero.x = p.x - hero.w;
      else hero.x = p.x + p.w;
      hero.vx = 0;
    } else {
      if (hero.vy > 0 && hero.y + hero.h - hero.vy <= p.y + 4) {
        hero.y = p.y - hero.h;
        hero.vy = 0;
        hero.grounded = true;
      } else if (hero.vy < 0) {
        hero.y = p.y + p.h;
        hero.vy = 0;
      }
    }
  });

  if (levelData.noPits && hero.vy >= 0 && hero.x + hero.w > 0 && hero.x < levelData.width) {
    const floorY = GROUND_Y - hero.h;
    if (hero.y > floorY) {
      hero.y = floorY;
      hero.vy = 0;
      hero.grounded = true;
    }
  } else if (hero.y > canvas.height + 40) {
    hurtHero();
  }

  hero.x = Math.max(0, Math.min(levelData.width - hero.w, hero.x));
  hero.anim++;

  const boss = levelData.objects.find((o) => o.kind === 'boss' && o.alive);
  const sphereReady = !boss || boss.phase >= BOSS_PULSES;

  if (sphereReady && !levelData.sphere.got && rectsOverlap(hero, { x: levelData.sphere.x - 16, y: levelData.sphere.y - 16, w: 32, h: 32 })) {
    collectSphere();
  }
}

function hurtHero() {
  if (hero.invincible > 0) return;
  lives--;
  updateHud();
  if (lives <= 0) {
    state = STATE.GAME_OVER;
    showPanel('game-over');
    return;
  }
  resetHero(levelData.spawn[0], levelData.spawn[1]);
  hero.invincible = 180;
}

function updateObjects() {
  levelData.objects.forEach((o) => {
    if (!o.alive) return;

    if (o.kind === 'boss' && o.phase >= BOSS_PULSES) {
      o.stun = 9999;
      return;
    }

    if (o.stun > 0) { o.stun--; return; }

    const hx = hero.x + hero.w / 2;
    const hy = hero.y + hero.h / 2;
    const ox = o.x + o.w / 2;
    const oy = o.y + o.h / 2;
    const dist = Math.hypot(hx - ox, hy - oy);

    if (o.kind === 'boss') {
      if (o.phase >= 1) o.speed = 0.25;
      if (dist < 130 && o.phase < 1) {
        o.x += (hx > ox ? 1 : -1) * o.speed * 1.1;
      } else {
        o.x += o.dir * o.speed;
      }
      if (o.x <= o.minX || o.x + o.w >= o.maxX) o.dir *= -1;
      o.shootCd--;
      if (o.shootCd <= 0 && o.phase < BOSS_PULSES) {
        o.shootCd = 200;
        const angle = Math.atan2(hy - oy, hx - ox);
        projectiles.push({
          x: ox, y: oy, vx: Math.cos(angle) * 1.6, vy: Math.sin(angle) * 1.6,
          life: 120, r: 4,
        });
      }
      return;
    }

    const chaseKinds = ['towel', 'brush', 'remote', 'block'];
    if (chaseKinds.includes(o.kind) && dist < CHASE_RANGE) {
      o.x += (hx > ox ? 1 : -1) * o.speed * 0.85;
    } else {
      o.x += o.dir * o.speed;
    }

    if (o.x <= o.minX) { o.x = o.minX; o.dir = 1; }
    if (o.x + o.w >= o.maxX) { o.x = o.maxX - o.w; o.dir = -1; }

    if (o.kind === 'tv' && animFrame % 260 === 0) {
      projectiles.push({
        x: ox, y: oy, vx: hero.x > o.x ? 1.5 : -1.5, vy: -0.6, life: 90, r: 4,
      });
    }

    if (rectsOverlap(hero, o) && o.stun <= 0) hurtHero();
  });
}

function updateProjectiles() {
  projectiles = projectiles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.life--;
    const hit = Math.hypot(p.x - (hero.x + hero.w / 2), p.y - (hero.y + hero.h / 2)) < p.r + 3;
    if (hit && hero.invincible <= 0) hurtHero();
    return p.life > 0 && p.y < canvas.height + 20;
  });
}

function updatePulseWaves() {
  pulseWaves = pulseWaves.filter((w) => {
    w.r += 6;
    w.life--;
    return w.life > 0;
  });
}

function updateParticles() {
  particles = particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life--;
    return p.life > 0;
  });
}

function updateCamera() {
  const target = hero.x - canvas.width * 0.35;
  camera.x += (target - camera.x) * 0.12;
  camera.x = Math.max(0, Math.min(levelData.width - canvas.width, camera.x));
}

const THEME_COLORS = {
  room: { sky: '#2d1b4e', ground: '#5c3d7a', accent: '#ff9ecd' },
  kitchen: { sky: '#1e3a2f', ground: '#4a7c59', accent: '#ffd93d' },
  living: { sky: '#1a2744', ground: '#3d5a80', accent: '#ff6b9d' },
  bath: { sky: '#0f2a3d', ground: '#4a90a4', accent: '#a8e6ff' },
  roof: { sky: '#0d0d1a', ground: '#4a4a6a', accent: '#ff6b35' },
};

function drawBackground(theme) {
  const c = THEME_COLORS[theme];
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, c.sky);
  grad.addColorStop(1, '#0a0612');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = c.accent + '22';
  for (let i = 0; i < 6; i++) {
    const px = ((i * 173 + animFrame * 0.3) % (canvas.width + 100)) - 50;
    const py = 40 + i * 28;
    ctx.beginPath();
    ctx.arc(px, py, 20 + i * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

const PLATFORM_COLORS = {
  room: {
    floor: null,
    bed: '#9b7cbf',
    rug: '#e879a8',
    desk: '#f5c16c',
    shelf: '#c4a1ff',
    toybox: '#ff9ecd',
    wardrobe: '#7c5cbf',
  },
};

function drawPlatforms(theme) {
  const c = THEME_COLORS[theme];
  const extras = PLATFORM_COLORS[theme] || {};
  levelData.platforms.forEach((p) => {
    const custom = extras[p.type];
    ctx.fillStyle = custom || (p.type === 'floor' ? c.ground : c.accent + '88');
    ctx.fillRect(p.x - camera.x, p.y, p.w, p.h);
    ctx.fillStyle = '#ffffff22';
    ctx.fillRect(p.x - camera.x, p.y, p.w, 4);
    if (theme === 'room' && p.type === 'bed') {
      ctx.fillStyle = '#ffffff18';
      ctx.fillRect(p.x - camera.x + 16, p.y + 12, p.w - 32, 20);
    }
    if (theme === 'room' && p.type === 'wardrobe') {
      ctx.fillStyle = '#ffffff15';
      ctx.fillRect(p.x - camera.x + p.w / 2 - 2, p.y + 8, 4, p.h - 12);
    }
  });
}

const OBJ_EMOJI = {
  teddy: '🧸', block: '🧱', spoon: '🥄', pot: '🍲',
  sofa: '🛋️', remote: '📱', tv: '📺',
  towel: '🧻', brush: '🪥', boss: '👁️',
};

function drawObjects() {
  levelData.objects.forEach((o) => {
    if (!o.alive) return;
    const sx = o.x - camera.x;
    const stunned = o.stun > 0;
    ctx.globalAlpha = stunned ? 0.45 : 1;
    if (stunned) {
      ctx.fillStyle = '#6ee7ff44';
      ctx.fillRect(sx - 4, o.y - 4, o.w + 8, o.h + 8);
    }
    ctx.font = `${o.kind === 'boss' ? 36 : 22}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(OBJ_EMOJI[o.kind] || '❓', sx + o.w / 2, o.y + o.h / 2);
    if (!stunned && o.kind !== 'boss') {
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(sx + o.w * 0.3, o.y + 6, 4, 4);
      ctx.fillRect(sx + o.w * 0.6, o.y + 6, 4, 4);
    }
    ctx.globalAlpha = 1;
  });
}

function drawSphere() {
  if (levelData.sphere.got) return;
  const boss = levelData.objects.find((o) => o.kind === 'boss' && o.alive);
  const locked = boss && boss.phase < BOSS_PULSES;
  const s = levelData.sphere;
  const sx = s.x - camera.x;
  const bob = Math.sin(animFrame * 0.08) * 4;
  const glow = 14 + Math.sin(animFrame * 0.1) * 4;
  if (locked) {
    ctx.font = '10px "Press Start 2P"';
    ctx.fillStyle = '#ff6b9d';
    ctx.textAlign = 'center';
    const left = Math.max(0, BOSS_PULSES - boss.phase);
    ctx.fillText(left > 0 ? `¡Acércate y pulsa E! (${left})` : '', sx, s.y - 24);
  }
  ctx.beginPath();
  ctx.arc(sx, s.y + bob, glow, 0, Math.PI * 2);
  ctx.fillStyle = '#c084fc55';
  ctx.fill();
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = locked ? 0.35 : 1;
  ctx.font = '28px serif';
  ctx.fillText('🔮', sx, s.y + bob);
  ctx.globalAlpha = 1;
}

function drawHero() {
  const sx = hero.x - camera.x;
  if (hero.invincible > 0 && animFrame % 6 < 3) ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#ffd93d';
  ctx.fillRect(sx + 4, hero.y + 10, 14, 14);
  ctx.fillStyle = '#6ee7ff';
  ctx.fillRect(sx + 2, hero.y + 2, 18, 12);
  ctx.fillStyle = '#2d1b4e';
  ctx.fillRect(sx + (hero.facing > 0 ? 12 : 4), hero.y + 5, 4, 4);
  ctx.fillStyle = '#e94560';
  ctx.fillRect(sx + 6, hero.y + 24, 5, 4);
  ctx.fillRect(sx + 11, hero.y + 24, 5, 4);
  ctx.globalAlpha = 1;
}

function drawPulseWaves() {
  pulseWaves.forEach((w) => {
    const sx = w.x - camera.x;
    ctx.beginPath();
    ctx.arc(sx, w.y, w.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(192, 132, 252, ${w.life / 28})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function drawProjectiles() {
  projectiles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x - camera.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b35';
    ctx.fill();
  });
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 50;
    ctx.fillRect(p.x - camera.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;
  });
}

function draw() {
  if (!levelData) return;
  drawBackground(levelData.theme);
  drawPlatforms(levelData.theme);
  drawSphere();
  drawObjects();
  drawProjectiles();
  drawPulseWaves();
  drawHero();
  drawParticles();
}

function updateHud() {
  document.getElementById('hud-level').textContent = levelData ? levelData.name : '';
  document.getElementById('hud-spheres').textContent = `🔮 ${spheres}/5`;
  const pulseEl = document.getElementById('hud-pulse');
  if (hero.pulseCd > 0) {
    pulseEl.textContent = `⚡ ${Math.ceil(hero.pulseCd / 60)}s`;
    pulseEl.classList.add('cooldown');
  } else {
    pulseEl.textContent = '⚡ ¡Listo!';
    pulseEl.classList.remove('cooldown');
  }
  document.getElementById('hud-lives').textContent = '❤️'.repeat(Math.max(0, lives));
}

function showPanel(id) {
  document.getElementById('overlay').classList.remove('hidden-overlay');
  ['menu', 'level-complete', 'game-over', 'victory'].forEach((p) => {
    document.getElementById(p).classList.toggle('hidden', p !== id);
  });
  document.getElementById('hud').classList.toggle('visible', id === 'menu' ? false : state === STATE.PLAYING);
}

function hidePanels() {
  document.getElementById('overlay').classList.add('hidden-overlay');
  ['menu', 'level-complete', 'game-over', 'victory'].forEach((p) => {
    document.getElementById(p).classList.add('hidden');
  });
  document.getElementById('hud').classList.add('visible');
}

function startGame() {
  currentLevel = 0;
  spheres = 0;
  lives = START_LIVES;
  state = STATE.PLAYING;
  loadLevel(0);
  hidePanels();
  updateHud();
}

function nextLevel() {
  currentLevel++;
  state = STATE.PLAYING;
  loadLevel(currentLevel);
  hidePanels();
  updateHud();
}

function retry() {
  lives = START_LIVES;
  state = STATE.PLAYING;
  loadLevel(currentLevel);
  hidePanels();
  updateHud();
}

function gameLoop() {
  animFrame++;
  if (state === STATE.PLAYING && levelData) {
    updateHero();
    updateObjects();
    updateProjectiles();
    updatePulseWaves();
    updateParticles();
    updateCamera();
    updateHud();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-next').addEventListener('click', nextLevel);
document.getElementById('btn-retry').addEventListener('click', retry);
document.getElementById('btn-replay').addEventListener('click', startGame);

showPanel('menu');
gameLoop();
