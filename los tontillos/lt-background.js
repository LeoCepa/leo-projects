/** Fondos estilo Looney Tunes — cielo pintado, colinas, parque clásico */
const LT_INK = "#000000";

function ltStroke(ctx, w = 3) {
  ctx.strokeStyle = LT_INK;
  ctx.lineWidth = w;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}

function drawLooneyPark(ctx, w, h, t, grassMouth) {
  // Cielo degradado acuarela
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.58);
  sky.addColorStop(0, "#7ec8ff");
  sky.addColorStop(0.45, "#b8e4ff");
  sky.addColorStop(1, "#fff8dc");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Colinas lejanas (estilo fondo pintado WB)
  const hills = [
    { c: "#c9a0dc", y: 0.48, a: 0.35 },
    { c: "#a8d5a2", y: 0.52, a: 0.42 },
    { c: "#f4c97a", y: 0.56, a: 0.38 },
  ];
  hills.forEach((hill, i) => {
    ctx.fillStyle = hill.c;
    ctx.beginPath();
    ctx.moveTo(0, h * hill.y);
    for (let x = 0; x <= w; x += w / 8) {
      const y =
        h * hill.y +
        Math.sin(x * 0.012 + i * 1.5) * h * hill.a * 0.25 +
        Math.cos(x * 0.006) * h * 0.04;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ltStroke(ctx, 2.5);
    ctx.stroke();
  });

  // Sol estilo cartoon
  const sunX = w * 0.88;
  const sunY = h * 0.11;
  ctx.fillStyle = "#ffe135";
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + t * 0.15;
    const r = i % 2 === 0 ? h * 0.075 : h * 0.055;
    const px = sunX + Math.cos(a) * r;
    const py = sunY + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ltStroke(ctx, 3);
  ctx.stroke();
  ctx.fillStyle = "#fff176";
  ctx.beginPath();
  ctx.arc(sunX, sunY, h * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ltStroke(ctx, 2);
  ctx.stroke();

  // Nubes grandes con contorno negro
  drawLTCloud(ctx, w * 0.18, h * 0.1, h * 0.07, t, 0);
  drawLTCloud(ctx, w * 0.55, h * 0.07, h * 0.09, t, 1.2);
  drawLTCloud(ctx, w * 0.78, h * 0.18, h * 0.055, t, 2.5);

  // Césped
  const grassTop = h * 0.58;
  ctx.fillStyle = grassMouth ? "#5cb838" : "#72d54c";
  ctx.fillRect(0, grassTop, w, h - grassTop);

  // Rayas césped
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 18; i++) {
    const gx = (w / 18) * i;
    ctx.beginPath();
    ctx.moveTo(gx, grassTop);
    ctx.lineTo(gx + 8, h);
    ctx.stroke();
  }
  ltStroke(ctx, 3);
  ctx.beginPath();
  ctx.moveTo(0, grassTop);
  ctx.lineTo(w, grassTop);
  ctx.stroke();

  if (grassMouth) {
    const mouthY = h * 0.74;
    ctx.fillStyle = "#3d8b24";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, mouthY, w * 0.28, h * 0.07 + Math.sin(t * 7) * 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ltStroke(ctx, 4);
    ctx.stroke();
    ctx.fillStyle = "#ff1744";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, mouthY + 4, w * 0.2, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 8; i++) {
      const tx = w * 0.36 + i * w * 0.032;
      ctx.fillRect(tx, mouthY - h * 0.055, w * 0.014, h * 0.045);
    }
  }

  // Árbol redondo estilo LT
  drawLTTree(ctx, w * 0.82, grassTop, h * 0.28);

  // Banco de madera exagerado
  drawLTBench(ctx, w * 0.48, grassTop + h * 0.04, w * 0.38, h);

  // Bolsa chuches
  drawLTCandyBag(ctx, w * 0.64, grassTop + h * 0.02, h * 0.14, t);

  // Señal estilo ACME (guiño Warner)
  drawLTSign(ctx, w * 0.08, grassTop - h * 0.02, h * 0.12);
}

