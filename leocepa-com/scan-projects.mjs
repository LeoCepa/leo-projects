import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SKIP = new Set(["leocepa-com", ".git", "node_modules"]);

const meta = JSON.parse(
  await readFile(join(HERE, "project-meta.json"), "utf8")
);

async function hasIndex(folder, entry = "index.html") {
  try {
    await access(join(ROOT, folder, entry));
    return true;
  } catch {
    return false;
  }
}

async function discover() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const found = new Set();

  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP.has(entry.name)) continue;

    if (await hasIndex(entry.name)) {
      found.add(entry.name);
    }

    if (entry.name === "el-pipi" && (await hasIndex("el-pipi/tengo-sed"))) {
      found.add("el-pipi/tengo-sed");
    }
  }

  for (const key of Object.keys(meta)) {
    if (meta[key].status === "soon") found.add(key);
  }

  const projects = [...found].map((id) => {
    const info = meta[id] ?? {};
    const entry = info.entry ?? "index.html";
    const ready = id.includes("/")
      ? true
      : meta[id]?.status !== "soon";

    return {
      id,
      title: info.title ?? id,
      emoji: info.emoji ?? "🎮",
      description: info.description ?? "Un juego de Leo.",
      path: `${id}/${entry}`.replace(/\/index\.html\/index\.html$/, "/index.html"),
      tags: info.tags ?? ["aventura"],
      ...(info.saga ? { saga: info.saga } : {}),
      status: info.status ?? (ready ? "ready" : "soon"),
    };
  });

  projects.sort((a, b) => {
    if (a.status !== b.status) return a.status === "ready" ? -1 : 1;
    return a.title.localeCompare(b.title, "es");
  });

  await writeFile(
    join(HERE, "projects.json"),
    JSON.stringify(projects, null, 2) + "\n"
  );

  console.log(`✅ Catálogo actualizado: ${projects.length} proyectos`);
}

discover().catch((err) => {
  console.error(err);
  process.exit(1);
});
