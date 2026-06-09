/** Personajes Los Tontillos — estilo Looney Tunes clásico */
const INK = "#000000";

function ink(ctx, s, w) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = w ?? Math.max(3, s * 0.1);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}

function fillStroke(ctx, s) {
  ink(ctx, s);
  ctx.stroke();
}

function ltShadow(ctx, s, yOff = 0.44) {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, s * yOff, s * 0.38, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Ojos grandes estilo Looney Tunes */
function ltEyes(ctx, s, t, talking, mood = "normal") {
  const blink = Math.sin(t * 0.7) > 0.97;
  const eyeH = blink ? s * 0.008 : s * 0.11;
  const pupils = talking ? Math.sin(t * 12) * s * 0.015 : 0;

  [[-s * 0.11, -s * 0.28], [s * 0.11, -s * 0.28]].forEach(([ex, ey]) => {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(ex, ey, s * 0.1, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();
    ink(ctx, s, Math.max(3, s * 0.09));
    ctx.stroke();

    if (!blink) {
      ctx.fillStyle = INK;
      const pr = mood === "shocked" ? s * 0.045 : s * 0.035;
      ctx.beginPath();
      ctx.arc(ex + pupils, ey + (mood === "shocked" ? -s * 0.02 : 0), pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ex + s * 0.025 + pupils, ey - s * 0.025, s * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Boca exagerada cartoon */
function ltMouth(ctx, s, t, talking, y, wide = false) {
  if (talking) {
    const open = s * (0.04 + Math.abs(Math.sin(t * 18)) * (wide ? 0.07 : 0.05));
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(0, y, s * (wide ? 0.1 : 0.07), open, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff6b8a";
    ctx.beginPath();
    ctx.ellipse(0, y + open * 0.3, s * 0.05, open * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(2.5, s * 0.07);
    ctx.beginPath();
    ctx.arc(0, y, s * 0.05, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }
}

function squashStretch(ctx, s, t, talking) {
  const sy = talking ? 1 + Math.sin(t * 14) * 0.06 : 1;
  const sx = talking ? 1 - Math.sin(t * 14) * 0.04 : 1;
  ctx.scale(sx, sy);
}

/** Pavo marilondo — gallo/turkey pomposo estilo Foghorn */
function drawPavoMarilondo(ctx, s, t, talking) {
  const bob = talking ? Math.sin(t * 12) * s * 0.02 : Math.sin(t * 2) * s * 0.008;
  ctx.save();
  ctx.translate(0, bob);
  squashStretch(ctx, s, t, talking);
  ltShadow(ctx, s);

  // Cola abanico enorme
  ["#1a8c4a", "#2ecc71", "#27ae60", "#f39c12"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, s * 0.02);
    ctx.quadraticCurveTo(-s * (0.5 + i * 0.06), -s * (0.1 + i * 0.04), -s * 0.42, s * (0.28 + i * 0.05));
    ctx.quadraticCurveTo(-s * 0.2, s * 0.15, -s * 0.06, s * 0.1);
    ctx.fill();
    fillStroke(ctx, s);
  });

  // Patas naranjas cartoon
  ctx.fillStyle = "#ff9100";
  ctx.fillRect(-s * 0.14, s * 0.3, s * 0.08, s * 0.16);
  ctx.fillRect(s * 0.06, s * 0.3, s * 0.08, s * 0.16);
  fillStroke(ctx, s);
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, s * 0.48);
  ctx.lineTo(-s * 0.04, s * 0.45);
  ctx.lineTo(-s * 0.1, s * 0.52);
  ctx.moveTo(s * 0.04, s * 0.45);
  ctx.lineTo(s * 0.2, s * 0.48);
  ctx.lineTo(s * 0.12, s * 0.52);
  ctx.fill();
  fillStroke(ctx, s);

  // Cuerpo redondo grande
  ctx.fillStyle = "#3cb878";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.1, s * 0.34, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.ellipse(-s * 0.08, s * 0.04, s * 0.12, s * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Cuello
  ctx.fillStyle = "#45c987";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.1, s * 0.16, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Cabeza
  ctx.fillStyle = "#52d99a";
  ctx.beginPath();
  ctx.arc(0, -s * 0.3, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Cresta roja grande
  ctx.fillStyle = "#e53935";
  [-0.06, 0, 0.06].forEach((ox, i) => {
    ctx.beginPath();
    ctx.moveTo(s * ox - s * 0.04, -s * 0.44);
    ctx.quadraticCurveTo(s * ox, -s * (0.62 + i * 0.04), s * ox + s * 0.04, -s * 0.44);
    ctx.fill();
    fillStroke(ctx, s);
  });

  // Barba roja colgante
  ctx.fillStyle = "#ef5350";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.2);
  ctx.bezierCurveTo(s * 0.12, -s * 0.05, s * 0.1, s * 0.06, 0, s * 0.04);
  ctx.bezierCurveTo(-s * 0.1, s * 0.06, -s * 0.12, -s * 0.05, 0, -s * 0.2);
  ctx.fill();
  fillStroke(ctx, s);

  ltEyes(ctx, s, t, talking, "normal");

  // Pico grande
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.22);
  ctx.quadraticCurveTo(s * 0.18, -s * 0.18, s * 0.14, -s * 0.12);
  ctx.lineTo(0, -s * 0.14);
  ctx.closePath();
  ctx.fill();
  fillStroke(ctx, s);

  ltMouth(ctx, s, t, talking, -s * 0.14, true);
  ctx.restore();
}

/** Gato estrella — estilo Sylvester exagerado */
function drawGatoEstrella(ctx, s, t, talking, purpleMouth) {
  const bob = talking ? Math.sin(t * 13) * s * 0.025 : Math.sin(t * 2.5) * s * 0.01;
  ctx.save();
  ctx.translate(0, bob);
  squashStretch(ctx, s, t, talking);
  ltShadow(ctx, s);

  // Cola larga curva
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(4, s * 0.12);
  ctx.fillStyle = "#ff8c00";
  ctx.beginPath();
  ctx.moveTo(s * 0.3, s * 0.12);
  ctx.quadraticCurveTo(s * 0.65, s * 0.05, s * 0.55, -s * 0.25);
  ctx.stroke();

  // Cuerpo gordo naranja
  ctx.fillStyle = "#ff9100";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.12, s * 0.32, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Panza blanca
  ctx.fillStyle = "#fff8e1";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.16, s * 0.18, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cabeza grande
  ctx.fillStyle = "#ff9100";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.2, s * 0.28, s * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Orejas puntiagudas
  ctx.fillStyle = "#ff9100";
  [[-0.22, -0.4], [0.22, -0.4]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(s * ex, s * ey);
    ctx.lineTo(s * (ex - 0.1), s * (ey - 0.22));
    ctx.lineTo(s * (ex + 0.06), s * (ey - 0.08));
    ctx.closePath();
    ctx.fill();
    fillStroke(ctx, s);
    ctx.fillStyle = "#ffb4a2";
    ctx.beginPath();
    ctx.moveTo(s * ex, s * ey);
    ctx.lineTo(s * (ex - 0.05), s * (ey - 0.14));
    ctx.lineTo(s * (ex + 0.03), s * (ey - 0.06));
    ctx.fill();
    ctx.fillStyle = "#ff9100";
  });

  // Estrella dorada
  ctx.fillStyle = "#ffe135";
  const sy = -s * 0.38;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? s * 0.12 : s * 0.055;
    const px = Math.cos(a) * r;
    const py = sy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  fillStroke(ctx, s);

  // Brillitos LT
  ctx.fillStyle = "#fff";
  [[-0.38, -0.48], [0.4, -0.52], [0.5, -0.35]].forEach(([bx, by], i) => {
    ctx.globalAlpha = 0.4 + Math.sin(t * 6 + i) * 0.4;
    drawSparkle(ctx, s * bx, s * by, s * 0.04);
  });
  ctx.globalAlpha = 1;

  ltEyes(ctx, s, t, talking, talking ? "normal" : "normal");

  // Mejillas
  ctx.fillStyle = "rgba(255,100,100,0.35)";
  ctx.beginPath();
  ctx.ellipse(-s * 0.2, -s * 0.15, s * 0.06, s * 0.04, 0, 0, Math.PI * 2);
  ctx.ellipse(s * 0.2, -s * 0.15, s * 0.06, s * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hocico
  ctx.fillStyle = "#ffb4a2";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.1, s * 0.06, s * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  if (purpleMouth && talking) {
    ctx.fillStyle = "#9b5de5";
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.02, s * 0.08, s * (0.04 + Math.abs(Math.sin(t * 18)) * 0.04), 0, 0, Math.PI * 2);
    ctx.fill();
    fillStroke(ctx, s);
  } else {
    ltMouth(ctx, s, t, talking, -s * 0.02);
  }

  ctx.restore();
}

function drawSparkle(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(0, r);
  ctx.moveTo(-r, 0);
  ctx.lineTo(r, 0);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/** Cerdo trueno — estilo Porky Pig mini */
function drawCerdoTrueno(ctx, s, t, talking, shake) {
  const sh = shake ? Math.sin(t * 45) * s * 0.06 : 0;
  ctx.save();
  ctx.translate(sh, talking ? Math.sin(t * 14) * s * 0.02 : 0);
  if (talking) squashStretch(ctx, s, t, true);
  ltShadow(ctx, s, 0.4);

  ctx.fillStyle = "#ffb3c6";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.08, s * 0.3, s * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  ctx.beginPath();
  ctx.arc(0, -s * 0.22, s * 0.24, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Orejas caídas
  ctx.beginPath();
  ctx.ellipse(-s * 0.22, -s * 0.3, s * 0.1, s * 0.14, -0.5, 0, Math.PI * 2);
  ctx.ellipse(s * 0.22, -s * 0.3, s * 0.1, s * 0.14, 0.5, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Rayo en la frente
  ctx.fillStyle = "#ffe135";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.48);
  ctx.lineTo(-s * 0.08, -s * 0.3);
  ctx.lineTo(s * 0.02, -s * 0.3);
  ctx.lineTo(-s * 0.06, -s * 0.14);
  ctx.lineTo(s * 0.1, -s * 0.36);
  ctx.closePath();
  ctx.fill();
  fillStroke(ctx, s);

  // Hocico grande estilo Porky
  ctx.fillStyle = "#ff8fab";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.1, s * 0.14, s * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.ellipse(-s * 0.05, -s * 0.1, s * 0.035, s * 0.045, 0, 0, Math.PI * 2);
  ctx.ellipse(s * 0.05, -s * 0.1, s * 0.035, s * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();

  ltEyes(ctx, s, t, talking, shake ? "shocked" : "normal");
  ltMouth(ctx, s, t, talking, s * 0.02, true);

  ctx.restore();
}

/** Rana pantalón — estilo Michigan J Frog */
function drawRanaPantalon(ctx, s, t, talking) {
  ctx.save();
  ctx.translate(0, talking ? Math.sin(t * 13) * s * 0.025 : Math.sin(t * 3) * s * 0.01);
  if (talking) squashStretch(ctx, s, t, true);
  ltShadow(ctx, s, 0.42);

  // Pantalones azules enormes
  ctx.fillStyle = "#1565c0";
  ctx.fillRect(-s * 0.3, s * 0.06, s * 0.6, s * 0.34);
  fillStroke(ctx, s);
  ctx.fillStyle = "#1976d2";
  ctx.fillRect(-s * 0.3, s * 0.06, s * 0.3, s * 0.34);
  ctx.fillRect(0, s * 0.06, s * 0.3, s * 0.34);
  // Tirantes
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(3, s * 0.07);
  ctx.beginPath();
  ctx.moveTo(-s * 0.12, s * 0.06);
  ctx.lineTo(-s * 0.08, -s * 0.06);
  ctx.moveTo(s * 0.12, s * 0.06);
  ctx.lineTo(s * 0.08, -s * 0.06);
  ctx.stroke();
  // Botones
  ctx.fillStyle = "#ffd700";
  [0.15, 0.28, 0.4].forEach((fy) => {
    ctx.beginPath();
    ctx.arc(0, s * fy, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
    fillStroke(ctx, s);
  });

  // Cuerpo verde brillante
  ctx.fillStyle = "#66dd44";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.02, s * 0.24, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Cabeza
  ctx.beginPath();
  ctx.arc(0, -s * 0.24, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Ojos bulbosos en tallo
  [[-0.14, -0.42], [0.14, -0.42]].forEach(([ex, ey]) => {
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(2.5, s * 0.06);
    ctx.beginPath();
    ctx.moveTo(s * ex * 0.5, -s * 0.28);
    ctx.lineTo(s * ex, s * ey);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * ex, s * ey, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    fillStroke(ctx, s);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(s * ex + s * 0.025, s * ey, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * ex + s * 0.04, s * ey - s * 0.03, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
  });

  ltMouth(ctx, s, t, talking, -s * 0.14, true);

  // Sombrero opcional cartoon
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(-s * 0.18, -s * 0.38, s * 0.36, s * 0.04);
  ctx.fillRect(-s * 0.1, -s * 0.48, s * 0.2, s * 0.1);
  fillStroke(ctx, s);

  ctx.restore();
}

/** Palomo cartero — estilo mensajero clásico */
function drawPalomoCartero(ctx, s, t, talking) {
  const flap = Math.sin(t * 10) * s * 0.04;
  ctx.save();
  ctx.translate(0, flap);
  ltShadow(ctx, s, 0.38);

  // Alas batientes
  const wingFlap = Math.sin(t * 12) * 0.4;
  ctx.fillStyle = "#b0bec5";
  [[-1, wingFlap], [1, -wingFlap]].forEach(([side, ang]) => {
    ctx.save();
    ctx.rotate(ang * side);
    ctx.beginPath();
    ctx.ellipse(side * s * 0.28, -s * 0.02, s * 0.22, s * 0.1, side * 0.2, 0, Math.PI * 2);
    ctx.fill();
    fillStroke(ctx, s);
    ctx.restore();
  });

  ctx.fillStyle = "#cfd8dc";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.04, s * 0.2, s * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  ctx.beginPath();
  ctx.arc(0, -s * 0.2, s * 0.16, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Gorra cartero
  ctx.fillStyle = "#1565c0";
  ctx.fillRect(-s * 0.14, -s * 0.36, s * 0.28, s * 0.06);
  ctx.fillRect(-s * 0.1, -s * 0.44, s * 0.2, s * 0.1);
  fillStroke(ctx, s);
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(0, -s * 0.38, s * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Pico
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.18);
  ctx.lineTo(s * 0.14, -s * 0.15);
  ctx.lineTo(0, -s * 0.1);
  ctx.fill();
  fillStroke(ctx, s);

  // Ojo grande
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(s * 0.06, -s * 0.22, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(s * 0.08, -s * 0.22, s * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Bolsa correo
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(-s * 0.1, s * 0.1, s * 0.2, s * 0.16);
  fillStroke(ctx, s);
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(-s * 0.04, s * 0.14, s * 0.08, s * 0.06);

  ltMouth(ctx, s, t, talking, -s * 0.1);

  ctx.restore();
}

/** Topo cegato — topo con gafas enormes, sale del suelo */
function drawTopoCegato(ctx, s, t, talking) {
  ctx.save();
  ctx.translate(0, talking ? Math.sin(t * 13) * s * 0.02 : Math.sin(t * 2) * s * 0.008);
  if (talking) squashStretch(ctx, s, t, true);
  ltShadow(ctx, s, 0.38);

  // Agujero
  ctx.fillStyle = "#3e2723";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.38, s * 0.32, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Cuerpo marrón redondo
  ctx.fillStyle = "#8d6e63";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.12, s * 0.26, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Cabeza
  ctx.beginPath();
  ctx.arc(0, -s * 0.18, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Nariz rosa
  ctx.fillStyle = "#ff8fab";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.1, s * 0.09, s * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Gafas enormes (no ve)
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(-s * 0.1, -s * 0.2, s * 0.11, 0, Math.PI * 2);
  ctx.arc(s * 0.1, -s * 0.2, s * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s, Math.max(4, s * 0.11));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.01, -s * 0.2);
  ctx.lineTo(s * 0.01, -s * 0.2);
  ctx.stroke();
  // Espirales en gafas = cegato
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, s * 0.05);
  [[-0.1, -0.2], [0.1, -0.2]].forEach(([ex, ey]) => {
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = i * 0.8;
      const r = s * 0.008 * i;
      ctx.lineTo(s * ex + Math.cos(a) * r, s * ey + Math.sin(a) * r);
    }
    ctx.stroke();
  });

  // Manitas con garras
  ctx.fillStyle = "#a1887f";
  [[-0.22, 0.08], [0.22, 0.08]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.ellipse(s * ex, s * ey, s * 0.07, s * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    fillStroke(ctx, s);
  });

  ltMouth(ctx, s, t, talking, -s * 0.02, true);
  ctx.restore();
}

/** Mapache ladrón — antifaz, cola rayada, muy tramposo */
function drawMapacheLadron(ctx, s, t, talking, sneaky) {
  const sway = sneaky ? Math.sin(t * 6) * s * 0.04 : 0;
  ctx.save();
  ctx.translate(sway, talking ? Math.sin(t * 14) * s * 0.02 : 0);
  if (talking) squashStretch(ctx, s, t, true);
  ltShadow(ctx, s);

  // Cola rayada grande
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(4, s * 0.12);
  ctx.beginPath();
  ctx.moveTo(-s * 0.28, s * 0.1);
  ctx.quadraticCurveTo(-s * 0.55, -s * 0.05, -s * 0.5, -s * 0.3);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#78909c" : INK;
    ctx.beginPath();
    ctx.arc(-s * (0.38 + i * 0.04), -s * (0.05 + i * 0.05), s * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cuerpo gris
  ctx.fillStyle = "#90a4ae";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.1, s * 0.28, s * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Barriga clara
  ctx.fillStyle = "#cfd8dc";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.14, s * 0.16, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cabeza
  ctx.fillStyle = "#90a4ae";
  ctx.beginPath();
  ctx.arc(0, -s * 0.2, s * 0.24, 0, Math.PI * 2);
  ctx.fill();
  fillStroke(ctx, s);

  // Antifaz negro LT
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.ellipse(-s * 0.1, -s * 0.22, s * 0.1, s * 0.08, 0, 0, Math.PI * 2);
  ctx.ellipse(s * 0.1, -s * 0.22, s * 0.1, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-s * 0.1, -s * 0.24, s * 0.2, s * 0.04);

  // Ojos traviesos blancos dentro del antifaz
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-s * 0.1, -s * 0.22, s * 0.045, 0, Math.PI * 2);
  ctx.arc(s * 0.1, -s * 0.22, s * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-s * 0.07, -s * 0.22, s * 0.022, 0, Math.PI * 2);
  ctx.arc(s * 0.13, -s * 0.22, s * 0.022, 0, Math.PI * 2);
  ctx.fill();

  // Orejas
  ctx.fillStyle = "#78909c";
  [[-0.2, -0.38], [0.2, -0.38]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.arc(s * ex, s * ey, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
    fillStroke(ctx, s);
  });

  // Nariz
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(0, -s * 0.14, s * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Sonrisa tramposa
  if (talking) {
    ltMouth(ctx, s, t, true, -s * 0.06, true);
  } else {
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(2.5, s * 0.07);
    ctx.beginPath();
    ctx.arc(0, -s * 0.08, s * 0.08, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // Garra con chuche robada
  if (sneaky) {
    ctx.fillStyle = "#ff006e";
    ctx.beginPath();
    ctx.arc(s * 0.28, s * 0.02, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
    fillStroke(ctx, s);
  }

  ctx.restore();
}

const DRAWERS = {
  pavo: drawPavoMarilondo,
  gato: drawGatoEstrella,
  cerdo: drawCerdoTrueno,
  rana: drawRanaPantalon,
  palomo: drawPalomoCartero,
  topo: drawTopoCegato,
  mapache: drawMapacheLadron,
};

const CHARACTER_NAMES = {
  pavo: "Pavo marilondo",
  gato: "Gato estrella",
  cerdo: "Cerdo trueno",
  rana: "Rana pantalón",
  palomo: "Palomo cartero",
  topo: "Topo cegato",
  mapache: "Mapache ladrón",
};

function drawCharacter(ctx, id, s, t, opts = {}) {
  const fn = DRAWERS[id];
  if (!fn) return;
  if (id === "gato") fn(ctx, s, t, opts.talking, opts.purpleMouth);
  else if (id === "cerdo") fn(ctx, s, t, opts.talking, opts.shake);
  else if (id === "mapache") fn(ctx, s, t, opts.talking, opts.sneaky);
  else fn(ctx, s, t, opts.talking);
}