function drawLTCloud(ctx, x, y, r, t, off) {
  const drift = Math.sin(t * 0.4 + off) * 6;
  ctx.save();
  ctx.translate(x + drift, y);
  ctx.fillStyle = "#ffffff";
  [[0, 0, 1], [-0.9, 0.15, 0.75], [0.85, 0.1, 0.8], [-0.4, -0.35, 0.65], [0.5, -0.3, 0.7]].forEach(
    ([dx, dy, sc]) => {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * sc, 0, Math.PI * 2);
      ctx.fill();
    }
  );
  ltStroke(ctx, 3);
  [[0, 0, 1], [-0.9, 0.15, 0.75], [0.85, 0.1, 0.8]].forEach(([dx, dy, sc]) => {
    ctx.beginPath();
    ctx.arc(dx * r, dy * r, r * sc, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawLTTree(ctx, x, baseY, treeH) {
  ctx.fillStyle = "#6d3b12";
  ctx.fillRect(x - 12, baseY - treeH * 0.35, 24, treeH * 0.35);
  ltStroke(ctx, 3);
  ctx.strokeRect(x - 12, baseY - treeH * 0.35, 24, treeH * 0.35);

  ctx.fillStyle = "#2e9334";
  ctx.beginPath();
  ctx.arc(x, baseY - treeH * 0.42, treeH * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#45b84a";
  ctx.beginPath();
  ctx.arc(x - treeH * 0.12, baseY - treeH * 0.52, treeH * 0.16, 0, Math.PI * 2);
  ctx.arc(x + treeH * 0.14, baseY - treeH * 0.48, treeH * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ltStroke(ctx, 3);
  ctx.beginPath();
  ctx.arc(x, baseY - treeH * 0.42, treeH * 0.22, 0, Math.PI * 2);
  ctx.stroke();
}

function drawLTBench(ctx, cx, y, bw, h) {
  ctx.fillStyle = "#a0522d";
  ctx.fillRect(cx - bw / 2, y, bw, h * 0.035);
  ctx.fillRect(cx - bw / 2 + 8, y + h * 0.035, h * 0.022, h * 0.1);
  ctx.fillRect(cx + bw / 2 - 8 - h * 0.022, y + h * 0.035, h * 0.022, h * 0.1);
  ltStroke(ctx, 3);
  ctx.strokeRect(cx - bw / 2, y, bw, h * 0.035);
}

function drawLTCandyBag(ctx, x, y, size, t) {
  const wobble = Math.sin(t * 3) * 3;
  ctx.save();
  ctx.translate(x + wobble, y);
  ctx.fillStyle = "#ff2d55";
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, 0);
  ctx.lineTo(size * 0.45, 0);
  ctx.lineTo(size * 0.38, size * 0.75);
  ctx.lineTo(-size * 0.38, size * 0.75);
  ctx.closePath();
  ctx.fill();
  ltStroke(ctx, 3);
  ctx.stroke();
  // Chuches de colores
  ["#ffe135", "#9b5de5", "#06ffa5", "#ff6b35", "#4cc9f0"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(-size * 0.2 + i * size * 0.1, size * 0.35 + (i % 2) * size * 0.12, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ltStroke(ctx, 2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawLTSign(ctx, x, y, h) {
  ctx.fillStyle = "#fff9c4";
  ctx.fillRect(x, y - h, h * 1.6, h * 0.55);
  ltStroke(ctx, 3);
  ctx.strokeRect(x, y - h, h * 1.6, h * 0.55);
  ctx.fillStyle = LT_INK;
  ctx.font = `bold ${h * 0.22}px Georgia, serif`;
  ctx.fillText("PARQUE", x + h * 0.12, y - h * 0.58);
  ctx.fillRect(x + h * 0.7, y - h * 0.15, h * 0.08, h * 0.15);
}

/** Efectos cartoon: estrellas, polvo, rayo */
function drawCartoonFX(ctx, w, h, fx, t) {
  if (!fx) return;
  if (fx.type === "stars") {
    for (let i = 0; i < 5; i++) {
      const sx = fx.x + Math.cos(t * 4 + i) * 30;
      const sy = fx.y + Math.sin(t * 5 + i * 2) * 20 - i * 15;
      drawLTStar(ctx, sx, sy, 12 + i * 3, "#ffe135");
    }
  }
  if (fx.type === "poof") {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + t * 3;
      ctx.beginPath();
      ctx.arc(fx.x + Math.cos(a) * 25, fx.y + Math.sin(a) * 15, 14, 0, Math.PI * 2);
      ctx.fill();
      ltStroke(ctx, 2);
      ctx.stroke();
    }
  }
  if (fx.type === "zap") {
    ctx.strokeStyle = "#ffe135";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(fx.x, fx.y - 40);
    ctx.lineTo(fx.x - 15, fx.y - 10);
    ctx.lineTo(fx.x + 10, fx.y - 5);
    ctx.lineTo(fx.x - 8, fx.y + 20);
    ctx.lineTo(fx.x + 18, fx.y - 25);
    ctx.stroke();
    ltStroke(ctx, 3);
    ctx.stroke();
  }
}

function drawLTStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ltStroke(ctx, 2);
  ctx.stroke();
}
