/** Personajes de Los Tontillos — estilo dibujo animado Warner */
const INK = "#1a1a2e";

function ink(ctx, s) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, s * 0.08);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}

function shadow(ctx, s, yOff = 0.42) {
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(0, s * yOff, s * 0.42, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Pavo marilondo — plumas peinadas, muy serio */
function drawPavoMarilondo(ctx, s, t, talking) {
  const bob = talking ? Math.sin(t * 14) * s * 0.025 : Math.sin(t * 2) * s * 0.01;
  ctx.save();
  ctx.translate(0, bob);

  shadow(ctx, s);

  // patas
  ctx.fillStyle = INK;
  ctx.fillRect(-s * 0.12, s * 0.28, s * 0.07, s * 0.18);
  ctx.fillRect(s * 0.05, s * 0.28, s * 0.07, s * 0.18);
  ctx.fillStyle = "#e85d04";
  ctx.beginPath();
  ctx.moveTo(-s * 0.18, s * 0.46);
  ctx.lineTo(-s * 0.02, s * 0.44);
  ctx.lineTo(-s * 0.08, s * 0.48);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s * 0.02, s * 0.44);
  ctx.lineTo(s * 0.18, s * 0.46);
  ctx.lineTo(s * 0.1, s * 0.48);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // cuerpo plumas
  ctx.fillStyle = "#2a6f4e";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.08, s * 0.32, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // plumas cola abanico
  ["#1b4332", "#40916c", "#52b788"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(-s * 0.05, s * 0.05);
    ctx.quadraticCurveTo(-s * (0.45 + i * 0.08), s * (0.1 - i * 0.05), -s * 0.35, s * (0.35 + i * 0.04));
    ctx.quadraticCurveTo(-s * 0.15, s * 0.2, -s * 0.05, s * 0.12);
    ctx.fill();
    ink(ctx, s);
    ctx.stroke();
  });

  // cuello
  ctx.fillStyle = "#40916c";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.12, s * 0.14, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // cabeza
  ctx.fillStyle = "#52b788";
  ctx.beginPath();
  ctx.arc(0, -s * 0.28, s * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // cresta peinada
  ctx.fillStyle = "#e85d04";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.08 + i * s * 0.04, -s * 0.42);
    ctx.lineTo(-s * 0.04 + i * s * 0.04, -s * (0.55 + (i % 2) * 0.06));
    ctx.lineTo(0 + i * s * 0.04, -s * 0.42);
    ctx.fill();
    ink(ctx, s);
    ctx.stroke();
  }

  // barba roja
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.18);
  ctx.quadraticCurveTo(s * 0.08, -s * 0.05, 0, s * 0.02);
  ctx.quadraticCurveTo(-s * 0.08, -s * 0.05, 0, -s * 0.18);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // ojos serios
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-s * 0.07, -s * 0.3, s * 0.055, 0, Math.PI * 2);
  ctx.arc(s * 0.07, -s * 0.3, s * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-s * 0.05, -s * 0.3, s * 0.028, 0, Math.PI * 2);
  ctx.arc(s * 0.09, -s * 0.3, s * 0.028, 0, Math.PI * 2);
  ctx.fill();

  // pico
  ctx.fillStyle = "#ffb703";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.22);
  ctx.lineTo(s * 0.1, -s * 0.18);
  ctx.lineTo(0, -s * 0.14);
  ctx.closePath();
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // boca hablando
  if (talking) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.16, s * 0.05, s * (0.03 + Math.abs(Math.sin(t * 16)) * 0.03), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Gato estrella — estrella en la frente, boca morada si chuches */
