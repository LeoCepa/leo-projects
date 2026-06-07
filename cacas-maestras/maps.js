// ═══ Mapas por niveles — Las 7 Cacas Maestras ═══
const T = { GRASS:0, WATER:1, ROCK:2, SAND:3, LAVA:4, SWAMP:5, TEMPLE:6, ICE:7, PATH:8, PORTAL:9, DUNGEON:10, SKY:11, GATE:12, PIT:13 };

function addPitRun(m, y, x0, x1) {
  for (let x = x0; x <= x1; x++) m[y][x] = T.PIT;
}

const BACKGROUNDS = {
  level_1: { top: '#5eb8e8', mid: '#87ceeb', bottom: '#3d7a28', deco: 'forest' },
  level_2: { top: '#c8e6f5', mid: '#a8d8ea', bottom: '#6a9ab0', deco: 'snow' },
  level_3: { top: '#2c1810', mid: '#5c3d2e', bottom: '#8b6914', deco: 'temple' },
  level_4: { top: '#1a2a1a', mid: '#2d4a35', bottom: '#1e3520', deco: 'swamp' },
  level_5: { top: '#1a0505', mid: '#4a1500', bottom: '#8b2200', deco: 'volcano' },
  level_6: { top: '#050510', mid: '#12082a', bottom: '#1a0a3a', deco: 'cosmic' },
  level_7: { top: '#0a0a12', mid: '#1a1020', bottom: '#2a1810', deco: 'throne' },
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
  [T.PORTAL]:  ['#6a0dad','#4a0080'],
  [T.DUNGEON]: ['#3d3d3d','#2a2a2a'],
  [T.SKY]:     ['#87ceeb','#5eb8e8'],
  [T.GATE]:    ['#6b5740','#8b7355'],
  [T.PIT]:     ['#1a1018','#0a0810'],
};

