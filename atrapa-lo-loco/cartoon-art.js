const CARTOON_INK = "#1a1a2e";

function cartoonStroke(ctx, s) {
  ctx.strokeStyle = CARTOON_INK;
  ctx.lineWidth = Math.max(2, s * 0.08);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}

function drawCartoonItem(ctx, type, size) {
  const s = size;
  ctx.clearRect(0, 0, s, s);
  ctx.save();
  ctx.translate(s / 2, s / 2);

  if (type === "unicorn") {
    ctx.fillStyle = "#f8b4ff";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.08, s * 0.28, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    cartoonStroke(ctx, s);
    ctx.stroke();
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.moveTo(s * 0.05, -s * 0.12);
    ctx.lineTo(s * 0.12, -s * 0.35);
    ctx.lineTo(s * 0.2, -s * 0.1);
    ctx.fill();
    ctx.stroke();
  } else if (type === "pizza") {
    ctx.fillStyle = "#ffd93d";
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.25);
    ctx.lineTo(0, -s * 0.32);
    ctx.lineTo(s * 0.3, s * 0.25);
    ctx.closePath();
    ctx.fill();
    cartoonStroke(ctx, s);
    ctx.stroke();
    ctx.fillStyle = "#e74c3c";
    [[-0.08, 0], [0.1, 0.08], [0, -0.1]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(s * x, s * y, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (type === "octopus") {
    ctx.fillStyle = "#b388ff";
    ctx.beginPath();
    ctx.arc(0, -s * 0.05, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    cartoonStroke(ctx, s);
    ctx.stroke();
    ctx.strokeStyle = CARTOON_INK;
    ctx.lineWidth = s * 0.06;
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      const a = -0.4 + i * 0.16;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * s * 0.15, s * 0.05);
      ctx.quadraticCurveTo(Math.cos(a) * s * 0.35, s * 0.25, Math.cos(a) * s * 0.2, s * 0.35);
      ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-s * 0.07, -s * 0.08, s * 0.05, 0, Math.PI * 2);
    ctx.arc(s * 0.07, -s * 0.08, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CARTOON_INK;
    ctx.beginPath();
    ctx.arc(-s * 0.06, -s * 0.08, s * 0.025, 0, Math.PI * 2);
    ctx.arc(s * 0.08, -s * 0.08, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "rocket") {
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.35);
    ctx.lineTo(s * 0.15, s * 0.2);
    ctx.lineTo(-s * 0.15, s * 0.2);
    ctx.closePath();
    ctx.fill();
    cartoonStroke(ctx, s);
    ctx.stroke();
    ctx.fillStyle = "#6ee7ff";
    ctx.fillRect(-s * 0.08, -s * 0.05, s * 0.16, s * 0.15);
    ctx.fillStyle = "#ffd93d";
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, s * 0.15);
    ctx.lineTo(-s * 0.25, s * 0.35);
    ctx.lineTo(-s * 0.05, s * 0.2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.15, s * 0.15);
    ctx.lineTo(s * 0.25, s * 0.35);
    ctx.lineTo(s * 0.05, s * 0.2);
    ctx.fill();
  } else if (type === "crown") {
    ctx.fillStyle = "#ffd93d";
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, s * 0.15);
    ctx.lineTo(-s * 0.2, -s * 0.15);
    ctx.lineTo(0, s * 0.05);
    ctx.lineTo(s * 0.2, -s * 0.15);
    ctx.lineTo(s * 0.28, s * 0.15);
    ctx.closePath();
    ctx.fill();
    cartoonStroke(ctx, s);
    ctx.stroke();
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(0, -s * 0.02, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "wolf") {
    ctx.fillStyle = "#b0b0bc";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.05, s * 0.25, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    cartoonStroke(ctx, s);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.18, -s * 0.05, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.2, -s * 0.06, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CARTOON_INK;
    ctx.beginPath();
    ctx.arc(s * 0.21, -s * 0.06, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#ff9f43";
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    cartoonStroke(ctx, s);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-s * 0.06, -s * 0.04, s * 0.04, 0, Math.PI * 2);
    ctx.arc(s * 0.06, -s * 0.04, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CARTOON_INK;
    ctx.beginPath();
    ctx.arc(-s * 0.05, -s * 0.04, s * 0.02, 0, Math.PI * 2);
    ctx.arc(s * 0.07, -s * 0.04, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, s * 0.06, s * 0.08, 0, Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

function makeCartoonCanvas(type, px) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  drawCartoonItem(canvas.getContext("2d"), type, px);
  return canvas;
}
