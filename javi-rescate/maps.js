// ═══ Mapas — Javi: Rescate de Leo y Nara ═══
const T = { GRASS:0, WATER:1, ROCK:2, SAND:3, LAVA:4, SWAMP:5, TEMPLE:6, ICE:7, PATH:8, PORTAL:9, DUNGEON:10, SKY:11, GATE:12, PIT:13 };

function addPitRun(m, y, x0, x1) {
  for (let x = x0; x <= x1; x++) m[y][x] = T.PIT;
}

const BACKGROUNDS = {
  level_1: { top: '#87ceeb', mid: '#b8e0d2', bottom: '#3d7a28', deco: 'forest' },
  level_2: { top: '#1a1a2e', mid: '#2d2d44', bottom: '#1a1a28', deco: 'dungeon' },
  level_3: { top: '#4a5568', mid: '#718096', bottom: '#2d3748', deco: 'swamp' },
  level_4: { top: '#2c1810', mid: '#4a3020', bottom: '#1a1008', deco: 'temple' },
  level_5: { top: '#1a0505', mid: '#4a1500', bottom: '#8b2200', deco: 'volcano' },
  level_6: { top: '#c8e6f5', mid: '#a8d8ea', bottom: '#6a9ab0', deco: 'snow' },
  level_7: { top: '#0a0a12', mid: '#1a1028', bottom: '#2a1838', deco: 'dungeon' },
  level_8: { top: '#1a1410', mid: '#3d3028', bottom: '#1a1008', deco: 'temple' },
  level_9: { top: '#0d0d1a', mid: '#1a1a3a', bottom: '#0a0a18', deco: 'cosmic' },
  level_10: { top: '#0a0a12', mid: '#1a1028', bottom: '#2a1838', deco: 'throne' },
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
  [T.PORTAL]:  ['#4a90d9','#2a60a9'],
  [T.DUNGEON]: ['#3d3d3d','#2a2a2a'],
  [T.SKY]:     ['#87ceeb','#5eb8e8'],
  [T.GATE]:    ['#6b5740','#8b7355'],
  [T.PIT]:     ['#1a1018','#0a0810'],
};

function addRelicBarrier(m, cx, cy, cols) {
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
    for (let x = 1; x < w - 1; x++) m[y][x] = T.SKY;
  return m;
}

