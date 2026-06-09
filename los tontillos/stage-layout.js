/** Escenario grande — personajes repartidos sin taparse */
const STAGE_ORDER = {
  pavo: 0,
  topo: 1,
  palomo: 2,
  cerdo: 3,
  rana: 4,
  gato: 5,
  mapache: 6,
};

function getStageSize(wrap) {
  const w = wrap.clientWidth;
  const h = Math.min(Math.max(w * 0.88, 320), 620);
  return { w, h };
}

function layoutCharacters(visibleIds, w, h) {
  const sorted = [...visibleIds].sort(
    (a, b) => (STAGE_ORDER[a] ?? 99) - (STAGE_ORDER[b] ?? 99)
  );
  const n = sorted.length;
  const marginX = w * 0.06;
  const usable = w - marginX * 2;
  const baseY = h * 0.64;
  const maxSize = Math.min(h * 0.34, w / Math.max(n + 0.8, 2.5), 165);
  const charSize = maxSize * (n > 5 ? 0.88 : n > 4 ? 0.94 : 1);

  const positions = {};
  sorted.forEach((id, i) => {
    const x =
      n === 1
        ? w * 0.5
        : marginX + (usable / Math.max(n - 1, 1)) * i;
    let y = baseY;

    if (id === "topo") y = baseY + h * 0.04;
    if (id === "palomo") y = baseY - h * 0.06;
    if (id === "rana") y = baseY + h * 0.02;

    positions[id] = { x, y, size: charSize };
  });

  return positions;
}
