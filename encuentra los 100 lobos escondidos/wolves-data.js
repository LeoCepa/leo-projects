/** 100 lobos colocados a mano (cuadrícula + variación por índice) */
const SCENE_W = 4800;
const SCENE_H = 3600;

function hash01(n, salt = 0) {
  let x = (n + salt) * 2654435761 >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 4294967296;
}

function buildPlacements() {
  const wolves = [];
  const cols = 10;
  const rows = 10;
  const marginX = 100;
  const marginY = 160;
  const startY = SCENE_H * 0.27;
  const playW = SCENE_W - marginX * 2;
  const playH = SCENE_H * 0.69 - marginY;

  for (let i = 0; i < 100; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const h1 = hash01(i, 11);
    const h2 = hash01(i, 29);
    const h3 = hash01(i, 47);
    const h4 = hash01(i, 83);
    const h5 = hash01(i, 131);

    const cellCx = marginX + (col + 0.5) * (playW / cols);
    const cellCy = startY + marginY + (row + 0.5) * (playH / rows);
    const jx = (h1 - 0.5) * (playW / cols) * 0.9;
    const jy = (h2 - 0.5) * (playH / rows) * 0.9;

    let size = 14 + h3 * 14;
    let alpha = 0.52 + h5 * 0.38;
    const rot = (h4 - 0.5) * 1.55;

    // Algunos un poco más difíciles, pero no imposibles
    if (i % 7 === 0) size = 12 + h3 * 6;
    if (i % 11 === 0) alpha = 0.42 + h5 * 0.22;
    if (i % 13 === 0) size = 18 + h3 * 8;

    const x = Math.round((cellCx + jx) * 10) / 10;
    const y = Math.round((cellCy + jy) * 10) / 10;

    wolves.push({
      id: i,
      x,
      y,
      size: Math.round(size * 10) / 10,
      rot: Math.round(rot * 1000) / 1000,
      alpha: Math.round(alpha * 100) / 100,
      r: Math.round(size * 1.05 * 10) / 10,
      layer: i % 5 === 0 ? "deep" : "normal",
    });
  }

  return wolves;
}

export const WOLF_PLACEMENTS = buildPlacements();
