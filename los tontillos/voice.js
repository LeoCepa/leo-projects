/** Voces de Los Tontillos — cada personaje habla distinto */
const VOICE_PROFILE = {
  pavo: { pitch: 0.55, rate: 0.82 },
  gato: { pitch: 1.35, rate: 1.12 },
  cerdo: { pitch: 1.55, rate: 1.35 },
  rana: { pitch: 0.95, rate: 1.05 },
  palomo: { pitch: 1.05, rate: 0.92 },
  all: { pitch: 1.45, rate: 1.25 },
};

let spanishVoices = [];
let voicesReady = false;

function loadVoices() {
  const all = speechSynthesis.getVoices();
  spanishVoices = all.filter((v) => v.lang.startsWith("es"));
  voicesReady = spanishVoices.length > 0;
}

if ("speechSynthesis" in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(speaker) {
  if (!spanishVoices.length) return null;
  const idx = { pavo: 0, gato: 1, cerdo: 2, rana: 0, palomo: 1, all: 2 };
  const i = idx[speaker] ?? 0;
  return spanishVoices[i % spanishVoices.length];
}

function speak(text, speaker) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      const ms = Math.max(1800, text.length * 75);
      setTimeout(resolve, ms);
      return;
    }

    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES";
    const profile = VOICE_PROFILE[speaker] ?? VOICE_PROFILE.pavo;
    utter.pitch = profile.pitch;
    utter.rate = profile.rate;
    const voice = pickVoice(speaker);
    if (voice) utter.voice = voice;

    utter.onstart = () => {
      if (typeof onSpeakStart === "function") onSpeakStart(speaker);
    };
    utter.onend = () => {
      if (typeof onSpeakEnd === "function") onSpeakEnd();
      resolve();
    };
    utter.onerror = () => {
      if (typeof onSpeakEnd === "function") onSpeakEnd();
      resolve();
    };

    speechSynthesis.speak(utter);
  });
}

function stopSpeaking() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (typeof onSpeakEnd === "function") onSpeakEnd();
}