function addCacaBarrier(m, cx, cy, cols) {
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

function bordered(w, h, fill) {
  const m = Array.from({ length: h }, () => Array(w).fill(fill));
  for (let x = 0; x < w; x++) { m[0][x] = T.ROCK; m[h - 1][x] = T.ROCK; }
  for (let y = 0; y < h; y++) { m[y][0] = T.ROCK; m[y][w - 1] = T.ROCK; }
  for (let y = 1; y <= 2; y++)
    for (let x = 1; x < w - 1; x++)
      m[y][x] = T.SKY;
  return m;
}

function levelMap_bosque() {
  const m = bordered(18, 12, T.GRASS);
  [[2,4],[2,13],[4,7],[4,10],[6,3],[6,14],[8,6],[8,11]].forEach(([y,x]) => m[y][x] = T.ROCK);
  for (let x = 3; x < 15; x++) { m[6][x] = T.PATH; m[9][x] = T.PATH; }
  for (let y = 6; y < 10; y++) m[y][9] = T.PATH;
  addPitRun(m, 9, 5, 6);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_hielo() {
  const m = bordered(18, 12, T.ICE);
  [[3,5],[3,12],[5,8],[7,4],[7,13],[9,6]].forEach(([y,x]) => m[y][x] = T.ROCK);
  for (let x = 4; x < 14; x++) m[8][x] = T.PATH;
  addPitRun(m, 8, 6, 7);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_templo() {
  const m = bordered(16, 12, T.TEMPLE);
  for (let x = 2; x < 14; x++) { m[3][x] = T.ROCK; m[7][x] = T.PATH; }
  for (let y = 5; y < 8; y++) m[y][8] = T.PATH;
  m[11][8] = T.PORTAL;
  m[1][8] = T.PATH;
  return m;
}

function levelMap_pantano() {
  const m = bordered(18, 12, T.SWAMP);
  [[4,4],[4,13],[6,8],[8,5],[8,12]].forEach(([y,x]) => m[y][x] = T.ROCK);
  m[5][10] = T.WATER; m[6][10] = T.WATER; m[7][10] = T.PATH; m[8][10] = T.WATER;
  for (let x = 5; x < 13; x++) m[9][x] = T.PATH;
  addPitRun(m, 9, 7, 8);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_volcan() {
  const m = bordered(18, 12, T.ROCK);
  for (let y = 2; y < 11; y++) for (let x = 2; x < 16; x++) m[y][x] = T.LAVA;
  for (let y = 4; y < 9; y++) for (let x = 5; x < 13; x++) m[y][x] = T.SAND;
  for (let x = 6; x < 12; x++) { m[7][x] = T.PATH; m[9][x] = T.PATH; }
  addPitRun(m, 7, 8, 9);
  addPitRun(m, 9, 7, 8);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_cosmico() {
  const m = bordered(18, 12, T.DUNGEON);
  for (let x = 3; x < 15; x++) m[2][x] = T.TEMPLE;
  for (let i = 0; i < 6; i++) m[5][3 + i * 2] = T.PORTAL;
  for (let x = 4; x < 14; x++) m[8][x] = T.PATH;
  addPitRun(m, 8, 9, 10);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_trono() {
  const m = bordered(18, 12, T.DUNGEON);
  for (let x = 4; x < 14; x++) { m[2][x] = T.TEMPLE; m[4][x] = T.TEMPLE; }
  m[5][9] = T.LAVA;
  for (let x = 6; x < 12; x++) m[7][x] = T.PATH;
  addPitRun(m, 7, 7, 9);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

// ═══ 7 NIVELES ═══
const LEVELS = [
  {
    num: 1,
    id: 'level_1',
    name: 'Bosque Arcoíris',
    subtitle: 'El primer paso del aventurero',
    intro: 'Nivel 1: Explora el Bosque Arcoíris. ¡Cuidado con los fosos! Salta con X para cruzarlos. Derrota al Ent Anciano, recoge su llave, abre el muro sagrado y reclama la Caca Arcoíris.',
    map: levelMap_bosque(),
    cols: 18, rows: 12,
    spawn: { x: 9, y: 10 },
    exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    caca: { id: 0, name: 'Caca Arcoíris', emoji: '🌈💩', x: 9, y: 2,
      desc: 'Brilla con todos los colores. Huele a flores… raras.' },
    enemies: [
      { x: 5, y: 5, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Slime Verde', color: '#44aa44', hp: 35 },
      { x: 12, y: 5, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Slime Verde', color: '#3d9944', hp: 35 },
      { x: 9, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Ent Anciano', color: '#226622', hp: 120, boss: true, damage: 22 },
    ],
    heals: [{ x: 3, y: 9, amount: 30 }],
    npc: { x: 3, y: 10, name: 'Sabio Merdín',
      text: '¡Valentín! Cada Caca Maestra está tras un muro sagrado. Derrota al jefe, recoge la llave y abre el muro. ¡Suerte!' },
  },
  {
    num: 2,
    id: 'level_2',
    name: 'Montaña Glacial',
    subtitle: 'Hielo, yetis y congelación',
    intro: 'Nivel 2: La Montaña Glacial te espera. Cuidado con el hielo resbaladizo, los fosos bajo el camino y el Yeti Alfa.',
    map: levelMap_hielo(),
    cols: 18, rows: 12,
    spawn: { x: 9, y: 10 },
    exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    caca: { id: 1, name: 'Caca de Hielo', emoji: '❄️💩', x: 9, y: 2,
      desc: 'Tan fría que congela las fosas nasales. Ideal para verano.' },
    enemies: [
      { x: 6, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Yeti', color: '#88ccff', hp: 45 },
      { x: 9, y: 7, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Yeti Alfa', color: '#aaddff', hp: 150, boss: true, damage: 24 },
    ],
    heals: [{ x: 14, y: 9, amount: 25 }],
  },
  {
    num: 3,
    id: 'level_3',
    name: 'Templo Antiguo',
    subtitle: 'Piedra sagrada y guardianes',
    intro: 'Nivel 3: El Templo Antiguo guarda la Caca Dorada tras un muro sellado. Derrota al Guardián Dorado para abrirlo.',
    map: levelMap_templo(),
    cols: 16, rows: 12,
    spawn: { x: 8, y: 10 },
    exit: { x: 8, y: 11, label: 'Siguiente nivel →' },
    caca: { id: 2, name: 'Caca Dorada', emoji: '✨💩', x: 8, y: 2,
      desc: 'Brilla como el oro. Hace ding cuando la guardas en el inventario.' },
    enemies: [
      { x: 5, y: 5, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Gólem', color: '#886644', hp: 50 },
      { x: 8, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Guardián Dorado', color: '#daa520', hp: 180, boss: true, damage: 26 },
    ],
    heals: [{ x: 2, y: 9, amount: 30 }],
  },
  {
    num: 4,
    id: 'level_4',
    name: 'Pantano Maldito',
    subtitle: 'Lodazal y espectros',
    intro: 'Nivel 4: Pantano Maldito. Derrota al Rey Pantano, abre el muro y reclama la Caca Fantasma.',
    map: levelMap_pantano(),
    cols: 18, rows: 12,
    spawn: { x: 9, y: 10 },
    exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    caca: { id: 3, name: 'Caca Fantasma', emoji: '👻💩', x: 9, y: 2,
      desc: 'Puedes verla pero no tocarla. Menos mal, porque flota.' },
    enemies: [
      { x: 5, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Espectro', color: '#aaaaff', hp: 40 },
      { x: 12, y: 6, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Slime Pantanoso', color: '#2d8a2d', hp: 45 },
      { x: 9, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Rey Pantano', color: '#1a5c1a', hp: 210, boss: true, damage: 28 },
    ],
    heals: [{ x: 3, y: 9, amount: 35 }],
  },
  {
    num: 5,
    id: 'level_5',
    name: 'Volcán Hirviente',
    subtitle: 'Fuego, lava y dragones',
    intro: 'Nivel 5: Volcán Hirviente. Calor, lava y un dragón que eructa fuego. Derrota al Dragón Ígneo y consigue la Caca de Fuego.',
    map: levelMap_volcan(),
    cols: 18, rows: 12,
    spawn: { x: 9, y: 10 },
    exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    caca: { id: 4, name: 'Caca de Fuego', emoji: '🔥💩', x: 9, y: 4,
      desc: 'Calienta la cena y quema las pestañas. Multifunción.' },
    enemies: [
      { x: 5, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Salamandra', color: '#ff4400', hp: 50 },
      { x: 13, y: 7, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Gólem Ígneo', color: '#cc3300', hp: 55 },
      { x: 9, y: 8, patrol: [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }], name: 'Dragón Ígneo', color: '#ff2200', hp: 260, boss: true, radius: 18, damage: 30 },
    ],
    heals: [{ x: 14, y: 9, amount: 25 }],
  },
  {
    num: 6,
    id: 'level_6',
    name: 'Ruinas Estelares',
    subtitle: 'El nexo cósmico',
    intro: 'Nivel 6: Ruinas Estelares. Derrota a la Entidad Cósmica y reclama la Caca Cósmica.',
    map: levelMap_cosmico(),
    cols: 18, rows: 12,
    spawn: { x: 9, y: 10 },
    exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    caca: { id: 5, name: 'Caca Cósmica', emoji: '🌌💩', x: 9, y: 2,
      desc: 'Huele a universo nuevo. La NASA la quiere estudiar.' },
    enemies: [
      { x: 6, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Alien', color: '#aa44ff', hp: 50 },
      { x: 9, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Entidad Cósmica', color: '#cc66ff', hp: 300, boss: true, damage: 32 },
    ],
    heals: [{ x: 3, y: 9, amount: 30 }],
  },
  {
    num: 7,
    id: 'level_7',
    name: 'Trono del Gran Cacas',
    subtitle: 'La prueba final',
    intro: 'Nivel 7: Trono del Gran Cacas. Solo puedes entrar con las 6 Cacas Maestras. Derrota al Gran Cacas y reclama la Caca Suprema.',
    map: levelMap_trono(),
    cols: 18, rows: 12,
    spawn: { x: 9, y: 10 },
    exit: { x: 9, y: 11, label: '🏆 Victoria' },
    caca: { id: 6, name: 'Caca Suprema', emoji: '👑💩', x: 9, y: 2,
      desc: 'La reliquia definitiva. Con ella, Valentín puede ascender al trono.' },
    enemies: [
      { x: 9, y: 5, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Gran Cacas', color: '#6b4a2a', hp: 400, boss: true, radius: 20, damage: 34,
        bossConfig: {
          slamFromPhase: 1,
          slamInterval: [110, 80, 55],
          projectileFromPhase: 2,
          projectileInterval: 70,
        },
      },
    ],
    heals: [{ x: 3, y: 9, amount: 40 }, { x: 14, y: 9, amount: 40 }],
    npc: { x: 3, y: 10, name: 'Heraldo Real',
      text: 'Solo entras si traes las 6 Cacas Maestras. Derrota al Gran Cacas, abre el muro y reclama la séptima. ¡El trono te espera!' },
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
  const { x, y } = lv.caca;
  if (lv.map[y][x] === T.SKY) lv.map[y][x] = T.PATH;
  addCacaBarrier(lv.map, x, y, lv.cols);
  resolveHealPlacements(lv);
});

const WORLDS = {};
LEVELS.forEach(lv => {
  WORLDS[lv.id] = {
    map: lv.map,
    cols: lv.cols,
    rows: lv.rows,
    name: `Nivel ${lv.num}: ${lv.name}`,
    spawn: lv.spawn,
    exit: lv.exit,
    zones: [{ name: lv.name, x: 0, y: 0, w: lv.cols, h: lv.rows }],
    levelNum: lv.num,
  };
});

const CACAS = LEVELS.map(lv => ({ ...lv.caca, requires: [] }));

const ENEMIES_BY_WORLD = {};
LEVELS.forEach(lv => { ENEMIES_BY_WORLD[lv.id] = lv.enemies; });

const NPCS_BY_WORLD = {};
LEVELS.forEach(lv => { if (lv.npc) NPCS_BY_WORLD[lv.id] = [lv.npc]; });

const HEALS_BY_WORLD = {};
LEVELS.forEach(lv => { if (lv.heals) HEALS_BY_WORLD[lv.id] = lv.heals; });

function getLevel(index) { return LEVELS[index]; }

function getLevelById(id) { return LEVELS.find(l => l.id === id); }
