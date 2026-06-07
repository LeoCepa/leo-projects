// ═══ Mapas — Los Pedos del Rey Javi (7 niveles únicos) ═══
const T = { GRASS:0, WATER:1, ROCK:2, SAND:3, LAVA:4, SWAMP:5, TEMPLE:6, ICE:7, PATH:8, PORTAL:9, DUNGEON:10, SKY:11, GATE:12, PIT:13 };

function addPitRun(m, y, x0, x1) {
  for (let x = x0; x <= x1; x++) m[y][x] = T.PIT;
}

function addPipiBarrier(m, cx, cy, cols) {
  const gateY = cy + 2;
  const left = Math.max(1, cx - 2);
  const right = Math.min(cols - 2, cx + 2);
  for (let x = left; x <= right; x++) m[gateY][x] = x === cx ? T.GATE : T.ROCK;
  for (let y = cy; y < gateY; y++) m[y][cx] = T.PATH;
  for (let y = cy + 1; y < gateY; y++) {
    if (cx - 2 >= 1) m[y][cx - 2] = T.ROCK;
    if (cx + 2 < m[0].length) m[y][cx + 2] = T.ROCK;
  }
}

const BACKGROUNDS = {
  level_1: { top: '#fff4c8', mid: '#ffe566', bottom: '#c9a020', deco: 'forest' },
  level_2: { top: '#0c1018', mid: '#1e2838', bottom: '#080c14', deco: 'cosmic' },
  level_3: { top: '#5eb0e8', mid: '#87cefa', bottom: '#2a6090', deco: 'swamp' },
  level_4: { top: '#dff8ff', mid: '#a8e6ff', bottom: '#2d7a48', deco: 'snow' },
  level_5: { top: '#2a1808', mid: '#5c3818', bottom: '#8b5a20', deco: 'volcano' },
  level_6: { top: '#281838', mid: '#4a3060', bottom: '#120a20', deco: 'temple' },
  level_7: { top: '#101828', mid: '#203050', bottom: '#ffd740', deco: 'throne' },
};

const TILE_COLORS = {
  [T.GRASS]:   ['#3a7d1e','#2d6318'],
  [T.WATER]:   ['#1a6b9c','#145a82'],
  [T.ROCK]:    ['#5a5a5a','#444'],
  [T.SAND]:    ['#c2a645','#a88b3a'],
  [T.LAVA]:    ['#e63900','#b82e00'],
  [T.SWAMP]:   ['#2d4a2d','#1e3520'],
  [T.TEMPLE]:  ['#8b7355','#6b5740'],
  [T.ICE]:     ['#a8d8ea','#7ec8e3'],
  [T.PATH]:    ['#9b7653','#7d5f42'],
  [T.PORTAL]:  ['#2060c0','#1040a0'],
  [T.DUNGEON]: ['#3d3d3d','#2a2a2a'],
  [T.SKY]:     ['#87ceeb','#5eb8e8'],
  [T.GATE]:    ['#6b5740','#8b7355'],
  [T.PIT]:     ['#1a1018','#0a0810'],
};

function bordered(w, h, fill) {
  const m = Array.from({ length: h }, () => Array(w).fill(fill));
  for (let x = 0; x < w; x++) { m[0][x] = T.ROCK; m[h - 1][x] = T.ROCK; }
  for (let y = 0; y < h; y++) { m[y][0] = T.ROCK; m[y][w - 1] = T.ROCK; }
  for (let y = 1; y <= 2; y++)
    for (let x = 1; x < w - 1; x++) m[y][x] = T.SKY;
  return m;
}

// Nivel 1: Ciudad Dorada — calles en S
function levelMap_ciudad() {
  const m = bordered(20, 12, T.SAND);
  for (let x = 4; x < 16; x++) m[10][x] = T.PATH;
  for (let y = 6; y < 11; y++) m[y][5] = T.PATH;
  for (let x = 5; x < 14; x++) m[6][x] = T.PATH;
  for (let y = 3; y < 7; y++) m[y][13] = T.PATH;
  [[4,8],[4,11],[7,9],[9,3],[9,15]].forEach(([y,x]) => m[y][x] = T.ROCK);
  addPitRun(m, 6, 8, 9);
  m[1][13] = T.PATH;
  m[11][10] = T.PORTAL;
  return m;
}

// Nivel 2: Caverna de Ecos — galerías laterales
function levelMap_caverna() {
  const m = bordered(18, 14, T.DUNGEON);
  for (let y = 4; y < 13; y++) m[y][9] = T.PATH;
  for (let x = 4; x < 9; x++) m[7][x] = T.PATH;
  for (let x = 10; x < 15; x++) m[9][x] = T.PATH;
  [[3,6],[3,12],[5,4],[5,14],[11,6],[11,12]].forEach(([y,x]) => m[y][x] = T.ROCK);
  addPitRun(m, 9, 11, 12);
  m[1][9] = T.PATH;
  m[13][9] = T.PORTAL;
  return m;
}

