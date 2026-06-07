// ═══ Motor gráfico pixel-art ═══
const Gfx = {
  tileSize: 32,
  tiles: {},
  time: 0,

  init() {
    for (const [key, val] of Object.entries(T)) {
      this.tiles[val] = this._bakeTile(val);
    }
  },

  hash(x, y) { return ((x * 73856093) ^ (y * 19349663)) >>> 0; },

  _tileShade(g, s, strength = 1) {
    const lg = g.createLinearGradient(0, 0, s, s);
    lg.addColorStop(0, `rgba(255,255,255,${0.14 * strength})`);
    lg.addColorStop(0.5, 'rgba(255,255,255,0)');
    lg.addColorStop(1, `rgba(0,0,0,${0.28 * strength})`);
    g.fillStyle = lg;
    g.fillRect(0, 0, s, s);
  },

  _speckle(g, s, color, count, seed) {
    for (let i = 0; i < count; i++) {
      const h = this.hash(seed, i * 17);
      g.fillStyle = color;
      g.fillRect((h % (s - 1)) + 1, ((h >> 5) % (s - 1)) + 1, 1, 1);
    }
  },

  _bakeTile(type) {
    const s = this.tileSize;
    const c = document.createElement('canvas');
    c.width = s; c.height = s;
    const g = c.getContext('2d');
    const draw = this['_tile_' + type];
    if (draw) draw.call(this, g, s);
    else this._tileDefault(g, s, TILE_COLORS[type] || TILE_COLORS[0]);
    return c;
  },

  _tileDefault(g, s, colors) {
    g.fillStyle = colors[0]; g.fillRect(0, 0, s, s);
    g.fillStyle = colors[1]; g.fillRect(2, 2, s - 4, s - 4);
  },

  _tile_0(g, s) { // GRASS
    const bg = g.createLinearGradient(0, 0, 0, s);
    bg.addColorStop(0, '#3d8f28'); bg.addColorStop(1, '#1f5512');
    g.fillStyle = bg; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 14; i++) {
      const h = this.hash(0, i);
      const px = (h % (s - 6)) + 3, py = ((h >> 4) % (s - 8)) + 4;
      const len = 3 + (h % 3);
      g.strokeStyle = i % 3 ? '#5cb838' : '#2d7018';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(px, py + len); g.lineTo(px + (i % 2 ? 1 : -1), py); g.stroke();
    }
    g.fillStyle = 'rgba(45,80,30,0.35)';
    g.fillRect(4, s - 8, 10, 4); g.fillRect(18, 14, 8, 3);
    this._speckle(g, s, 'rgba(90,55,25,0.5)', 6, 42);
    this._tileShade(g, s, 0.9);
  },

  _tile_1(g, s) { // WATER
    const deep = g.createLinearGradient(0, 0, 0, s);
    deep.addColorStop(0, '#1a7aaa'); deep.addColorStop(0.6, '#145a82'); deep.addColorStop(1, '#0a3048');
    g.fillStyle = deep; g.fillRect(0, 0, s, s);
    g.fillStyle = 'rgba(80,180,230,0.25)';
    for (let i = 0; i < 5; i++) {
      g.beginPath(); g.ellipse(6 + i * 5, 8 + (i % 3) * 6, 5, 2, 0, 0, Math.PI * 2); g.fill();
    }
    this._speckle(g, s, 'rgba(200,240,255,0.2)', 8, 7);
    this._tileShade(g, s, 0.7);
  },

  _tile_2(g, s) { // ROCK
    g.fillStyle = '#2e2e2e'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#4a4a4a'; g.beginPath();
    g.moveTo(2, s - 2); g.lineTo(s / 2 - 1, 3); g.lineTo(s - 2, s - 2); g.closePath(); g.fill();
    g.fillStyle = '#626262'; g.beginPath();
    g.moveTo(6, s - 4); g.lineTo(s / 2 + 3, 7); g.lineTo(s - 5, s - 5); g.closePath(); g.fill();
    g.fillStyle = '#7a7a7a'; g.beginPath();
    g.moveTo(s / 2 - 6, 6); g.lineTo(s / 2 + 2, 6); g.lineTo(s / 2 - 1, 12); g.closePath(); g.fill();
    g.fillStyle = 'rgba(55,90,40,0.45)';
    g.fillRect(3, s - 6, 7, 3); g.fillRect(s - 10, 10, 5, 4);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.beginPath(); g.moveTo(s / 2, 5); g.lineTo(s / 2 + 8, 14); g.lineTo(s / 2 + 4, 16); g.closePath(); g.fill();
    this._tileShade(g, s, 1.1);
  },

  _tile_3(g, s) { // SAND
    const sand = g.createLinearGradient(0, 0, s, s);
    sand.addColorStop(0, '#d4b85a'); sand.addColorStop(1, '#9a7d35');
    g.fillStyle = sand; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 18; i++) {
      const h = this.hash(3, i);
      g.fillStyle = h % 2 ? 'rgba(255,230,160,0.35)' : 'rgba(120,90,40,0.2)';
      g.fillRect((h % s), ((h >> 3) % s), 2, 1);
    }
    g.strokeStyle = 'rgba(180,140,70,0.3)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, 20); g.quadraticCurveTo(12, 16, s, 22); g.stroke();
    this._tileShade(g, s, 0.85);
  },

  _tile_4(g, s) { // LAVA
    g.fillStyle = '#4a1200'; g.fillRect(0, 0, s, s);
    const crust = g.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
    crust.addColorStop(0, '#8b2800'); crust.addColorStop(0.55, '#c43800'); crust.addColorStop(1, '#5a1800');
    g.fillStyle = crust; g.fillRect(1, 1, s - 2, s - 2);
    g.strokeStyle = '#ff6a20'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(8, 12); g.lineTo(14, 18); g.lineTo(20, 10); g.stroke();
    g.beginPath(); g.moveTo(6, 22); g.lineTo(12, 26); g.stroke();
    g.fillStyle = 'rgba(255,200,60,0.55)';
    g.fillRect(10, 14, 5, 4); g.fillRect(18, 8, 4, 3);
    this._tileShade(g, s, 0.6);
  },

  _tile_5(g, s) { // SWAMP
    g.fillStyle = '#0f2210'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#1a3520'; g.fillRect(1, 1, s - 2, s - 2);
    g.fillStyle = 'rgba(40,75,45,0.85)';
    g.beginPath(); g.ellipse(s / 2, s / 2 + 2, 11, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(70,120,60,0.4)';
    g.beginPath(); g.ellipse(s / 2 - 4, s / 2 - 2, 6, 3, -0.4, 0, Math.PI * 2); g.fill();
    this._speckle(g, s, 'rgba(30,50,25,0.6)', 10, 55);
    this._tileShade(g, s, 0.8);
  },

  _tile_6(g, s) { // TEMPLE
    g.fillStyle = '#4a3c2e'; g.fillRect(0, 0, s, s);
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 4; col++) {
        const bx = col * 8, by = row * 8;
        const stone = g.createLinearGradient(bx, by, bx + 7, by + 7);
        stone.addColorStop(0, '#a08868'); stone.addColorStop(1, '#6b5740');
        g.fillStyle = stone;
        g.fillRect(bx + 1, by + 1, 7, 7);
        g.fillStyle = '#3d3020';
        g.fillRect(bx + 7, by + 1, 1, 7); g.fillRect(bx + 1, by + 7, 7, 1);
      }
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.fillRect(2, 2, s - 4, 2);
    this._tileShade(g, s, 0.75);
  },

  _tile_7(g, s) { // ICE
    const ice = g.createLinearGradient(0, 0, s, s);
    ice.addColorStop(0, '#d8f0ff'); ice.addColorStop(0.5, '#9ed0ea'); ice.addColorStop(1, '#5a9cb8');
    g.fillStyle = ice; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(4, 8); g.lineTo(12, 4); g.lineTo(20, 10); g.lineTo(16, 20); g.lineTo(6, 18); g.closePath(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(8, 6, 6, 2); g.fillRect(14, 14, 8, 2);
    this._tileShade(g, s, 0.65);
  },

  _tile_8(g, s) { // PATH
    g.fillStyle = '#5a4532'; g.fillRect(0, 0, s, s);
    const stones = [[2,2],[10,1],[18,4],[4,10],[14,9],[22,12],[6,20],[16,18]];
    stones.forEach(([cx, cy], i) => {
      const stone = g.createRadialGradient(cx + 3, cy + 3, 1, cx + 3, cy + 3, 5);
      stone.addColorStop(0, i % 2 ? '#b09068' : '#9b7653');
      stone.addColorStop(1, '#5d4630');
      g.fillStyle = stone;
      g.beginPath(); g.ellipse(cx + 3, cy + 3, 4 + (i % 2), 3, i * 0.3, 0, Math.PI * 2); g.fill();
    });
    this._speckle(g, s, 'rgba(40,30,20,0.35)', 8, 88);
    this._tileShade(g, s, 0.8);
  },

  _tile_9(g, s) { // PORTAL
    g.fillStyle = '#1a0530'; g.fillRect(0, 0, s, s);
    const ring = g.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2 - 2);
    ring.addColorStop(0, '#6a20b0'); ring.addColorStop(0.7, '#3a0870'); ring.addColorStop(1, '#1a0530');
    g.fillStyle = ring; g.fillRect(2, 2, s - 4, s - 4);
    g.strokeStyle = 'rgba(200,140,255,0.35)'; g.lineWidth = 2;
    g.strokeRect(5, 5, s - 10, s - 10);
    this._tileShade(g, s, 0.5);
  },

  _tile_12(g, s) { // GATE
    g.fillStyle = '#3a2e22'; g.fillRect(0, 0, s, s);
    const frame = g.createLinearGradient(0, 0, 0, s);
    frame.addColorStop(0, '#9a8468'); frame.addColorStop(1, '#4a3a28');
    g.fillStyle = frame; g.fillRect(2, 2, s - 4, s - 4);
    g.fillStyle = '#2a2018'; g.fillRect(4, 4, s - 8, 5); g.fillRect(4, s - 9, s - 8, 5);
    for (let i = 0; i < 4; i++) {
      const bx = 7 + i * 5;
      const bar = g.createLinearGradient(bx, 8, bx + 4, s - 8);
      bar.addColorStop(0, '#c9a030'); bar.addColorStop(0.5, '#8b6914'); bar.addColorStop(1, '#5a4510');
      g.fillStyle = bar;
      g.fillRect(bx, 9, 3, s - 18);
      g.fillStyle = '#ffd700';
      g.fillRect(bx - 1, 10, 5, 2); g.fillRect(bx - 1, s - 13, 5, 2);
    }
    const lock = g.createRadialGradient(s / 2, s / 2, 1, s / 2, s / 2, 6);
    lock.addColorStop(0, '#fff4a8'); lock.addColorStop(1, '#b8860b');
    g.fillStyle = lock;
    g.fillRect(s / 2 - 5, s / 2 - 5, 10, 10);
    this._tileShade(g, s, 1);
  },

  _tile_13(g, s) { // PIT
    g.fillStyle = '#3a3028'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#5a4a38';
    g.fillRect(2, 2, s - 4, 6); g.fillRect(2, 2, 6, s - 4); g.fillRect(s - 8, 2, 6, s - 4);
    g.fillStyle = '#08060c';
    g.beginPath();
    g.moveTo(6, 10); g.lineTo(s - 6, 10); g.lineTo(s - 3, s - 3); g.lineTo(3, s - 3);
    g.closePath(); g.fill();
    g.fillStyle = '#120e18';
    g.beginPath();
    g.moveTo(10, 14); g.lineTo(s - 10, 14); g.lineTo(s - 6, s - 6); g.lineTo(6, s - 6);
    g.closePath(); g.fill();
    for (let i = 0; i < 4; i++) {
      const x = 8 + i * 5;
      g.fillStyle = '#1e1828';
      g.beginPath();
      g.moveTo(x, s - 4); g.lineTo(x + 2, s - 11); g.lineTo(x + 4, s - 4);
      g.fill();
    }
    this._tileShade(g, s, 0.9);
  },

  _tile_10(g, s) { // DUNGEON
    g.fillStyle = '#141414'; g.fillRect(0, 0, s, s);
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 4; col++) {
        const bx = col * 8, by = row * 8;
        g.fillStyle = (row + col) % 2 ? '#2e2e2e' : '#242424';
        g.fillRect(bx, by, 7, 7);
        if ((row + col) % 3 === 0) {
          g.strokeStyle = 'rgba(60,60,60,0.6)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(bx + 2, by + 4); g.lineTo(bx + 5, by + 6); g.stroke();
        }
      }
    this._tileShade(g, s, 0.85);
  },

  // ── Tiles animados encima del bake ──
  drawBackground(ctx, camX, camY, w, h, worldId) {
    const bg = BACKGROUNDS[worldId] || BACKGROUNDS.level_1;
    const t = this.time;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, bg.top);
    grad.addColorStop(0.45, bg.mid);
    grad.addColorStop(1, bg.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const px = camX * 0.25;
    const py = camY * 0.15;

    if (bg.deco === 'forest') {
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 180 - px + t / 80) % (w + 120)) - 60;
        const cy = 40 + (i % 3) * 18 + Math.sin(t / 900 + i) * 4;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.arc(cx, cy, 18 + (i % 2) * 6, 0, Math.PI * 2);
        ctx.arc(cx + 22, cy + 4, 14, 0, Math.PI * 2);
        ctx.arc(cx - 20, cy + 6, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(20,60,20,0.55)';
      for (let i = 0; i < 10; i++) {
        const tx = ((i * 95 - px * 0.6) % (w + 80)) - 40;
        const th = 50 + (i % 4) * 12;
        ctx.fillRect(tx, h - th - 30, 14, th);
        ctx.beginPath();
        ctx.moveTo(tx - 10, h - th - 30);
        ctx.lineTo(tx + 7, h - th - 55 - (i % 3) * 8);
        ctx.lineTo(tx + 24, h - th - 30);
        ctx.fill();
      }
    }

    if (bg.deco === 'snow') {
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 47 + t / (30 + i % 10)) % (w + 20)) - 10;
        const sy = ((i * 31 + t / (40 + i % 8) * (i % 3 + 1)) % (h + 20)) - 10;
        ctx.fillStyle = `rgba(255,255,255,${0.3 + (i % 5) * 0.1})`;
        ctx.fillRect(sx, sy, 2 + (i % 2), 2 + (i % 2));
      }
      ctx.fillStyle = 'rgba(180,210,230,0.5)';
      ctx.beginPath();
      ctx.moveTo(-20 - px * 0.3, h - 60);
      for (let x = -20; x < w + 40; x += 40)
        ctx.lineTo(x - px * 0.3, h - 90 - (x % 80));
      ctx.lineTo(w + 40, h);
      ctx.lineTo(-20, h);
      ctx.closePath();
      ctx.fill();
    }

    if (bg.deco === 'temple') {
      const sunX = w * 0.72 - px * 0.1;
      const sunY = 55 + Math.sin(t / 1200) * 3;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 55);
      sunGrad.addColorStop(0, 'rgba(255,220,120,0.9)');
      sunGrad.addColorStop(1, 'rgba(255,180,60,0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath(); ctx.arc(sunX, sunY, 55, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(40,30,20,0.6)';
      for (let i = 0; i < 5; i++) {
        const bx = ((i * 160 - px * 0.5) % (w + 100)) - 50;
        ctx.fillRect(bx, h - 80, 30, 80);
        ctx.beginPath();
        ctx.moveTo(bx - 8, h - 80);
        ctx.lineTo(bx + 15, h - 110);
        ctx.lineTo(bx + 38, h - 80);
        ctx.fill();
      }
    }

    if (bg.deco === 'swamp') {
      for (let i = 0; i < 5; i++) {
        const fx = ((i * 200 - px + t / 120) % (w + 100)) - 50;
        ctx.fillStyle = `rgba(60,90,50,${0.15 + (i % 3) * 0.08})`;
        ctx.beginPath();
        ctx.ellipse(fx, h * 0.35 + i * 25, 80 + i * 20, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(30,50,30,0.7)';
      for (let i = 0; i < 8; i++) {
        const tx = ((i * 110 - px * 0.4) % (w + 60)) - 30;
        ctx.fillRect(tx + 4, h - 70, 3, 50);
        ctx.beginPath();
        ctx.moveTo(tx, h - 70);
        ctx.quadraticCurveTo(tx + 20, h - 100 - (i % 2) * 15, tx + 40, h - 65);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(30,50,30,0.7)';
        ctx.stroke();
      }
    }

    if (bg.deco === 'volcano') {
      for (let i = 0; i < 25; i++) {
        const ex = ((i * 63 + t / (20 + i % 6)) % (w + 10)) - 5;
        const ey = h - 20 - ((t / (25 + i % 7) + i * 40) % (h * 0.6));
        ctx.fillStyle = `rgba(255,${80 + (i % 4) * 30},0,${0.2 + (i % 3) * 0.15})`;
        ctx.fillRect(ex, ey, 3, 3);
      }
      ctx.fillStyle = 'rgba(30,10,5,0.65)';
      ctx.beginPath();
      ctx.moveTo(-30 - px * 0.4, h - 40);
      ctx.lineTo(w * 0.35 - px * 0.4, h - 140);
      ctx.lineTo(w * 0.42 - px * 0.4, h - 40);
      ctx.lineTo(w * 0.65 - px * 0.3, h - 160);
      ctx.lineTo(w + 30, h - 40);
      ctx.lineTo(w + 30, h + 10);
      ctx.lineTo(-30, h + 10);
      ctx.closePath();
      ctx.fill();
    }

    if (bg.deco === 'cosmic') {
      for (let i = 0; i < 60; i++) {
        const sx = (i * 97) % w;
        const sy = (i * 53) % h;
        const twinkle = 0.3 + Math.sin(t / (200 + i * 7) + i) * 0.35;
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.fillRect(sx, sy, 1 + (i % 2), 1 + (i % 2));
      }
      const nebX = w * 0.5 - px * 0.2;
      const nebY = h * 0.35;
      const neb = ctx.createRadialGradient(nebX, nebY, 10, nebX, nebY, 180);
      neb.addColorStop(0, 'rgba(140,60,255,0.35)');
      neb.addColorStop(0.5, 'rgba(60,20,180,0.15)');
      neb.addColorStop(1, 'transparent');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, w, h);
      const neb2 = ctx.createRadialGradient(w * 0.2, h * 0.6, 5, w * 0.2, h * 0.6, 120);
      neb2.addColorStop(0, 'rgba(40,180,255,0.2)');
      neb2.addColorStop(1, 'transparent');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, w, h);
    }

    if (bg.deco === 'throne') {
      for (let i = 0; i < 4; i++) {
        const fx = w * (0.2 + i * 0.2);
        const flicker = 0.4 + Math.sin(t / (180 + i * 40)) * 0.25;
        const torch = ctx.createRadialGradient(fx, h - 50, 2, fx, h - 70, 40);
        torch.addColorStop(0, `rgba(255,160,40,${flicker})`);
        torch.addColorStop(1, 'transparent');
        ctx.fillStyle = torch;
        ctx.fillRect(fx - 45, h - 110, 90, 80);
      }
      ctx.fillStyle = 'rgba(80,40,20,0.5)';
      ctx.fillRect(w * 0.3, h - 55, w * 0.4, 55);
      ctx.fillStyle = 'rgba(255,215,0,0.25)';
      ctx.fillRect(w * 0.42, h - 75, w * 0.16, 20);
    }

    // Rayos de luz volumétricos
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const rays = ctx.createLinearGradient(w * 0.15 - px * 0.1, 0, w * 0.55, h * 0.7);
    rays.addColorStop(0, 'rgba(255,240,200,0.12)');
    rays.addColorStop(0.4, 'rgba(255,220,160,0.04)');
    rays.addColorStop(1, 'transparent');
    ctx.fillStyle = rays;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    const haze = ctx.createLinearGradient(0, h * 0.45, 0, h);
    haze.addColorStop(0, 'transparent');
    haze.addColorStop(0.7, 'rgba(20,30,40,0.12)');
    haze.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, w, h);
  },

  _drawTileDepth(ctx, sx, sy, type) {
    const s = this.tileSize;
    if (type === T.ROCK || type === T.GATE || type === T.TEMPLE) {
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.fillRect(sx + 2, sy + s - 7, s - 4, 7);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(sx, sy, s, 3);
    }
    if (type !== T.SKY && type !== T.WATER && type !== T.LAVA && type !== T.PIT) {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(sx + s - 2, sy, 2, s);
      ctx.fillRect(sx, sy + s - 2, s, 2);
    }
  },

  drawTile(ctx, sx, sy, type, col, row) {
    if (type === T.SKY) return;

    const img = this.tiles[type];
    if (img) ctx.drawImage(img, sx, sy);

    const t = this.time;
    const h = this.hash(col, row);

    if (type === T.GRASS && h % 17 === 0) {
      ctx.fillStyle = h % 2 ? '#e74c3c' : '#f1c40f';
      ctx.beginPath(); ctx.arc(sx + 9 + h % 10, sy + 7 + h % 8, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2d5018';
      ctx.fillRect(sx + 9 + h % 10, sy + 9 + h % 8, 1, 3);
    }

    if (type === T.WATER) {
      const s = this.tileSize;
      const wave1 = Math.sin(t / 380 + col * 0.6 + row * 0.4) * 2;
      const wave2 = Math.sin(t / 520 + col * 0.3 - row * 0.5) * 1.5;
      ctx.fillStyle = 'rgba(120,210,255,0.4)';
      ctx.fillRect(sx + 1, sy + 8 + wave1, s - 2, 4);
      ctx.fillStyle = 'rgba(80,160,220,0.25)';
      ctx.fillRect(sx + 2, sy + 18 + wave2, s - 4, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath(); ctx.ellipse(sx + 8 + h % 12, sy + 5 + Math.sin(t / 280 + row) * 2, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
    }

    if (type === T.LAVA) {
      const bob = Math.sin(t / 250 + col + row) * 2;
      const glow = ctx.createRadialGradient(sx + 14 + h % 8, sy + 14 + bob, 1, sx + 14, sy + 14, 10);
      glow.addColorStop(0, `rgba(255,${200 + bob * 15},60,0.75)`);
      glow.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(sx + 14 + h % 8, sy + 14 + bob, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,120,20,0.45)';
      ctx.beginPath(); ctx.arc(sx + 22 + h % 6, sy + 9 + bob * 0.5, 4, 0, Math.PI * 2); ctx.fill();
    }

    if (type === T.ICE) {
      const spark = (Math.sin(t / 200 + h) + 1) / 2;
      ctx.fillStyle = `rgba(255,255,255,${0.25 + spark * 0.45})`;
      ctx.beginPath(); ctx.arc(sx + 7 + h % 14, sy + 5 + h % 10, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(200,240,255,${0.15 + spark * 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx + 4, sy + 12); ctx.lineTo(sx + 12, sy + 8); ctx.stroke();
    }

    if (type === T.SWAMP) {
      const b = Math.sin(t / 500 + h) * 2;
      ctx.fillStyle = 'rgba(90,170,70,0.45)';
      ctx.beginPath(); ctx.ellipse(sx + 13 + h % 8, sy + 19 + b, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(40,80,35,0.3)';
      ctx.beginPath(); ctx.ellipse(sx + 8, sy + 14 + b * 0.5, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    }

    if (type === T.PIT) {
      const s = this.tileSize;
      const drift = Math.sin(t / 420 + col * 0.5) * 1.5;
      const glow = ctx.createRadialGradient(sx + 16, sy + 22 + drift, 1, sx + 16, sy + 22, 12);
      glow.addColorStop(0, 'rgba(120,60,180,0.35)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.ellipse(sx + 16, sy + 22 + drift, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,80,80,${0.25 + Math.sin(t / 300 + row) * 0.15})`;
      ctx.beginPath(); ctx.arc(sx + 11 + h % 6, sy + 20 + drift, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + 20 - h % 5, sy + 21 + drift * 0.5, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    this._drawTileDepth(ctx, sx, sy, type);

    if (type === T.GATE) {
      const open = typeof isGateOpen === 'function' && isGateOpen();
      if (open) {
        const glow = 0.35 + Math.sin(t / 280) * 0.2;
        ctx.fillStyle = `rgba(255,215,0,${glow})`;
        ctx.fillRect(sx + 6, sy + 10, this.tileSize - 12, this.tileSize - 20);
        ctx.font = '14px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('✨', sx + 16, sy + 16);
      } else {
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
        ctx.strokeText('🔒', sx + 16, sy + 14);
        ctx.fillText('🔒', sx + 16, sy + 14);
        ctx.font = 'bold 8px Nunito,sans-serif';
        ctx.fillStyle = '#ffeaa7';
        ctx.strokeText('Muro', sx + 16, sy + 26);
        ctx.fillText('Muro', sx + 16, sy + 26);
      }
    }

    if (type === T.PORTAL) {
      const pulse = 0.6 + Math.sin(t / 200) * 0.4;
      const cx = sx + 16, cy = sy + 16;
      const core = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
      core.addColorStop(0, `rgba(240,200,255,${pulse})`);
      core.addColorStop(1, 'rgba(100,40,180,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 3; i++) {
        const r = 6 + i * 4 + Math.sin(t / 300 + i) * 2;
        ctx.strokeStyle = `rgba(${160 + i * 30},${60 + i * 20},255,${pulse * (0.5 - i * 0.12)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, t / 500 + i, t / 500 + i + Math.PI * 1.2); ctx.stroke();
      }
    }
  },

  drawSceneLighting(ctx, w, h) {
    const light = ctx.createLinearGradient(0, 0, w, h);
    light.addColorStop(0, 'rgba(255,245,220,0.07)');
    light.addColorStop(0.35, 'rgba(255,255,255,0)');
    light.addColorStop(1, 'rgba(0,0,0,0.14)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, w, h);
  },

  drawShadow(ctx, x, y, r) {
    const sg = ctx.createRadialGradient(x, y + r * 0.55, 1, x, y + r * 0.55, r * 1.1);
    sg.addColorStop(0, 'rgba(0,0,0,0.42)');
    sg.addColorStop(0.55, 'rgba(0,0,0,0.18)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.58, r * 1.05, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  drawPlayer(ctx, x, y, facing, walkFrame, attacking, jumpH = 0) {
    const shadowScale = 1 - Math.min(jumpH / 22, 0.5);
    this.drawShadow(ctx, x, y, 14 * shadowScale);
    ctx.save();
    ctx.translate(x, y - jumpH);

    const flip = facing.x < -0.1 ? -1 : 1;
    ctx.scale(flip, 1);

    const legOff = jumpH > 2 ? -3 : Math.sin(walkFrame * 0.4) * 3;

    // Javi — papá aventurero (camiseta azul, vaqueros)
    ctx.fillStyle = '#2c5282';
    ctx.fillRect(-8, -6, 16, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(-6, -4, 5, 8);

    ctx.fillStyle = '#2d3748';
    ctx.fillRect(-6, 6 + legOff, 5, 8);
    ctx.fillRect(2, 6 - legOff, 5, 8);
    ctx.fillStyle = '#1a365d';
    ctx.fillRect(-7, 12 + legOff, 6, 4);
    ctx.fillRect(1, 12 - legOff, 6, 4);

    const skin = ctx.createRadialGradient(-2, -16, 2, 0, -14, 10);
    skin.addColorStop(0, '#ffe0c0'); skin.addColorStop(1, '#d4a87a');
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(0, -14, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-8, -20, 16, 5);
    ctx.fillStyle = '#1a2530';
    ctx.fillRect(-5, -16, 10, 3);
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath(); ctx.ellipse(0, -11, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();

    const batAng = attacking ? -1.0 : -0.5;
    ctx.save();
    ctx.rotate(batAng);
    ctx.fillStyle = '#8b6914'; ctx.fillRect(8, -2, 14, 4);
    ctx.fillStyle = '#5d4037'; ctx.fillRect(6, -4, 5, 8);
    if (attacking) {
      ctx.strokeStyle = 'rgba(255,215,0,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(14, 0, 10, -0.4, 0.6); ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  },

  drawEnemy(ctx, e, x, y) {
    if (e.dead) return;
    const t = this.time;
    const r = e.radius;
    this.drawShadow(ctx, x, y, r);

    // Aura de furia
    if (e.boss && e.phase >= 1) {
      const pulse = 0.25 + Math.sin(t / 120) * 0.15;
      ctx.fillStyle = e.phase >= 2 ? `rgba(255,30,0,${pulse})` : `rgba(255,120,0,${pulse})`;
      ctx.beginPath();
      ctx.arc(x, y, r + 14 + e.phase * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (e.hitFlash > 0 && e.hitFlash % 2 === 0) ctx.globalAlpha = 0.45;

    const bob = Math.sin(t / 300 + e.px) * (e.boss ? 2 : 3);
    ctx.save();
    ctx.translate(x, y + bob);

    const kind = this._enemyKind(e);
    const isReyJavi = (e.name || '').toLowerCase().includes('rey javi');

    if (isReyJavi) this._drawReyJavi(ctx, r, e.phase, e.facing);
    else if (kind === 'slime') this._drawSlime(ctx, r, e.color);
    else if (kind === 'yeti') this._drawYeti(ctx, r, e.color);
    else if (kind === 'ghost') this._drawGhost(ctx, r, e.color);
    else if (kind === 'dragon') this._drawDragon(ctx, r, e.color, e.boss);
    else if (kind === 'alien') this._drawAlien(ctx, r, e.color);
    else if (kind === 'golem') this._drawGolem(ctx, r, e.color);
    else this._drawSlime(ctx, r, e.color);

    if (e.boss) {
      ctx.strokeStyle = e.phase >= 2 ? '#ff4400' : e.phase >= 1 ? '#ffaa00' : '#ffd700';
      ctx.lineWidth = e.phase >= 1 ? 3 : 2;
      ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-8, -r - 10, 16, 4);
      ctx.fillRect(-6, -r - 14, 3, 5); ctx.fillRect(0, -r - 16, 3, 7); ctx.fillRect(4, -r - 14, 3, 5);
    }

    ctx.restore();
    ctx.globalAlpha = 1;

    this.drawHpBar(ctx, x, y + r + 8, r * 2.2, e.hp / e.maxHp, e.boss);
    if (e.boss) {
      ctx.font = 'bold 9px Nunito,sans-serif';
      ctx.fillStyle = e.phase >= 2 ? '#ff6644' : '#ffd700';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      const label = isReyJavi
        ? (e.phase >= 2 ? `☠️ ${e.name} (modo fabes)` : e.phase >= 1 ? `💨 ${e.name} (ups…)` : `${e.name} 👑`)
        : (e.phase >= 2 ? `⚡ ${e.name}` : e.phase >= 1 ? `🔥 ${e.name}` : e.name);
      ctx.strokeText(label, x, y - r - 12);
      ctx.fillText(label, x, y - r - 12);
    }
  },

  _drawReyJavi(ctx, r, phase, facing = 0) {
    const t = this.time;
    const flip = Math.cos(facing ?? 0) < 0 ? -1 : 1;
    ctx.scale(flip, 1);

    // Capa real
    const cape = ctx.createLinearGradient(-14, -6, 14, 16);
    cape.addColorStop(0, '#6b1a4a'); cape.addColorStop(1, '#3a0a28');
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-12, -4); ctx.lineTo(12, -4);
    ctx.quadraticCurveTo(16 + Math.sin(t / 180) * 2, 6, 10, 16);
    ctx.lineTo(-10, 16);
    ctx.quadraticCurveTo(-16 - Math.sin(t / 180) * 2, 6, -12, -4);
    ctx.fill();

    // Piernas
    ctx.fillStyle = '#2a2030';
    ctx.fillRect(-7, 8, 6, 10);
    ctx.fillRect(2, 8, 6, 10);
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(-8, 16, 7, 4);
    ctx.fillRect(1, 16, 7, 4);

    // Túnica real
    const robe = ctx.createLinearGradient(-12, -10, 12, 12);
    robe.addColorStop(0, '#9b3a6b'); robe.addColorStop(1, '#5a2040');
    ctx.fillStyle = robe;
    ctx.fillRect(-12, -6, 24, 18);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-12, 2, 24, 3);

    // Brazos (posición de pedo)
    const fartPulse = phase >= 1 ? Math.sin(t / 90) * 2 : 0;
    ctx.fillStyle = '#c9a078';
    ctx.fillRect(-16, 0 + fartPulse, 5, 10);
    ctx.fillRect(11, -2 - fartPulse, 5, 10);

    // Cabeza
    const skin = ctx.createRadialGradient(-2, -18, 2, 0, -16, 11);
    skin.addColorStop(0, '#ffe0c0'); skin.addColorStop(1, '#c9a078');
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(0, -16, 11, 0, Math.PI * 2); ctx.fill();

    // Corona
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-12, -28, 24, 5);
    ctx.fillRect(-9, -34, 4, 7); ctx.fillRect(-2, -36, 4, 9); ctx.fillRect(6, -34, 4, 7);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-1, -32, 3, 3);

    // Cara (mejillas infladas al pedirse uno)
    const cheekPuff = 1 + Math.sin(t / 110) * 0.15 + (phase >= 1 ? 0.2 : 0);
    ctx.fillStyle = '#ffb8a0';
    ctx.beginPath(); ctx.arc(-8, -14, 4 * cheekPuff, 0, Math.PI * 2); ctx.arc(8, -14, 4 * cheekPuff, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-6, -18, 4, 3); ctx.fillRect(3, -18, 4, 3);
    ctx.fillStyle = phase >= 2 ? '#ff4444' : '#cc6644';
    ctx.beginPath(); ctx.arc(0, -12, 3 + (phase >= 1 ? 1.5 : 0), 0, Math.PI); ctx.fill();
    // Sudor de nervios
    if (phase >= 1) {
      ctx.fillStyle = 'rgba(100,180,255,0.8)';
      ctx.beginPath(); ctx.ellipse(10, -20, 2, 3, 0.4, 0, Math.PI * 2); ctx.fill();
    }

    // Piernas temblorosas en fase 2
    if (phase >= 2) {
      const tremble = Math.sin(t / 40) * 1.5;
      ctx.fillStyle = '#2a2030';
      ctx.fillRect(-7 + tremble, 8, 6, 10);
      ctx.fillRect(2 - tremble, 8, 6, 10);
    }

    // Nube de pedo activa
    const wobble = Math.sin(t / 70) * 3;
    if (phase >= 0) {
      const alpha = 0.35 + Math.sin(t / 100) * 0.15;
      ctx.fillStyle = `rgba(120,180,70,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(-18 * flip, 6 + wobble, 10 + phase * 3, 7 + phase * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(90,140,50,${alpha * 0.7})`;
      ctx.beginPath();
      ctx.ellipse(-24 * flip, 10 + wobble, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (phase >= 2) {
        ctx.fillStyle = `rgba(180,120,40,${alpha * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(-30 * flip, 12 + wobble, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.font = 'bold 9px Nunito,sans-serif';
    ctx.textAlign = 'center';
    const sfx = phase >= 2 ? 'BRRRRT!' : phase >= 1 ? 'PUM!' : 'puf…';
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    ctx.strokeText(sfx, -20 * flip, -2 + wobble);
    ctx.fillStyle = '#c8f090';
    ctx.fillText(sfx, -20 * flip, -2 + wobble);
    if (phase >= 2) ctx.fillText('💨☠️', -28 * flip, 8 + wobble);
    else ctx.fillText('💨', -22 * flip, 4 + wobble);
  },

  drawBubble(ctx, x, y, text, life, maxLife) {
    const alpha = Math.min(1, life / maxLife);
    const pad = 6;
    ctx.font = 'bold 10px Nunito,sans-serif';
    const tw = ctx.measureText(text).width;
    const bw = tw + pad * 2, bh = 22;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.fillRect(x - bw / 2, y - bh, bw, bh);
    ctx.strokeRect(x - bw / 2, y - bh, bw, bh);
    ctx.beginPath();
    ctx.moveTo(x - 4, y); ctx.lineTo(x, y + 6); ctx.lineTo(x + 4, y);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y - bh / 2);
    ctx.restore();
  },

  drawFartCloud(ctx, x, y, radius, life, label = 'PUM!') {
    const alpha = Math.min(0.65, (life / 90) * 0.55 + 0.15);
    const wobble = Math.sin(this.time / 80 + x) * 2;
    const grad = ctx.createRadialGradient(x, y + wobble, 2, x, y + wobble, radius);
    grad.addColorStop(0, `rgba(160,210,90,${alpha})`);
    grad.addColorStop(0.45, `rgba(100,160,60,${alpha * 0.75})`);
    grad.addColorStop(0.8, `rgba(80,120,40,${alpha * 0.35})`);
    grad.addColorStop(1, 'rgba(60,90,30,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y + wobble, radius, radius * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${Math.min(radius * 0.55, 14)}px Nunito,sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = alpha * 0.95;
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.strokeText(label, x, y + wobble - radius * 0.15);
    ctx.fillStyle = '#fff';
    ctx.fillText(label, x, y + wobble - radius * 0.15);
    ctx.font = `${Math.min(radius * 0.85, 20)}px serif`;
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillText('💨', x, y + wobble + radius * 0.2);
    ctx.globalAlpha = 1;
  },

  _drawGranCacas(ctx, r, phase) {
    const scale = 1.1 + phase * 0.15;
    ctx.scale(scale, scale);
    // Cuerpo masivo
    ctx.fillStyle = phase >= 2 ? '#6b2f0a' : '#8b4513';
    ctx.beginPath(); ctx.ellipse(0, 4, r, r * 0.9, 0, 0, Math.PI * 2); ctx.fill();
    // Corona
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-10, -r - 4, 20, 5);
    ctx.fillRect(-7, -r - 10, 4, 7); ctx.fillRect(-1, -r - 12, 4, 9); ctx.fillRect(5, -r - 10, 4, 7);
    // Ojos furiosos
    ctx.fillStyle = phase >= 1 ? '#ff0000' : '#ff0';
    ctx.beginPath(); ctx.arc(-7, -2, 5, 0, Math.PI * 2); ctx.arc(7, -2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect(-9, -3, 4, 3); ctx.fillRect(5, -3, 4, 3);
    // Aliento de fuego en fase 2
    if (phase >= 2) {
      ctx.fillStyle = `rgba(255,${80 + Math.sin(this.time / 80) * 60},0,0.75)`;
      ctx.beginPath(); ctx.moveTo(-6, r * 0.6); ctx.lineTo(0, r + 14); ctx.lineTo(6, r * 0.6); ctx.fill();
    }
  },

  drawProjectile(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a2508';
    ctx.beginPath(); ctx.arc(x - 2, y - 2, radius * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `${radius * 1.4}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('💩', x, y);
  },

  drawSlamWave(ctx, x, y, radius, life) {
    const alpha = (life / 24) * 0.55;
    ctx.strokeStyle = `rgba(255,100,0,${alpha})`;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,200,50,${alpha * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2); ctx.stroke();
  },

  _enemyKind(e) {
    const n = (e.name || '').toLowerCase();
    if (n.includes('slime') || n.includes('pantan')) return 'slime';
    if (n.includes('yeti')) return 'yeti';
    if (n.includes('fantasma') || n.includes('espectro')) return 'ghost';
    if (n.includes('drag') || n.includes('salamandra') || n.includes('ígneo')) return 'dragon';
    if (n.includes('alien') || n.includes('cósmic') || n.includes('entidad')) return 'alien';
    if (n.includes('gólem') || n.includes('golem') || n.includes('guardián') || n.includes('ent')) return 'golem';
    return 'slime';
  },

  _drawSlime(ctx, r, color) {
    const body = ctx.createRadialGradient(-r * 0.2, -r * 0.3, 2, 0, 2, r);
    body.addColorStop(0, color);
    body.addColorStop(0.65, color);
    body.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, 2, r, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.25, r * 0.3, r * 0.14, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.ellipse(r * 0.15, r * 0.1, r * 0.15, r * 0.08, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-4, -2, 3.5, 0, Math.PI * 2); ctx.arc(5, -2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(-4, -1.5, 1.8, 0, Math.PI * 2); ctx.arc(5, -1.5, 1.8, 0, Math.PI * 2); ctx.fill();
  },

  _drawYeti(ctx, r, color) {
    ctx.fillStyle = color;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-r + 2, -r + 2, r * 2 - 4, r - 2);
    ctx.fillStyle = '#333';
    ctx.fillRect(-6, -4, 4, 4); ctx.fillRect(3, -4, 4, 4);
    ctx.fillStyle = '#5dade2';
    ctx.fillRect(-8, -r - 2, 16, 6);
  },

  _drawGhost(ctx, r, color) {
    ctx.globalAlpha *= 0.75;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -2, r, Math.PI, 0);
    ctx.lineTo(r, r);
    for (let i = 3; i >= 0; i--) ctx.lineTo((i * 2 - 3) * 3, r - (i % 2 ? 3 : 0));
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-5, -2, 4, 0, Math.PI * 2); ctx.arc(5, -2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(-5, -2, 2, 0, Math.PI * 2); ctx.arc(5, -2, 2, 0, Math.PI * 2); ctx.fill();
  },

  _drawDragon(ctx, r, color, big) {
    const s = big ? 1.3 : 1;
    ctx.scale(s, s);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    // Alas
    ctx.fillStyle = color;
    ctx.globalAlpha *= 0.8;
    ctx.beginPath(); ctx.moveTo(-r, -4); ctx.lineTo(-r - 12, -14); ctx.lineTo(-r + 4, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(r, -4); ctx.lineTo(r + 12, -14); ctx.lineTo(r - 4, 0); ctx.fill();
    ctx.globalAlpha = 1;
    // Fuego boca
    if (big) {
      ctx.fillStyle = `rgba(255,${100 + Math.sin(this.time / 100) * 50},0,0.7)`;
      ctx.beginPath(); ctx.moveTo(0, r * 0.5); ctx.lineTo(-4, r + 8); ctx.lineTo(4, r + 8); ctx.fill();
    }
    ctx.fillStyle = '#ff0';
    ctx.fillRect(-6, -4, 3, 3); ctx.fillRect(4, -4, 3, 3);
    ctx.fillStyle = '#000';
    ctx.fillRect(-5, -3, 2, 2); ctx.fillRect(5, -3, 2, 2);
  },

  _drawAlien(ctx, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 4, r * 0.7, r, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, -6, r * 0.55, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f0';
    ctx.beginPath(); ctx.ellipse(-5, -8, 5, 7, -0.3, 0, Math.PI * 2); ctx.ellipse(5, -8, 5, 7, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(-5, -8, 2, 4, -0.3, 0, Math.PI * 2); ctx.ellipse(5, -8, 2, 4, 0.3, 0, Math.PI * 2); ctx.fill();
  },

  _drawGolem(ctx, r, color) {
    const stone = ctx.createLinearGradient(-r, -r, r, r);
    stone.addColorStop(0, color);
    stone.addColorStop(0.5, color);
    stone.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = stone;
    ctx.fillRect(-r, -r + 2, r * 2, r * 2 - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(-r + 2, -r + 4, 5, r);
    ctx.fillStyle = '#444';
    ctx.fillRect(-r + 3, -r + 5, r * 2 - 6, 4);
    ctx.fillRect(-r + 3, 2, r * 2 - 6, 4);
    ctx.fillStyle = '#f5b041';
    ctx.fillRect(-5, -6, 10, 6);
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowColor = 'rgba(255,80,60,0.6)'; ctx.shadowBlur = 4;
    ctx.fillRect(-3, -4, 2, 2); ctx.fillRect(2, -4, 2, 2);
    ctx.shadowBlur = 0;
  },

  drawHpBar(ctx, x, y, w, pct, boss) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(x - w / 2 - 2, y - 2, w + 4, 8);
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(x - w / 2, y, w, 5);
    const grad = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
    grad.addColorStop(0, boss ? '#a07010' : '#a02020');
    grad.addColorStop(0.5, boss ? '#ffd700' : '#e74c3c');
    grad.addColorStop(1, boss ? '#ffe680' : '#ff6b6b');
    ctx.fillStyle = grad;
    ctx.fillRect(x - w / 2, y, w * Math.max(0, pct), 5);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x - w / 2, y, w * Math.max(0, pct), 2);
  },

  _drawCacaShape(ctx, x, y, accent) {
    const grad = ctx.createLinearGradient(x, y - 14, x, y + 8);
    grad.addColorStop(0, '#c49a6c');
    grad.addColorStop(0.45, '#8b5a2b');
    grad.addColorStop(1, '#4a3018');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y + 5, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y - 1, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y - 7, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y - 12, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.ellipse(x - 3, y - 3, 2.5, 5, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x, y - 15, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
  },

  drawRelic(ctx, x, y, relic, near) {
    const t = this.time;
    const bob = Math.sin(t / 350 + relic.id * 1.5) * 4;
    const cy = y + bob;
    const hues = ['#ffd700','#74b9ff','#ff9f43','#ff6b9d','#a29bfe','#81ecec','#fdcb6e'];
    const hue = hues[relic.id] || '#ffd700';

    this.drawShadow(ctx, x, y + 6, 14);
    const grad = ctx.createRadialGradient(x, cy, 2, x, cy, 28);
    grad.addColorStop(0, hue + 'cc');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, cy, 28, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = hue;
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(relic.emoji || '⭐', x, cy);

    if (near) {
      ctx.font = 'bold 10px Nunito,sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
      ctx.strokeText('[Espacio]', x, cy - 28);
      ctx.fillText('[Espacio]', x, cy - 28);
    }
  },

  drawCaca(ctx, x, y, caca, near) {
    const t = this.time;
    const bob = Math.sin(t / 350 + caca.id * 1.5) * 4;
    const cy = y + bob;
    const hues = ['#ff6b6b','#74b9ff','#ffd700','#a29bfe','#ff7675','#6c5ce7','#fdcb6e'];
    const hue = hues[caca.id] || '#ffd700';

    this.drawShadow(ctx, x, y + 6, 14);

    // Pedestal de piedra 3D
    ctx.fillStyle = '#3a3028';
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 14); ctx.lineTo(x + 14, y + 14);
    ctx.lineTo(x + 12, y + 8); ctx.lineTo(x - 12, y + 8); ctx.closePath(); ctx.fill();
    const ped = ctx.createLinearGradient(x - 12, y, x + 12, y + 8);
    ped.addColorStop(0, '#a08868'); ped.addColorStop(1, '#5a4a38');
    ctx.fillStyle = ped;
    ctx.fillRect(x - 12, y + 2, 24, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x - 10, y + 3, 8, 5);
    const gold = ctx.createLinearGradient(x - 8, y, x + 8, y + 4);
    gold.addColorStop(0, '#fff0a0'); gold.addColorStop(1, '#b8860b');
    ctx.fillStyle = gold;
    ctx.fillRect(x - 9, y, 18, 4);

    // Aura dorada (reliquia sagrada, no nube de pedo)
    const grad = ctx.createRadialGradient(x, cy, 2, x, cy, 30);
    grad.addColorStop(0, hue + 'aa');
    grad.addColorStop(0.5, hue + '44');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, cy, 30, 0, Math.PI * 2); ctx.fill();

    for (let i = 0; i < 4; i++) {
      const ang = t / 700 + i * Math.PI / 2;
      const dist = 18 + Math.sin(t / 450 + i) * 2;
      ctx.fillStyle = hue;
      ctx.globalAlpha = 0.5 + Math.sin(t / 320 + i) * 0.15;
      ctx.fillRect(x + Math.cos(ang) * dist - 1.5, cy + Math.sin(ang) * dist * 0.4 - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;

    this._drawCacaShape(ctx, x, cy + 2, hue);

    ctx.font = '18px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 4;
    ctx.fillText(caca.emoji || '💩', x, cy - 22);
    ctx.shadowBlur = 0;

    if (near) {
      ctx.font = 'bold 10px Nunito,sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
      ctx.strokeText('[Espacio]', x, cy - 34);
      ctx.fillText('[Espacio]', x, cy - 34);
    }
  },

  drawNPC(ctx, x, y) {
    const bob = Math.sin(this.time / 400) * 2;
    this.drawShadow(ctx, x, y, 12);
    ctx.save();
    ctx.translate(x, y + bob);

    const robe = ctx.createLinearGradient(-12, -18, 12, 14);
    robe.addColorStop(0, '#9b59b6'); robe.addColorStop(1, '#4a235a');
    ctx.fillStyle = robe;
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(-12, 14); ctx.lineTo(12, 14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(-8, -2, 4, 12);
    ctx.fillStyle = '#7d3c98'; ctx.fillRect(-10, -4, 20, 16);

    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(0, 10); ctx.lineTo(6, -6); ctx.fill();
    const face = ctx.createRadialGradient(-2, -14, 1, 0, -12, 9);
    face.addColorStop(0, '#ffe8cc'); face.addColorStop(1, '#c9a078');
    ctx.fillStyle = face;
    ctx.beginPath(); ctx.arc(0, -12, 8, 0, Math.PI * 2); ctx.fill();

    // Sombrero
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-10, -22, 20, 4);
    ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(0, -30); ctx.lineTo(6, -22); ctx.fill();

    // Bastón
    ctx.fillStyle = '#8b6914'; ctx.fillRect(12, -8, 3, 22);
    ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(13, -10, 5, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  },

  drawHeal(ctx, x, y) {
    const bob = Math.sin(this.time / 350) * 3;
    const pulse = 0.5 + Math.sin(this.time / 200) * 0.3;
    const cy = y - 12 + bob;
    this.drawShadow(ctx, x, cy + 8, 8);
    const glow = ctx.createRadialGradient(x, cy, 2, x, cy, 18);
    glow.addColorStop(0, `rgba(80,255,140,${pulse * 0.45})`);
    glow.addColorStop(1, 'rgba(46,204,113,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, cy, 18, 0, Math.PI * 2); ctx.fill();

    ctx.font = '22px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(46,204,113,0.6)'; ctx.shadowBlur = 8;
    ctx.fillText('💚', x, cy);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#2ecc71';
    ctx.font = '8px Nunito,sans-serif';
    ctx.fillText('+HP', x, cy + 14);
  },

  drawGameBanner(ctx, w, banner) {
    const age = banner.maxLife - banner.life;
    const alpha = Math.min(1, age / 12, banner.life / 18) * 0.92;
    if (alpha <= 0.02) return;

    const padX = 16, padY = 10;
    ctx.font = 'bold 12px Nunito,sans-serif';
    const titleW = ctx.measureText(banner.title).width;
    ctx.font = '11px Nunito,sans-serif';
    const lines = banner.text.match(/.{1,52}(\s|$)/g) || [banner.text];
    const textW = Math.max(...lines.map(l => ctx.measureText(l.trim()).width), 0);
    const boxW = Math.min(w - 24, Math.max(titleW, textW) + padX * 2);
    const boxH = 28 + lines.length * 14 + padY;
    const bx = (w - boxW) / 2;
    const by = 12;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(12,18,32,0.88)';
    ctx.strokeStyle = banner.urgent ? '#ff6644' : '#ffd700';
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = banner.urgent ? '#ff8866' : '#ffe566';
    ctx.font = 'bold 12px Nunito,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(banner.title, w / 2, by + padY);

    ctx.fillStyle = '#f0e6d3';
    ctx.font = '11px Nunito,sans-serif';
    lines.forEach((line, i) => ctx.fillText(line.trim(), w / 2, by + padY + 18 + i * 14));
    ctx.restore();
  },

  drawKeyDrop(ctx, x, y, near) {
    const bob = Math.sin(this.time / 300) * 4;
    const spin = Math.sin(this.time / 500) * 0.25;
    const pulse = 0.45 + Math.sin(this.time / 220) * 0.25;
    const cy = y + bob;

    this.drawShadow(ctx, x, cy + 4, 10);

    const glow = ctx.createRadialGradient(x, cy, 2, x, cy, 20);
    glow.addColorStop(0, `rgba(255,220,80,${pulse * 0.5})`);
    glow.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, cy, 20, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.translate(x, cy);
    ctx.rotate(spin);
    const keyGrad = ctx.createLinearGradient(-8, -6, 8, 8);
    keyGrad.addColorStop(0, '#fff4b0'); keyGrad.addColorStop(0.5, '#ffd700'); keyGrad.addColorStop(1, '#9a7209');
    ctx.fillStyle = keyGrad;
    ctx.beginPath(); ctx.arc(-4, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6b5010';
    ctx.beginPath(); ctx.arc(-4, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = keyGrad;
    ctx.fillRect(-2, -2, 14, 4);
    ctx.fillRect(8, -2, 3, 4);
    ctx.fillRect(10, 2, 2, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(-6, -4, 4, 2);
    ctx.restore();

    ctx.fillStyle = '#ffeaa7';
    ctx.font = '8px Nunito,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Llave', x, cy + 18);

    if (near) {
      ctx.font = 'bold 10px Nunito,sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
      ctx.strokeText('[Espacio]', x, cy - 24);
      ctx.fillText('[Espacio]', x, cy - 24);
    }
  },

  drawSlash(ctx, x, y, angle, life, maxLife) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const alpha = life / maxLife;
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 32, -1, 1); ctx.stroke();
    ctx.strokeStyle = `rgba(255,220,100,${alpha * 0.6})`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 26, -0.8, 0.8); ctx.stroke();
    ctx.restore();
  },

  drawParticle(ctx, pt) {
    ctx.save();
    const alpha = pt.life / pt.maxLife;
    ctx.globalAlpha = alpha;
    if (pt.star) {
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = pt.size * 1.5;
      ctx.fillStyle = pt.color;
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.life * 0.2);
      ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
      ctx.shadowBlur = 0;
    } else {
      const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size);
      g.addColorStop(0, pt.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  },

  drawMinimap(ctx, w, playerX, playerY, cacas, collected) {
    const mw = 90, scale = mw / w.cols, mh = w.rows * scale;
    const mx = ctx.canvas.width - mw - 10, my = 10;

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(mx - 4, my - 4, mw + 8, mh + 20);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.strokeRect(mx - 4, my - 4, mw + 8, mh + 20);

    ctx.font = '8px Nunito,sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText(w.name.substring(0, 14), mx + mw / 2, my + mh + 12);

    for (let row = 0; row < w.rows; row++)
      for (let col = 0; col < w.cols; col++) {
        const tile = w.map[row][col];
        const colors = TILE_COLORS[tile] || TILE_COLORS[0];
        ctx.fillStyle = colors[0];
        ctx.fillRect(mx + col * scale, my + row * scale, Math.ceil(scale), Math.ceil(scale));
      }

    for (const c of cacas) {
      if (collected.has(c.id)) continue;
      if (c.requires?.length && !c.requires.every(r => collected.has(r))) continue;
      ctx.fillStyle = '#8b5a2b';
      ctx.beginPath();
      ctx.arc(mx + c.x * scale + scale / 2, my + c.y * scale + scale / 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(mx + (playerX / Gfx.tileSize) * scale, my + (playerY / Gfx.tileSize) * scale, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
  },

  drawVignette(ctx, w, h) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.92);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.75, 'rgba(10,15,25,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0.48)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    const warm = ctx.createRadialGradient(w * 0.3, h * 0.2, 10, w * 0.3, h * 0.2, w * 0.6);
    warm.addColorStop(0, 'rgba(255,220,160,0.04)');
    warm.addColorStop(1, 'transparent');
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, w, h);
  },

  drawPortalLabel(ctx, x, y, text, locked) {
    ctx.font = 'bold 9px Nunito,sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = locked ? '#e74c3c' : '#dda0ff';
    ctx.fillText(text, x, y);
  },
};
