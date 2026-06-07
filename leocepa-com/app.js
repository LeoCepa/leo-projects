const SITE = document.body.dataset;

function repoBase() {
  return SITE.base || "..";
}

function catalogUrl() {
  const base = SITE.self || ".";
  return `${base}/projects.json`;
}

function gameUrl(project) {
  return `${repoBase()}/${project.path}`;
}

function playUrl(project) {
  const self = SITE.self || ".";
  const atRoot = self !== "." && !location.pathname.includes(`/${self}/`);
  const playPage = atRoot ? "play.html" : `${self}/play.html`;
  return `${playPage}?game=${encodeURIComponent(project.id)}`;
}

function isMobileDevice() {
  try {
    if (window.matchMedia("(pointer: coarse)").matches) return true;
    if (window.matchMedia("(hover: none)").matches) return true;
  } catch {
    /* ignore */
  }
  return navigator.maxTouchPoints > 0 || window.innerWidth <= 900;
}

function createStars() {
  const wrap = document.getElementById("stars");
  if (!wrap) return;
  for (let i = 0; i < 48; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2.5}s`;
    star.style.width = star.style.height = `${2 + Math.random() * 4}px`;
    wrap.appendChild(star);
  }
}

function renderCard(project) {
  const card = document.createElement("article");
  card.className = `card${project.status === "soon" ? " soon" : ""}`;
  card.dataset.tags = project.tags.join(" ");

  const tagsHtml = project.tags
    .map((t) => {
      const cls = t === "saga" ? "saga" : t === "pronto" ? "soon-tag" : "";
      const label = t === "pronto" ? "próximamente" : t;
      return `<span class="tag ${cls}">${label}</span>`;
    })
    .join("");

  const sagaLine = project.saga
    ? `<span class="tag saga">Saga ${project.saga}</span>`
    : "";

  card.innerHTML = `
    <div class="card-head">
      <span class="card-emoji">${project.emoji}</span>
      <div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
      </div>
    </div>
    <div class="tags">${tagsHtml}${sagaLine}</div>
    <button class="play-btn" type="button" ${
      project.status === "soon" ? "disabled" : ""
    }>
      ${project.status === "soon" ? "🔜 Muy pronto" : "▶ ¡Jugar!"}
    </button>
  `;

  const btn = card.querySelector(".play-btn");
  if (project.status !== "soon") {
    btn.addEventListener("click", () => {
      window.location.href = playUrl(project);
    });
  }

  return card;
}

function setupFilters(projects, grid) {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = [...grid.children];

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      cards.forEach((card, i) => {
        const project = projects[i];
        let show = true;
        if (filter === "ready") show = project.status === "ready";
        else if (filter === "saga") show = Boolean(project.saga);
        else if (filter === "soon") show = project.status === "soon";
        else if (filter !== "all") show = project.tags.includes(filter);
        card.style.display = show ? "" : "none";
      });
    });
  });
}

async function initHome() {
  const grid = document.getElementById("games-grid");
  const countEl = document.getElementById("game-count");
  if (!grid) return;

  let projects;
  try {
    const res = await fetch(catalogUrl());
    projects = await res.json();
  } catch {
    grid.innerHTML =
      '<p class="empty-state">No pude cargar los juegos. ¿Estás en internet?</p>';
    return;
  }

  const ready = projects.filter((p) => p.status === "ready").length;
  if (countEl) countEl.textContent = `${ready} juegos listos`;

  projects.forEach((project) => grid.appendChild(renderCard(project)));
  setupFilters(projects, grid);
}

async function initPlayer() {
  const params = new URLSearchParams(location.search);
  const gameId = params.get("game");
  const titleEl = document.getElementById("player-title");
  const frame = document.getElementById("game-frame");

  if (!gameId || !frame) return;

  let projects;
  try {
    const res = await fetch(catalogUrl());
    projects = await res.json();
  } catch {
    if (titleEl) titleEl.textContent = "Error al cargar";
    return;
  }

  const project = projects.find((p) => p.id === gameId);
  if (!project || project.status === "soon") {
    if (titleEl) titleEl.textContent = "Juego no encontrado";
    return;
  }

  if (isMobileDevice() && project.mobileFullscreen) {
    const url = new URL(gameUrl(project), location.href);
    url.searchParams.set("from", "leocepa");
    location.replace(url.toString());
    return;
  }

  if (titleEl) titleEl.textContent = `${project.emoji} ${project.title}`;
  frame.src = gameUrl(project);
  document.title = `${project.title} — LeoCepa.com`;
}

createStars();

if (document.body.dataset.page === "home") {
  initHome();
} else if (document.body.dataset.page === "play") {
  initPlayer();
}