function levelMap_parque() {
  const m = bordered(18, 12, T.GRASS);
  [[2,4],[2,13],[6,3],[6,14],[8,6]].forEach(([y,x]) => m[y][x] = T.ROCK);
  for (let x = 3; x < 15; x++) { m[6][x] = T.PATH; m[9][x] = T.PATH; }
  for (let y = 6; y < 10; y++) m[y][9] = T.PATH;
  addPitRun(m, 9, 5, 6);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_tunel() {
  const m = bordered(18, 12, T.DUNGEON);
  for (let x = 4; x < 14; x++) m[8][x] = T.PATH;
  for (let y = 5; y < 9; y++) m[y][6] = T.PATH;
  [[3,8],[5,10],[7,4]].forEach(([y,x]) => m[y][x] = T.ROCK);
  addPitRun(m, 8, 7, 8);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_bosque() {
  const m = bordered(18, 12, T.SWAMP);
  [[4,5],[4,12],[7,8]].forEach(([y,x]) => m[y][x] = T.ROCK);
  for (let x = 5; x < 13; x++) m[9][x] = T.PATH;
  addPitRun(m, 9, 7, 8);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_cueva() {
  const m = bordered(16, 12, T.TEMPLE);
  for (let x = 2; x < 14; x++) m[7][x] = T.PATH;
  for (let y = 5; y < 8; y++) m[y][8] = T.PATH;
  m[11][8] = T.PORTAL;
  m[1][8] = T.PATH;
  return m;
}

function levelMap_puente() {
  const m = bordered(18, 12, T.ROCK);
  for (let y = 4; y < 9; y++) for (let x = 5; x < 13; x++) m[y][x] = T.LAVA;
  for (let x = 6; x < 12; x++) { m[7][x] = T.PATH; m[9][x] = T.PATH; }
  addPitRun(m, 7, 8, 9);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_torre() {
  const m = bordered(18, 12, T.ICE);
  [[3,6],[3,11],[6,8]].forEach(([y,x]) => m[y][x] = T.ROCK);
  for (let x = 4; x < 14; x++) m[8][x] = T.PATH;
  addPitRun(m, 8, 6, 7);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_fortaleza() {
  const m = bordered(18, 12, T.DUNGEON);
  for (let x = 4; x < 14; x++) { m[2][x] = T.TEMPLE; m[4][x] = T.TEMPLE; }
  m[5][9] = T.LAVA;
  for (let x = 6; x < 12; x++) m[7][x] = T.PATH;
  addPitRun(m, 7, 7, 9);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_camaras() {
  const m = bordered(18, 12, T.DUNGEON);
  for (let x = 3; x < 15; x++) m[5][x] = T.TEMPLE;
  [[4,6],[4,11],[7,8]].forEach(([y,x]) => m[y][x] = T.ROCK);
  for (let x = 5; x < 13; x++) m[8][x] = T.PATH;
  addPitRun(m, 8, 6, 8);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_abismo() {
  const m = bordered(18, 12, T.ROCK);
  for (let y = 5; y < 10; y++) for (let x = 4; x < 14; x++) if (x < 6 || x > 11) m[y][x] = T.WATER;
  for (let x = 6; x < 12; x++) m[7][x] = T.PATH;
  addPitRun(m, 7, 4, 5);
  addPitRun(m, 7, 12, 13);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

function levelMap_corazon() {
  const m = bordered(18, 12, T.DUNGEON);
  for (let x = 4; x < 14; x++) { m[2][x] = T.TEMPLE; m[3][x] = T.LAVA; m[4][x] = T.TEMPLE; }
  for (let x = 6; x < 12; x++) m[7][x] = T.PATH;
  addPitRun(m, 7, 7, 9);
  m[11][9] = T.PORTAL;
  m[1][9] = T.PATH;
  return m;
}

const LEVELS = [
  {
    num: 1, id: 'level_1', name: 'Parque Silencioso',
    subtitle: 'Donde todo empezó',
    intro: 'Nivel 1: Aquí desaparecieron Leo y Nara. Javi no se rendirá. Derrota al Guardián del Parque, abre el muro y recoge el primer Destello de Esperanza.',
    map: levelMap_parque(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    relic: { id: 0, name: 'Destello 1', emoji: '⭐', x: 9, y: 2, desc: 'Una chispa de esperanza. Leo y Nara están en algún lugar…' },
    enemies: [
      { x: 5, y: 5, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Sombra Pequeña', color: '#4a5568', hp: 35 },
      { x: 12, y: 5, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Sombra Pequeña', color: '#2d3748', hp: 35 },
      { x: 9, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Guardián del Parque', color: '#22543d', hp: 120, boss: true, damage: 20 },
    ],
    heals: [{ x: 3, y: 9, amount: 30 }],
    npc: { x: 3, y: 10, name: 'Vecina',
      text: 'Javi, vi cómo se los llevó una sombra enorme. Leo gritaba tu nombre y Nara lloraba. ¡Tienes que encontrarlos!' },
  },
  {
    num: 2, id: 'level_2', name: 'Túnel de la Noche',
    subtitle: 'Oscuridad bajo tierra',
    intro: 'Nivel 2: El túnel bajo el parque lleva a lugares peores. Cuidado con los fosos y el Jefe Rata Colosal.',
    map: levelMap_tunel(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    relic: { id: 1, name: 'Destello 2', emoji: '⭐', x: 9, y: 2, desc: 'Brilla tenuemente. Javi siente que va por buen camino.' },
    enemies: [
      { x: 6, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Murciélago', color: '#553c9a', hp: 40 },
      { x: 9, y: 7, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Rata Colosal', color: '#744210', hp: 150, boss: true, damage: 22 },
    ],
    heals: [{ x: 14, y: 9, amount: 28 }],
  },
  {
    num: 3, id: 'level_3', name: 'Bosque de Sombras',
    subtitle: 'Niebla y peligro',
    intro: 'Nivel 3: El bosque oculta el camino. Derrota al Lobo de Niebla y sigue la pista de los niños.',
    map: levelMap_bosque(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    relic: { id: 2, name: 'Destello 3', emoji: '⭐', x: 9, y: 2, desc: 'Javi escucha una risa lejana… ¿será Leo?' },
    enemies: [
      { x: 5, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Espíritu del Bosque', color: '#2f855a', hp: 42 },
      { x: 12, y: 6, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Espíritu del Bosque', color: '#276749', hp: 42 },
      { x: 9, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Lobo de Niebla', color: '#4a5568', hp: 180, boss: true, damage: 24 },
    ],
    heals: [{ x: 3, y: 9, amount: 32 }],
  },
  {
    num: 4, id: 'level_4', name: 'Cueva del Eco',
    subtitle: 'Ecos en la oscuridad',
    intro: 'Nivel 4: Los ecos repiten nombres perdidos. Derrota al Eco Oscuro, abre el muro y recoge el destello.',
    map: levelMap_cueva(), cols: 16, rows: 12,
    spawn: { x: 8, y: 10 }, exit: { x: 8, y: 11, label: 'Siguiente nivel →' },
    relic: { id: 3, name: 'Destello 4', emoji: '⭐', x: 8, y: 2,
      desc: 'Los ecos se callan un momento. Javi sigue adelante.' },
    enemies: [
      { x: 5, y: 5, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Eco Maldito', color: '#718096', hp: 48 },
      { x: 8, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Eco Oscuro', color: '#2d3748', hp: 200, boss: true, damage: 26 },
    ],
    heals: [{ x: 2, y: 9, amount: 35 }],
  },
  {
    num: 5, id: 'level_5', name: 'Puente de Lava',
    subtitle: 'El camino arde',
    intro: 'Nivel 5: El camino arde sin piedad. Cruza el puente de lava y derrota al Gólem de Fuego.',
    map: levelMap_puente(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    relic: { id: 4, name: 'Destello 5', emoji: '⭐', x: 9, y: 2, desc: 'La determinación de Javi arde más que la lava.' },
    enemies: [
      { x: 5, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Chispa Viva', color: '#dd6b20', hp: 50 },
      { x: 13, y: 7, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Chispa Viva', color: '#c05621', hp: 50 },
      { x: 9, y: 8, patrol: [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }], name: 'Gólem de Fuego', color: '#e53e3e', hp: 240, boss: true, radius: 17, damage: 28 },
    ],
    heals: [{ x: 14, y: 9, amount: 30 }],
  },
  {
    num: 6, id: 'level_6', name: 'Torre de Hielo',
    subtitle: 'Frío antes del final',
    intro: 'Nivel 6: La torre de hielo guarda el acceso a la fortaleza. Derrota a la Reina de Hielo.',
    map: levelMap_torre(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    relic: { id: 5, name: 'Destello 6', emoji: '⭐', x: 9, y: 2, desc: 'Casi llegas, Javi. Tus hijos te necesitan.' },
    enemies: [
      { x: 6, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Yeti', color: '#90cdf4', hp: 48 },
      { x: 9, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Reina de Hielo', color: '#63b3ed', hp: 280, boss: true, damage: 30 },
    ],
    heals: [{ x: 3, y: 9, amount: 35 }, { x: 14, y: 9, amount: 35 }],
  },
  {
    num: 7, id: 'level_7', name: 'Fortaleza Exterior',
    subtitle: 'Las murallas del mal',
    intro: 'Nivel 7: Has llegado a la fortaleza. Derrota al Capitán de Sombras… pero Leo y Nara no están aquí. Hay que bajar más.',
    map: levelMap_fortaleza(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    relic: { id: 6, name: 'Destello 7', emoji: '⭐', x: 9, y: 2, desc: 'La fortaleza cede un poco. Leo y Nara siguen más adentro.' },
    enemies: [
      { x: 6, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Soldado Sombra', color: '#2d3748', hp: 52 },
      { x: 12, y: 6, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Soldado Sombra', color: '#1a202c', hp: 52 },
      { x: 9, y: 5, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Capitán de Sombras', color: '#4a5568', hp: 300, boss: true, damage: 30 },
    ],
    heals: [{ x: 3, y: 9, amount: 38 }, { x: 14, y: 9, amount: 38 }],
    npc: { x: 3, y: 10, name: 'Prisionero',
      text: 'Javi… Leo y Nara están en lo más profundo, en el Corazón de la Oscuridad. El Secuestrador los tiene allí. ¡Sigue bajando!' },
  },
  {
    num: 8, id: 'level_8', name: 'Cámaras Profundas',
    subtitle: 'Bajo la fortaleza',
    intro: 'Nivel 8: Pasillos oscuros y trampas. Derrota al Señor de las Cámaras y sigue el rastro de tus hijos.',
    map: levelMap_camaras(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    relic: { id: 7, name: 'Destello 8', emoji: '⭐', x: 9, y: 2, desc: 'Javi escucha voces muy cerca… ¿serán Leo y Nara?' },
    enemies: [
      { x: 5, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Gárgola', color: '#718096', hp: 55 },
      { x: 12, y: 6, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Gárgola', color: '#4a5568', hp: 55 },
      { x: 9, y: 7, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Señor de las Cámaras', color: '#553c9a', hp: 320, boss: true, damage: 31 },
    ],
    heals: [{ x: 3, y: 9, amount: 40 }],
    npc: { x: 2, y: 10, name: 'Eco',
      text: '«¡Papá!»… «¡Papá, ayuda!»… Dos voces pequeñas resuenan desde el salón final. ¡Un nivel más!' },
  },
  {
    num: 9, id: 'level_9', name: 'Puente del Abismo',
    subtitle: 'Un paso al vacío',
    intro: 'Nivel 9: Un puente sobre el abismo separa a Javi de sus hijos. Derrota al Guardián del Abismo.',
    map: levelMap_abismo(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: 'Siguiente nivel →' },
    relic: { id: 8, name: 'Destello 9', emoji: '⭐', x: 9, y: 2, desc: 'Al otro lado del abismo, una luz doble brilla.' },
    enemies: [
      { x: 6, y: 6, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Espectro del Vacío', color: '#2c5282', hp: 58 },
      { x: 12, y: 6, patrol: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }], name: 'Espectro del Vacío', color: '#2b6cb0', hp: 58 },
      { x: 9, y: 7, patrol: [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }], name: 'Guardián del Abismo', color: '#1a365d', hp: 350, boss: true, radius: 18, damage: 32 },
    ],
    heals: [{ x: 3, y: 9, amount: 42 }, { x: 14, y: 9, amount: 42 }],
  },
  {
    num: 10, id: 'level_10', name: 'Corazón de la Oscuridad',
    subtitle: 'Salvar a Leo y Nara',
    intro: 'Nivel 10: Solo con los 9 destellos puedes entrar. Derrota al Secuestrador de Sombras y rescata a Leo y Nara.',
    map: levelMap_corazon(), cols: 18, rows: 12,
    spawn: { x: 9, y: 10 }, exit: { x: 9, y: 11, label: '🏆 Victoria' },
    relic: { id: 9, name: 'Leo y Nara', emoji: '⭐', x: 9, y: 2,
      desc: '¡Leo y Nara libres! Los tres se abrazan. La familia vuelve a estar junta.' },
    enemies: [
      { x: 9, y: 5, patrol: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }], name: 'Secuestrador de Sombras', color: '#1a202c', hp: 400, boss: true, radius: 20, damage: 34,
        bossConfig: {
          slamFromPhase: 1,
          slamInterval: [110, 80, 55],
          projectileFromPhase: 2,
          projectileInterval: 70,
        },
      },
    ],
    heals: [{ x: 3, y: 9, amount: 45 }, { x: 14, y: 9, amount: 45 }],
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
  if (lv.relic) add(lv.relic.x, lv.relic.y);
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
    if (!occupied.has(key)) { occupied.add(key); continue; }
    const spot = findFreeHealTile(lv, occupied, heal.x, heal.y);
    heal.x = spot.x;
    heal.y = spot.y;
    occupied.add(`${heal.x},${heal.y}`);
  }
}

LEVELS.forEach(lv => {
  const { x, y } = lv.relic;
  if (lv.map[y][x] === T.SKY) lv.map[y][x] = T.PATH;
  addRelicBarrier(lv.map, x, y, lv.cols);
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

const RELICS = LEVELS.map(lv => ({ ...lv.relic, requires: [] }));

const ENEMIES_BY_WORLD = {};
LEVELS.forEach(lv => { ENEMIES_BY_WORLD[lv.id] = lv.enemies; });

const NPCS_BY_WORLD = {};
LEVELS.forEach(lv => { if (lv.npc) NPCS_BY_WORLD[lv.id] = [lv.npc]; });

const HEALS_BY_WORLD = {};
LEVELS.forEach(lv => { if (lv.heals) HEALS_BY_WORLD[lv.id] = lv.heals; });

function getLevel(index) { return LEVELS[index]; }
function getLevelById(id) { return LEVELS.find(l => l.id === id); }