// Nivel 3: Acueducto Antiguo — canales de agua
function levelMap_acueducto() {
  const m = bordered(18, 12, T.TEMPLE);
  for (let x = 3; x < 15; x++) m[8][x] = T.PATH;
  for (let y = 4; y < 11; y++) m[y][9] = T.PATH;
  m[5][5] = T.WATER; m[6][5] = T.WATER; m[7][5] = T.WATER;
  m[5][13] = T.WATER; m[6][13] = T.WATER; m[7][13] = T.WATER;
  m[4][8] = T.ROCK; m[4][10] = T.ROCK;
  addPitRun(m, 8, 6, 7);
  m[1][9] = T.PATH;
  m[11][9] = T.PORTAL;
  return m;
}

// Nivel 4: Jardín de Cristal — cruz central
function levelMap_jardin() {
  const m = bordered(18, 12, T.GRASS);
  for (let x = 2; x < 16; x++) { m[5][x] = T.ICE; m[7][x] = T.PATH; }
  for (let y = 3; y < 10; y++) { m[y][6] = T.ICE; m[y][11] = T.ICE; }
  for (let y = 5; y < 9; y++) m[y][9] = T.PATH;
  [[4,4],[4,13],[8,4],[8,13]].forEach(([y,x]) => m[y][x] = T.ROCK);
  addPitRun(m, 7, 4, 5);
  m[1][9] = T.PATH;
  m[11][9] = T.PORTAL;
  return m;
}

// Nivel 5: Fábrica Ácida — pasillos en zigzag
function levelMap_fabrica() {
  const m = bordered(18, 12, T.ROCK);
  for (let y = 3; y < 10; y++) for (let x = 3; x < 15; x++) if ((x + y) % 3 === 0) m[y][x] = T.LAVA;
  for (let x = 3; x < 14; x++) { m[4][x] = T.PATH; m[8][x] = T.PATH; }
  m[5][4] = T.PATH; m[6][5] = T.PATH; m[7][6] = T.PATH;
  m[5][13] = T.PATH; m[6][12] = T.PATH; m[7][11] = T.PATH;
  for (let y = 5; y < 11; y++) m[y][9] = T.PATH;
  addPitRun(m, 8, 6, 7);
  m[1][9] = T.PATH;
  m[11][9] = T.PORTAL;
  return m;
}

// Nivel 6: Torre del Reloj — espiral
function levelMap_torre() {
  const m = bordered(16, 14, T.DUNGEON);
  for (let i = 0; i < 5; i++) {
    for (let x = 3 + i; x < 13 - i; x++) m[3 + i * 2][x] = T.PATH;
    for (let y = 3 + i; y < 12 - i; y++) m[y][12 - i] = T.PATH;
  }
  m[11][8] = T.PATH; m[10][8] = T.PATH; m[9][8] = T.PATH;
  addPitRun(m, 7, 7, 9);
  m[1][8] = T.PATH;
  m[13][8] = T.PORTAL;
  return m;
}

// Nivel 7: Salón del Gran Pipi — arena final
function levelMap_salon() {
  const m = bordered(18, 12, T.TEMPLE);
  for (let x = 3; x < 15; x++) { m[2][x] = T.DUNGEON; m[4][x] = T.SAND; }
  for (let x = 5; x < 13; x++) m[6][x] = T.PATH;
  m[3][9] = T.WATER; m[4][9] = T.LAVA;
  addPitRun(m, 6, 7, 9);
  addPitRun(m, 6, 10, 11);
  m[1][9] = T.PATH;
  m[11][9] = T.PORTAL;
  return m;
}

