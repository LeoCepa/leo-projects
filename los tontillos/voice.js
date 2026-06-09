/** Voces graciosas estilo cartoon — cada tontillo suena distinto */
const VOICE_PROFILE = {
  pavo: { pitch: 0.35, rate: 0.68, volume: 0.95, jitter: 0.04 },
  gato: { pitch: 1.85, rate: 1.28, volume: 1, jitter: 0.08 },
  cerdo: { pitch: 1.75, rate: 1.55, volume: 0.88, jitter: 0.1 },
  rana: { pitch: 0.85, rate: 1.18, volume: 1, jitter: 0.06 },
  palomo: { pitch: 0.7, rate: 0.78, volume: 0.92, jitter: 0.03 },
  topo: { pitch: 1.25, rate: 0.88, volume: 0.95, jitter: 0.07 },
  mapache: { pitch: 0.55, rate: 1.38, volume: 0.9, jitter: 0.05 },
  all: { pitch: 1.95, rate: 1.55, volume: 1, jitter: 0.12 },
};

const VOICE_HINTS = {
  pavo: ["pablo", "jorge", "diego", "male", "alvaro"],
  gato: ["helena", "laura", "elvira", "sabina", "female"],
  cerdo: ["helena", "laura", "sabina", "female"],
  rana: ["pablo", "diego", "jorge"],
  palomo: ["diego", "jorge", "pablo"],
  topo: ["pablo", "jorge", "male"],
  mapache: ["diego", "jorge", "pablo", "male"],
  all: ["helena", "laura", "sabina"],
};

let spanishVoices = [];

function loadVoices() {
  spanishVoices = speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith("es"));
}

if ("speechSynthesis" in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(speaker) {
  if (!spanishVoices.length) return null;
  const hints = VOICE_HINTS[speaker] ?? VOICE_HINTS.pavo;
  for (const hint of hints) {
    const match = spanishVoices.find((v) =>
      v.name.toLowerCase().includes(hint)
    );
    if (match) return match;
  }
  const fallback = { pavo: 0, gato: 1, cerdo: 2, rana: 0, palomo: 1, topo: 2, mapache: 1, all: 1 };
  return spanishVoices[(fallback[speaker] ?? 0) % spanishVoices.length];
}

/** Transforma el texto para que suene más cartoon al hablar */
function comicText(text, speaker) {
  let t = text;

  if (speaker === "pavo") {
    t = t.replace(/\./g, "...").replace(/Suspicious/gi, "Sospeeechous");
    t = t.replace(/Warner/gi, "Guárner");
  }

  if (speaker === "gato") {
    t = t.replace(/estrella/gi, "estreeella");
    t = t.replace(/heroico/gi, "heroooico");
    t = t.replace(/glamour/gi, "glamuurr");
    t = t.replace(/!/g, "!!");
    t = t.replace(/chuches/gi, "chuuuches");
  }

  if (speaker === "cerdo") {
    t = t.replace(/(Perdonad\.?\s*)+/gi, (m) => {
      const n = (m.match(/Perdonad/gi) || []).length;
      return Array.from({ length: n }, () => "perdonaaad").join("... ") + "...";
    });
    t = t.replace(/trueno/gi, "truueeeno");
  }

  if (speaker === "rana") {
    t = t.replace(/chuches/gi, "chuuuches");
    t = t.replace(/bolsa/gi, "bolsaaa");
    t = t.replace(/oportunidad/gi, "oportuniidaad");
  }

  if (speaker === "topo") {
    t = t.replace(/huelo/gi, "huuuuelo");
    t = t.replace(/no veo/gi, "no veeeo");
    t = t.replace(/sótano/gi, "sótaaanoo");
  }

  if (speaker === "mapache") {
    t = t.replace(/mías/gi, "míaaaaas");
    t = t.replace(/mío/gi, "míoooo");
    t = t.replace(/ladron/gi, "ladróóón");
    t = t.replace(/Prometo/gi, "Promeeeto");
  }

  if (speaker === "palomo") {
    t = t.replace(/,/g, "...").replace(/:/g, "... dos puntos...");
    t = t.replace(/impuesto/gi, "impueeesto");
  }

  if (speaker === "all") {
    t = t.toUpperCase().replace(/!/g, "!!!");
    if (!t.includes("AAAA")) t = t.replace(/A+/g, "AAAAAAH");
  }

  return t;
}

/** Partes separadas para efectos cómicos (cerdo disculpándose, etc.) */
function speechParts(text, speaker) {
  if (speaker === "cerdo" && /perdonaaad/i.test(text)) {
    const parts = text.split(/\.\.\.\s*/).filter(Boolean);
    if (parts.length > 1) {
      return parts.map((p, i) => ({
        text: p.trim(),
        pitch: 1.6 + i * 0.08,
        rate: 1.45 + i * 0.05,
      }));
    }
  }

  if (speaker === "all") {
    return [
      { text: "¡¡¡", pitch: 1.5, rate: 1.2 },
      { text, pitch: 1.95, rate: 1.6 },
    ];
  }

  return [{ text, pitch: null, rate: null }];
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function speakOnce(part, speaker, isFirst) {
  return new Promise((resolve) => {
    const profile = VOICE_PROFILE[speaker] ?? VOICE_PROFILE.pavo;
    const utter = new SpeechSynthesisUtterance(part.text);
    utter.lang = "es-ES";

    const jitter = (Math.random() - 0.5) * profile.jitter;
    utter.pitch = Math.min(2, Math.max(0.1, (part.pitch ?? profile.pitch) + jitter));
    utter.rate = Math.min(2, Math.max(0.4, part.rate ?? profile.rate));
    utter.volume = profile.volume ?? 1;

    const voice = pickVoice(speaker);
    if (voice) utter.voice = voice;

    utter.onstart = () => {
      if (isFirst && typeof onSpeakStart === "function") onSpeakStart(speaker);
    };
    utter.onend = resolve;
    utter.onerror = resolve;

    speechSynthesis.speak(utter);
  });
}

async function speak(text, speaker) {
  if (!("speechSynthesis" in window)) {
    await wait(Math.max(1800, text.length * 75));
    if (typeof onSpeakStart === "function") onSpeakStart(speaker);
    await wait(Math.max(1200, text.length * 50));
    if (typeof onSpeakEnd === "function") onSpeakEnd();
    return;
  }

  speechSynthesis.cancel();
  await wait(50);

  const comic = comicText(text, speaker);
  const parts = speechParts(comic, speaker);

  for (let i = 0; i < parts.length; i++) {
    await speakOnce(parts[i], speaker, i === 0);
    if (i < parts.length - 1) await wait(120);
  }

  if (typeof onSpeakEnd === "function") onSpeakEnd();
}

function stopSpeaking() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (typeof onSpeakEnd === "function") onSpeakEnd();
}