function drawGatoEstrella(ctx, s, t, talking, purpleMouth) {
  const bob = talking ? Math.sin(t * 14) * s * 0.03 : Math.sin(t * 2.5) * s * 0.012;
  ctx.save();
  ctx.translate(0, bob);

  shadow(ctx, s);

  // cola
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, s * 0.08);
  ctx.beginPath();
  ctx.moveTo(s * 0.28, s * 0.1);
  ctx.quadraticCurveTo(s * 0.55, s * 0.0, s * 0.5, -s * 0.2);
  ctx.stroke();

  // cuerpo naranja
  ctx.fillStyle = "#f77f00";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.1, s * 0.3, s * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // cabeza
  ctx.beginPath();
  ctx.arc(0, -s * 0.18, s * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // orejas
  ctx.fillStyle = "#f77f00";
  [[-0.18, -0.38], [0.18, -0.38]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(s * ex, s * ey);
    ctx.lineTo(s * (ex - 0.08), s * (ey - 0.18));
    ctx.lineTo(s * (ex + 0.04), s * (ey - 0.1));
    ctx.closePath();
    ctx.fill();
    ink(ctx, s);
    ctx.stroke();
  });

  // estrella en frente
  ctx.fillStyle = "#ffd93d";
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, s * 0.06);
  const sx = 0, sy = -s * 0.32;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? s * 0.1 : s * 0.045;
    const px = sx + Math.cos(a) * r;
    const py = sy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // brillitos
  if (talking || true) {
    ctx.fillStyle = "#fff";
    [[-0.35, -0.45], [0.38, -0.5]].forEach(([bx, by]) => {
      ctx.globalAlpha = 0.5 + Math.sin(t * 5 + bx) * 0.3;
      ctx.beginPath();
      ctx.arc(s * bx, s * by, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ojos
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-s * 0.08, -s * 0.2, s * 0.06, 0, Math.PI * 2);
  ctx.arc(s * 0.08, -s * 0.2, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-s * 0.06, -s * 0.2, s * 0.03, 0, Math.PI * 2);
  ctx.arc(s * 0.1, -s * 0.2, s * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // hocico
  ctx.fillStyle = "#ffb4a2";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.12, s * 0.05, s * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // boca morada de chuches
  ctx.fillStyle = purpleMouth ? "#9b5de5" : INK;
  if (talking) {
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.06, s * 0.06, s * (0.03 + Math.abs(Math.sin(t * 16)) * 0.025), 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, -s * 0.06, s * 0.04, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

  ctx.restore();
}

/** Cerdo trueno — pequeño, rayo en la frente */
function drawCerdoTrueno(ctx, s, t, talking, shake) {
  const sh = shake ? Math.sin(t * 40) * s * 0.04 : 0;
  const bob = talking ? Math.sin(t * 14) * s * 0.025 : 0;
  ctx.save();
  ctx.translate(sh, bob);

  shadow(ctx, s, 0.38);

  ctx.fillStyle = "#ffb3c1";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.05, s * 0.28, s * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -s * 0.2, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // orejas
  ctx.beginPath();
  ctx.ellipse(-s * 0.2, -s * 0.28, s * 0.08, s * 0.12, -0.4, 0, Math.PI * 2);
  ctx.ellipse(s * 0.2, -s * 0.28, s * 0.08, s * 0.12, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // rayo
  ctx.fillStyle = "#ffd93d";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.42);
  ctx.lineTo(-s * 0.06, -s * 0.28);
  ctx.lineTo(s * 0.02, -s * 0.28);
  ctx.lineTo(-s * 0.04, -s * 0.14);
  ctx.lineTo(s * 0.08, -s * 0.32);
  ctx.lineTo(s * 0.02, -s * 0.32);
  ctx.closePath();
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // hocico
  ctx.fillStyle = "#ff8fab";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.12, s * 0.1, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-s * 0.035, -s * 0.12, s * 0.02, 0, Math.PI * 2);
  ctx.arc(s * 0.035, -s * 0.12, s * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // ojos
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-s * 0.08, -s * 0.22, s * 0.05, 0, Math.PI * 2);
  ctx.arc(s * 0.08, -s * 0.22, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-s * 0.06, -s * 0.22, s * 0.025, 0, Math.PI * 2);
  ctx.arc(s * 0.1, -s * 0.22, s * 0.025, 0, Math.PI * 2);
  ctx.fill();

  if (talking) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.02, s * 0.05, s * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Rana pantalón — pantalones enormes */
function drawRanaPantalon(ctx, s, t, talking) {
  const bob = talking ? Math.sin(t * 14) * s * 0.03 : Math.sin(t * 3) * s * 0.015;
  ctx.save();
  ctx.translate(0, bob);

  shadow(ctx, s, 0.4);

  // pantalón gigante
  ctx.fillStyle = "#4361ee";
  ctx.fillRect(-s * 0.28, s * 0.05, s * 0.56, s * 0.32);
  ink(ctx, s);
  ctx.strokeRect(-s * 0.28, s * 0.05, s * 0.56, s * 0.32);
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.05);
  ctx.lineTo(0, s * 0.37);
  ctx.stroke();
  // tirantes
  ctx.lineWidth = Math.max(2, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, s * 0.05);
  ctx.lineTo(-s * 0.06, -s * 0.05);
  ctx.moveTo(s * 0.1, s * 0.05);
  ctx.lineTo(s * 0.06, -s * 0.05);
  ctx.stroke();

  // cuerpo rana verde
  ctx.fillStyle = "#6bcf4a";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.02, s * 0.22, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // cabeza
  ctx.beginPath();
  ctx.arc(0, -s * 0.22, s * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // ojos saltones
  [[-0.12, -0.32], [0.12, -0.32]].forEach(([ex, ey]) => {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * ex, s * ey, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ink(ctx, s);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(s * (ex + 0.02), s * ey, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
  });

  if (talking) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.12, s * 0.08, s * (0.04 + Math.abs(Math.sin(t * 16)) * 0.03), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Palomo cartero */
function drawPalomoCartero(ctx, s, t, talking) {
  const flap = Math.sin(t * 8) * s * 0.05;
  ctx.save();
  ctx.translate(0, flap);

  shadow(ctx, s, 0.35);

  // alas
  ctx.fillStyle = "#adb5bd";
  ctx.beginPath();
  ctx.ellipse(-s * 0.25, 0, s * 0.2, s * 0.1, -0.3, 0, Math.PI * 2);
  ctx.ellipse(s * 0.25, 0, s * 0.2, s * 0.1, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // cuerpo
  ctx.fillStyle = "#ced4da";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.02, s * 0.18, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // cabeza
  ctx.beginPath();
  ctx.arc(0, -s * 0.18, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();

  // pico
  ctx.fillStyle = "#ffb703";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.16);
  ctx.lineTo(s * 0.12, -s * 0.14);
  ctx.lineTo(0, -s * 0.1);
  ctx.fill();

  // ojo
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(s * 0.05, -s * 0.2, s * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // bolsa correo
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(-s * 0.08, s * 0.08, s * 0.16, s * 0.14);
  ink(ctx, s);
  ctx.strokeRect(-s * 0.08, s * 0.08, s * 0.16, s * 0.14);

  if (talking) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.1, s * 0.04, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

const DRAWERS = {
  pavo: drawPavoMarilondo,
  gato: drawGatoEstrella,
  cerdo: drawCerdoTrueno,
  rana: drawRanaPantalon,
  palomo: drawPalomoCartero,
};

const CHARACTER_NAMES = {
  pavo: "Pavo marilondo",
  gato: "Gato estrella",
  cerdo: "Cerdo trueno",
  rana: "Rana pantalón",
  palomo: "Palomo cartero",
};

function drawCharacter(ctx, id, s, t, opts = {}) {
  const fn = DRAWERS[id];
  if (!fn) return;
  if (id === "gato") fn(ctx, s, t, opts.talking, opts.purpleMouth);
  else if (id === "cerdo") fn(ctx, s, t, opts.talking, opts.shake);
  else fn(ctx, s, t, opts.talking);
}