const LEVELS = [
  {
    num: 1, id: 'level_1', name: 'Antesala Real', subtitle: 'El primer aroma',
    intro: 'Nivel 1: La Antesala Real huele a poder. Derrota al Guardián Aromático, abre el muro y reclama el primer Pedo Mítico.',
    map: levelMap_ciudad(), cols: 20, rows: 12,
    spawn: { x: 10, y: 10 }, exit: { x: 10, y: 11, label: 'Siguiente nivel →' },
    pipi: { id: 0, name: 'Pedo Real', emoji: '👑💨', x: 13, y: 1,
      desc: 'El primer pedo de la dinastía. Huele a corona.' },
    enemies: [
      { x: 7, y: 8, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Sirviente Húmedo', color: '#8b7355', hp: 38 },
      { x: 11, y: 7, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Sirviente Húmedo', color: '#6b5740', hp: 38 },
      { x: 9, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Guardián Aromático', color: '#9b7653', hp: 130, boss: true, damage: 23 },
    ],
    heals: [{ x: 6, y: 10, amount: 30 }],
    npc: { x: 4, y: 10, name: 'Consejero del Aire',
      text: '¡Valentín! El Rey Javi ha despertado sus Pedos Míticos. Cada uno está tras un muro real. Derrota al jefe, recoge la llave y reclama el pedo.' },
  },
  {
    num: 2, id: 'level_2', name: 'Pasillo de Fabes', subtitle: 'Eco aromático',
    intro: 'Nivel 2: El Pasillo de Fabes resuena con cada paso. Cuidado con los fosos y el Pedo Espectral.',
    map: levelMap_caverna(), cols: 18, rows: 14,
    spawn: { x: 9, y: 12 }, exit: { x: 9, y: 13, label: 'Siguiente nivel →' },
    pipi: { id: 1, name: 'Pedo Espectral', emoji: '👻💨', x: 9, y: 1,
      desc: 'No lo ves… pero lo hueles en el alma.' },
    enemies: [
      { x: 6, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Eco Húmedo', color: '#6688aa', hp: 42 },
      { x: 9, y: 5, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Pedo Espectral', color: '#88aacc', hp: 160, boss: true, damage: 25 },
    ],
    heals: [{ x: 13, y: 9, amount: 28 }],
  },
  {
    num: 3, id: 'level_3', name: 'Acueducto Antiguo', subtitle: 'Canales del imperio',
    intro: 'Nivel 3: Cruza el Acueducto Antiguo sin caer al agua. El Pipi Ancestral guarda la reliquia.',
    map: levelMap_acueducto(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    pipi: { id: 2, name: 'Pipi Ancestral', emoji: '🏛️💦', x: 9, y: 1,
      desc: 'Fluyó por las venas del primer imperio dorado.' },
    enemies: [
      { x: 5, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Guardián de Agua', color: '#4488cc', hp: 48 },
      { x: 9, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Pipi Ancestral', color: '#5a9ad4', hp: 190, boss: true, damage: 27 },
    ],
    heals: [{ x: 3, y: 8, amount: 32 }],
  },
  {
    num: 4, id: 'level_4', name: 'Jardín de Cristal', subtitle: 'Hielo y rocío',
    intro: 'Nivel 4: El Jardín de Cristal resbala bajo tus pies. Enfréntate al Pipi Cristalino.',
    map: levelMap_jardin(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    pipi: { id: 3, name: 'Pipi de Cristal', emoji: '💎💦', x: 9, y: 1,
      desc: 'Transparente y afilado. No lo tires al suelo.' },
    enemies: [
      { x: 5, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Gota Helada', color: '#aaddff', hp: 44 },
      { x: 12, y: 6, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Prisma', color: '#88ccff', hp: 46 },
      { x: 9, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Pipi Cristalino', color: '#66ddff', hp: 220, boss: true, damage: 29 },
    ],
    heals: [{ x: 14, y: 9, amount: 30 }],
  },
  {
    num: 5, id: 'level_5', name: 'Fábrica Ácida', subtitle: 'Tubos corroídos',
    intro: 'Nivel 5: La Fábrica Ácida quema. Salta los fosos y evita la lava. El Pipi Corrosivo te espera.',
    map: levelMap_fabrica(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    pipi: { id: 4, name: 'Pipi Ácido', emoji: '☣️💦', x: 9, y: 1,
      desc: 'Corroe el acero. Usa guantes legendarios.' },
    enemies: [
      { x: 5, y: 5, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Gota Tóxica', color: '#88cc22', hp: 52 },
      { x: 13, y: 5, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Vapor Verde', color: '#66aa18', hp: 50 },
      { x: 9, y: 5, patrol: [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }], name: 'Pipi Corrosivo', color: '#aadd00', hp: 270, boss: true, radius: 17, damage: 31 },
    ],
    heals: [{ x: 9, y: 7, amount: 26 }],
  },
  {
    num: 6, id: 'level_6', name: 'Torre del Reloj', subtitle: 'El tiempo gotea',
    intro: 'Nivel 6: Sube la Torre del Reloj. Cada tic suena como una gota. El Pipi Temporal controla el tiempo.',
    map: levelMap_torre(), cols: 16, rows: 14,
    spawn: { x: 8, y: 12 }, exit: { x: 8, y: 13, label: 'Siguiente nivel →' },
    pipi: { id: 5, name: 'Pipi Temporal', emoji: '⏳💦', x: 8, y: 1,
      desc: 'Existe en el pasado, presente y futuro a la vez.' },
    enemies: [
      { x: 6, y: 8, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Eco del Tiempo', color: '#aa88cc', hp: 52 },
      { x: 8, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Pipi Temporal', color: '#cc88ff', hp: 310, boss: true, damage: 33 },
    ],
    heals: [{ x: 3, y: 10, amount: 35 }],
  },
  {
    num: 7, id: 'level_7', name: 'Trono del Rey Javi', subtitle: 'La batalla aromática',
    intro: 'Nivel 7: El Trono del Rey Javi. Derrota al monarca y reclama el Pedo Supremo. ¡El destino del aire está en tus manos!',
    map: levelMap_salon(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: '🏆 Victoria' },
    pipi: { id: 6, name: 'Pedo Supremo', emoji: '👑💨', x: 9, y: 1,
      desc: 'El pedo final del Rey Javi. Quien lo posea dominará el viento.' },
    enemies: [
      { x: 9, y: 4, patrol: [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }], name: 'Rey Javi', color: '#9b3a6b', hp: 520, boss: true, radius: 22,
        bossConfig: {
          damage: [36, 54, 72],
          chase: [1.6, 2.8, 3.6],
          phaseMsgs: [
            null,
            ['💨 ¡Rey Javi suelta la cadena!', '«¡Perdón, no aguanto más!» — Las fabes reales no piden permiso. ¡Corre si hueles el primer blast!'],
            ['💀 ¡MODO FABES DESATADO!', '«¡VALENTÍN, ESTO ES POR EL TRONO!» — Proyectiles aromáticos, ondas tóxicas y cero vergüenza. ¡Tapate la nariz!'],
          ],
          slamFromPhase: 1,
          slamInterval: [0, 105, 70],
          projectileFromPhase: 2,
          projectileInterval: 80,
        },
      },
    ],
    heals: [{ x: 3, y: 9, amount: 42 }, { x: 14, y: 9, amount: 42 }],
  },
];

function isHealTileWalkable(map, x, y, cols, rows) {
  if (x < 1 || y < 1 || x >= cols - 1 || y >= rows - 1) return false;
  const t = map[y][x];
  return t !== T.WATER && t !== T.ROCK && t !== T.SKY && t !== T.GATE && t !== T.PIT;
}

function getLevelOccupiedTiles(lv) {
  const occupied = new Set();
  const add = (x, y) => { if (x != null && y != null) occupied.add(`${x},${y}`); };
  add(lv.spawn?.x, lv.spawn?.y);
  add(lv.exit?.x, lv.exit?.y);
  const relic = lv.pipi || lv.caca;
  if (relic) add(relic.x, relic.y);
  if (lv.npc) add(lv.npc.x, lv.npc.y);
  for (const e of lv.enemies || []) add(e.x, e.y);
  return occupied;
}

function findFreeHealTile(lv, occupied, fromX, fromY) {
  for (let r = 1; r < 10; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = fromX + dx, ny = fromY + dy;
        const key = `${nx},${ny}`;
        if (occupied.has(key)) continue;
        if (!isHealTileWalkable(lv.map, nx, ny, lv.cols, lv.rows)) continue;
        return { x: nx, y: ny };
      }
    }
  }
  return { x: fromX, y: fromY };
}

function resolveHealPlacements(lv) {
  if (!lv.heals?.length) return;
  const occupied = getLevelOccupiedTiles(lv);
  for (const heal of lv.heals) {
    const key = `${heal.x},${heal.y}`;
    if (!occupied.has(key)) {
      occupied.add(key);
      continue;
    }
    const spot = findFreeHealTile(lv, occupied, heal.x, heal.y);
    heal.x = spot.x;
    heal.y = spot.y;
    occupied.add(`${heal.x},${heal.y}`);
  }
}

LEVELS.forEach(lv => {
  const { x, y } = lv.pipi;
  if (lv.map[y][x] === T.SKY) lv.map[y][x] = T.PATH;
  addPipiBarrier(lv.map, x, y, lv.cols);
  resolveHealPlacements(lv);
});

const WORLDS = {};
LEVELS.forEach(lv => {
  WORLDS[lv.id] = {
    map: lv.map, cols: lv.cols, rows: lv.rows,
    name: `Nivel ${lv.num}: ${lv.name}`,
    spawn: lv.spawn, exit: lv.exit,
    zones: [{ name: lv.name, x: 0, y: 0, w: lv.cols, h: lv.rows }],
    levelNum: lv.num,
  };
});

const PIPIS = LEVELS.map(lv => ({ ...lv.pipi, requires: [] }));

const ENEMIES_BY_WORLD = {};
LEVELS.forEach(lv => { ENEMIES_BY_WORLD[lv.id] = lv.enemies; });

const NPCS_BY_WORLD = {};
LEVELS.forEach(lv => { if (lv.npc) NPCS_BY_WORLD[lv.id] = [lv.npc]; });

const HEALS_BY_WORLD = {};
LEVELS.forEach(lv => { if (lv.heals) HEALS_BY_WORLD[lv.id] = lv.heals; });

function getLevel(index) { return LEVELS[index]; }
function getLevelById(id) { return LEVELS.find(l => l.id === id); }
