/** Estilo dibujo animado */
const CARTOON_INK = "#1a1a2e";

function cartoonLine(ctx, s) {
  ctx.strokeStyle = CARTOON_INK;
  ctx.lineWidth = Math.max(2, s * 0.09);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}

function drawWolf(ctx, x, y, size, rotation, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  const s = size;

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.42, s * 0.45, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = CARTOON_INK;
  ctx.lineWidth = Math.max(2, s * 0.1);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-s * 0.45, s * 0.1);
  ctx.quadraticCurveTo(-s * 0.75, -s * 0.05, -s * 0.55, s * 0.2);
  ctx.stroke();

  ctx.fillStyle = "#b0b0bc";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.08, s * 0.5, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  cartoonLine(ctx, s);
  ctx.stroke();

  ctx.fillStyle = "#d8d8e4";
  ctx.beginPath();
  ctx.ellipse(s * 0.1, s * 0.12, s * 0.2, s * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = CARTOON_INK;
  ctx.fillRect(-s * 0.15, s * 0.18, s * 0.1, s * 0.22);
  ctx.fillRect(-s * 0.28, s * 0.16, s * 0.09, s * 0.2);
  ctx.fillRect(s * 0.15, s * 0.2, s * 0.09, s * 0.18);
  ctx.fillRect(s * 0.28, s * 0.18, s * 0.08, s * 0.16);

  ctx.fillStyle = "#b0b0bc";
  ctx.beginPath();
  ctx.arc(s * 0.38, -s * 0.06, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  cartoonLine(ctx, s);
  ctx.stroke();

  ctx.fillStyle = "#fce4ec";
  [[0.28, -0.2, 0.22, -0.45, 0.4, -0.28], [0.48, -0.18, 0.52, -0.4, 0.58, -0.16]].forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath();
    ctx.moveTo(s * x1, s * y1);
    ctx.lineTo(s * x2, s * y2);
    ctx.lineTo(s * x3, s * y3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(s * 0.48, -s * 0.1, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = CARTOON_INK;
  ctx.beginPath();
  ctx.arc(s * 0.5, -s * 0.1, s * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(s * 0.52, -s * 0.13, s * 0.02, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fce4ec";
  ctx.beginPath();
  ctx.ellipse(s * 0.58, -s * 0.02, s * 0.1, s * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = CARTOON_INK;
  ctx.beginPath();
  ctx.arc(s * 0.64, -s * 0.01, s * 0.035, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCartoonPine(ctx, x, baseY, h, w) {
  const tw = Math.max(6, w * 0.14);
  const th = h * 0.25;
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(x - tw / 2, baseY - th, tw, th);
  cartoonLine(ctx, w * 0.08);
  ctx.strokeRect(x - tw / 2, baseY - th, tw, th);
  ["#3cb878", "#2ea066", "#248f58"].forEach((color, i) => {
    const ly = baseY - th - (h - th) * (i / 3);
    const lw = w * (1 - i * 0.2);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, ly - (h - th) / 3);
    ctx.lineTo(x - lw / 2, ly);
    ctx.lineTo(x + lw / 2, ly);
    ctx.closePath();
    ctx.fill();
    cartoonLine(ctx, w * 0.06);
    ctx.stroke();
  });
}

function drawCartoonOak(ctx, x, baseY, h, w) {
  const tw = Math.max(7, w * 0.16);
  const th = h * 0.35;
  ctx.fillStyle = "#a0522d";
  ctx.fillRect(x - tw / 2, baseY - th, tw, th);
  cartoonLine(ctx, w * 0.07);
  ctx.strokeRect(x - tw / 2, baseY - th, tw, th);
  const cy = baseY - th - h * 0.22;
  ["#4cd964", "#3cb878", "#2ea066"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + (i - 1) * w * 0.2, cy + i * 6, w * 0.38 - i * 0.05, 0, Math.PI * 2);
    ctx.fill();
    cartoonLine(ctx, w * 0.05);
    ctx.stroke();
  });
}

function drawCartoonCloud(ctx, x, y, scale) {
  ctx.fillStyle = "#fff";
  [[0, 0, 1], [-0.8, 0.15, 0.7], [0.9, 0.2, 0.75], [-0.3, -0.2, 0.6], [0.5, -0.15, 0.65]].forEach(([dx, dy, r]) => {
    ctx.beginPath();
    ctx.arc(x + dx * 40 * scale, y + dy * 20 * scale, 28 * scale * r, 0, Math.PI * 2);
    ctx.fill();
  });
  cartoonLine(ctx, scale * 6);
  ctx.stroke();
}

function drawCartoonRock(ctx, r) {
  ctx.fillStyle = "#9e9eaa";
  ctx.beginPath();
  ctx.ellipse(r.x, r.y, r.w / 2, r.h / 2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  cartoonLine(ctx, r.w * 0.06);
  ctx.stroke();
  ctx.fillStyle = "#c8c8d4";
  ctx.beginPath();
  ctx.ellipse(r.x - r.w * 0.12, r.y - r.h * 0.15, r.w * 0.15, r.h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

function buildForestScene(canvas, placements, seed, sceneW, sceneH, randFn) {
  const ctx = canvas.getContext("2d");
  canvas.width = sceneW;
  canvas.height = sceneH;
  const rand = randFn(seed);

  const sky = ctx.createLinearGradient(0, 0, 0, sceneH);
  sky.addColorStop(0, "#6ec5ff");
  sky.addColorStop(0.55, "#9de0ff");
  sky.addColorStop(1, "#b8f0a0");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, sceneW, sceneH);

  for (let i = 0; i < 28; i++) {
    drawCartoonCloud(ctx, rand() * sceneW, sceneH * 0.06 + rand() * sceneH * 0.18, 0.8 + rand() * 1.2);
  }

  const sunX = sceneW * 0.12;
  const sunY = sceneH * 0.1;
  ctx.fillStyle = "#ffe066";
  ctx.beginPath();
  ctx.arc(sunX, sunY, 55, 0, Math.PI * 2);
  ctx.fill();
  cartoonLine(ctx, 12);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(sunX + Math.cos(a) * 62, sunY + Math.sin(a) * 62);
    ctx.lineTo(sunX + Math.cos(a) * 82, sunY + Math.sin(a) * 82);
    ctx.stroke();
  }
  ctx.fillStyle = CARTOON_INK;
  ctx.beginPath();
  ctx.arc(sunX - 12, sunY - 8, 4, 0, Math.PI * 2);
  ctx.arc(sunX + 14, sunY - 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = CARTOON_INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sunX, sunY + 8, 18, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = "#5cb85c";
  ctx.beginPath();
  ctx.moveTo(0, sceneH * 0.42);
  for (let x = 0; x <= sceneW; x += 80) {
    ctx.lineTo(x, sceneH * 0.42 - 40 - rand() * 80);
  }
  ctx.lineTo(sceneW, sceneH * 0.55);
  ctx.lineTo(0, sceneH * 0.55);
  ctx.closePath();
  ctx.fill();
  cartoonLine(ctx, 8);
  ctx.stroke();

  ctx.fillStyle = "#72c872";
  ctx.fillRect(0, sceneH * 0.4, sceneW, sceneH * 0.6);

  for (let i = 0; i < 800; i++) {
    const gx = rand() * sceneW;
    const gy = sceneH * 0.45 + rand() * sceneH * 0.52;
    ctx.strokeStyle = rand() > 0.5 ? "#3a9e3a" : "#48b848";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + (rand() - 0.5) * 4, gy - 6 - rand() * 8);
    ctx.stroke();
  }

  const rocks = [];
  for (let i = 0; i < 70; i++) {
    rocks.push({
      x: rand() * sceneW,
      y: sceneH * 0.52 + rand() * sceneH * 0.42,
      w: 35 + rand() * 90,
      h: 22 + rand() * 50,
    });
  }
  rocks.forEach((r) => drawCartoonRock(ctx, r));

  for (let i = 0; i < 120; i++) {
    const fx = rand() * sceneW;
    const fy = sceneH * 0.55 + rand() * sceneH * 0.4;
    ctx.fillStyle = ["#ff6b9d", "#ffd93d", "#6ee7ff", "#ff9f43"][Math.floor(rand() * 4)];
    ctx.beginPath();
    ctx.arc(fx, fy, 4 + rand() * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = CARTOON_INK;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const trees = [];
  for (let i = 0; i < 220; i++) {
    trees.push({
      x: rand() * sceneW,
      y: sceneH * 0.32 + rand() * sceneH * 0.58,
      w: 45 + rand() * 100,
      h: 130 + rand() * 280,
      depth: rand(),
      pine: rand() > 0.45,
    });
  }
  trees.sort((a, b) => a.depth - b.depth);
  trees.forEach((t) => {
    ctx.globalAlpha = 0.65 + t.depth * 0.35;
    if (t.pine) drawCartoonPine(ctx, t.x, t.y, t.h, t.w);
    else drawCartoonOak(ctx, t.x, t.y, t.h, t.w);
    ctx.globalAlpha = 1;
  });

  for (let i = 0; i < 80; i++) {
    const mx = rand() * sceneW;
    const my = sceneH * 0.6 + rand() * sceneH * 0.35;
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(mx - 2, my - 6, 4, 8);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(mx, my - 10, 10 + rand() * 8, 7 + rand() * 5, 0, 0, Math.PI * 2);
    ctx.fill();
    cartoonLine(ctx, 4);
    ctx.stroke();
  }

  const pathY = (x) => sceneH * 0.72 + Math.sin(x * 0.0035) * 90;
  ctx.strokeStyle = "#c4a574";
  ctx.lineWidth = 85;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, pathY(0));
  for (let x = 0; x <= sceneW; x += 60) ctx.lineTo(x, pathY(x));
  ctx.stroke();
  cartoonLine(ctx, 10);
  ctx.stroke();

  placements.filter((w) => w.layer === "deep").forEach((w) => {
    drawWolf(ctx, w.x, w.y, w.size, w.rot, w.alpha);
  });

  for (let i = 0; i < 200; i++) {
    const lx = rand() * sceneW;
    const ly = sceneH * 0.35 + rand() * sceneH * 0.62;
    ctx.fillStyle = `rgba(${60 + rand() * 80}, ${120 + rand() * 60}, ${40 + rand() * 40}, 0.2)`;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 6 + rand() * 10, 3 + rand() * 5, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  placements.filter((w) => w.layer !== "deep").forEach((w) => {
    drawWolf(ctx, w.x, w.y, w.size, w.rot, w.alpha);
  });

  return placements.map(({ id, x, y, r }) => ({ id, x, y, r }));
}
