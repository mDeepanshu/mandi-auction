import config from "../constants/config";

// Hindi announcements, assembled from a closed alphabet of pre-rendered clips.
//
// Every announcement is a sequence of ~10 tokens, and the set of tokens that
// can ever appear is finite (100 irregular numerals + 4 scale words + a handful
// of fixed phrases), so the clips are rendered once by the backend seed script
// and stored in Supabase. Here we only ever look them up, cache them in
// IndexedDB, and stitch them together with the Web Audio API.
//
// That means: no TTS API key in this bundle, no per-announcement API cost, and
// announcements keep working when the mandi wifi drops.

// the configured base carries a trailing slash in some .env variants, and these
// are raw fetch() calls rather than axios, so nothing normalizes it for us —
// "http://localhost:3000//tts/manifest" would not match the Lambda's route
const API_BASE = String(config.mandiLambdaApiUrl || "").replace(/\/+$/, "");

const MANIFEST_URL = `${API_BASE}/tts/manifest`;
const ENSURE_CLIPS_URL = `${API_BASE}/tts/clips`;

// ---------------------------------------------------------------------------
// Tokens — mirrors mandi-lambda-core/src/tts/tokens.ts. Keep the two in sync;
// a token that was never seeded still works (the backend renders it on demand)
// but costs one slow announcement the first time.
// ---------------------------------------------------------------------------

const HINDI_UNITS = {
  0: "शून्य", 1: "एक", 2: "दो", 3: "तीन", 4: "चार", 5: "पांच",
  6: "छह", 7: "सात", 8: "आठ", 9: "नौ", 10: "दस", 11: "ग्यारह",
  12: "बारह", 13: "तेरह", 14: "चौदह", 15: "पंद्रह", 16: "सोलह",
  17: "सत्रह", 18: "अठारह", 19: "उन्नीस", 20: "बीस",
  21: "इक्कीस", 22: "बाईस", 23: "तेईस", 24: "चौबीस", 25: "पच्चीस",
  26: "छब्बीस", 27: "सत्ताईस", 28: "अट्ठाईस", 29: "उनतीस",
  30: "तीस",
  31: "इकतीस", 32: "बत्तीस", 33: "तैंतीस", 34: "चौंतीस", 35: "पैंतीस",
  36: "छत्तीस", 37: "सैंतीस", 38: "अड़तीस", 39: "उनतालीस",
  40: "चालीस",
  41: "इकतालीस", 42: "बयालीस", 43: "तैंतालीस", 44: "चवालीस", 45: "पैंतालीस",
  46: "छयालीस", 47: "सैंतालीस", 48: "अड़तालीस", 49: "उनचास",
  50: "पचास",
  51: "इक्यावन", 52: "बावन", 53: "तिरपन", 54: "चौवन", 55: "पचपन",
  56: "छप्पन", 57: "सत्तावन", 58: "अट्ठावन", 59: "उनसठ",
  60: "साठ",
  61: "इकसठ", 62: "बासठ", 63: "तिरसठ", 64: "चौंसठ", 65: "पैंसठ",
  66: "छयासठ", 67: "सड़सठ", 68: "अड़सठ", 69: "उनहत्तर",
  70: "सत्तर",
  71: "इकहत्तर", 72: "बहत्तर", 73: "तिहत्तर", 74: "चौहत्तर", 75: "पचहत्तर",
  76: "छिहत्तर", 77: "सतहत्तर", 78: "अठहत्तर", 79: "उनासी",
  80: "अस्सी",
  81: "इक्यासी", 82: "बयासी", 83: "तिरासी", 84: "चौरासी", 85: "पचासी",
  86: "छियासी", 87: "सतासी", 88: "अट्ठासी", 89: "नवासी",
  90: "नब्बे",
  91: "इक्यानबे", 92: "बानबे", 93: "तिरानबे", 94: "चौरानबे", 95: "पचानबे",
  96: "छियानबे", 97: "सत्तानबे", 98: "अट्ठानबे", 99: "निन्यानबे",
};

const SCALES = { hundred: "सौ", thousand: "हज़ार", lakh: "लाख", crore: "करोड़" };

const PHRASES = {
  vyapariWhose: "व्यापारी जिनका",
  idNumber: "आई डी नंबर",
  forWhom: "के लिए",
  rupeesCredited: "रुपये जमा हुए",
};

const LARGEST_SPEAKABLE = 999999999; // 99,99,99,999

/**
 * Decompose a whole number into clip tokens, Indian numbering system.
 * Returns [] when out of range, so the caller falls back instead of emitting
 * a token that was never seeded.
 */
export function numberToTokens(value) {
  const num = Math.round(Math.abs(Number(value)));
  if (!Number.isFinite(num) || num > LARGEST_SPEAKABLE) return [];
  if (num <= 99) return [HINDI_UNITS[num]];

  const split = (divisor, scale) => {
    const rest = num % divisor;
    return [
      ...numberToTokens(Math.floor(num / divisor)),
      scale,
      ...(rest ? numberToTokens(rest) : []),
    ];
  };

  if (num < 1000) return split(100, SCALES.hundred);
  if (num < 100000) return split(1000, SCALES.thousand);
  if (num < 10000000) return split(100000, SCALES.lakh);
  return split(10000000, SCALES.crore);
}

/**
 * Speak a number one digit at a time. Used for IDs: clearer than a quantity
 * over a noisy mandi PA, and it only ever touches 10 clips.
 */
export function digitsToTokens(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .split("")
    .map((d) => HINDI_UNITS[Number(d)]);
}

// ---------------------------------------------------------------------------
// IndexedDB — raw clip bytes, so a page reload does not re-download anything
// ---------------------------------------------------------------------------

const DB_NAME = "mandi-tts";
const DB_VERSION = 1;
const STORE = "clips";

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "token" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    // private browsing / blocked storage — fall through to the memory cache
    console.warn("TTS clip store unavailable, using memory cache only:", error);
    dbPromise = null;
    return null;
  });

  return dbPromise;
}

async function idbReadBytes(tokens) {
  const db = await openDb();
  if (!db) return new Map();

  return new Promise((resolve) => {
    const found = new Map();
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);

    tokens.forEach((token) => {
      const request = store.get(token);
      request.onsuccess = () => {
        if (request.result?.bytes) found.set(token, request.result.bytes);
      };
    });

    tx.oncomplete = () => resolve(found);
    tx.onerror = () => resolve(found);
  });
}

async function idbReadTokens() {
  const db = await openDb();
  if (!db) return new Set();

  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).getAllKeys();
    request.onsuccess = () => resolve(new Set(request.result));
    request.onerror = () => resolve(new Set());
  });
}

async function idbWriteBytes(records) {
  const db = await openDb();
  if (!db || !records.length) return;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    records.forEach((record) => store.put(record));
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
}

// ---------------------------------------------------------------------------
// Manifest + clip fetching
// ---------------------------------------------------------------------------

let manifestPromise = null;

/** token -> clip url, for every seeded clip. Fetched once per page load. */
function loadManifest(force = false) {
  if (!manifestPromise || force) {
    manifestPromise = fetch(MANIFEST_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Manifest request failed: ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        const clips = payload?.responseBody?.clips || [];
        return new Map(clips.map((clip) => [clip.token, clip.url]));
      })
      .catch((error) => {
        manifestPromise = null; // let the next announcement retry
        throw error;
      });
  }

  return manifestPromise;
}

/**
 * Ask the backend to render tokens the manifest does not have yet. Rare by
 * design — it only happens when this file emits a token the seed script never
 * covered — but it keeps a missing clip from breaking the announcement.
 */
async function renderMissingClips(tokens) {
  const res = await fetch(ENSURE_CLIPS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens }),
  });

  if (!res.ok) throw new Error(`Clip render failed: ${res.status}`);

  const payload = await res.json();
  return new Map((payload?.responseBody || []).map((clip) => [clip.token, clip.url]));
}

async function downloadClips(entries) {
  return Promise.all(
    entries.map(async ([token, url]) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Clip download failed for "${token}": ${res.status}`);
      return { token, bytes: await res.arrayBuffer() };
    })
  );
}

/** Fetch bytes for `tokens`, filling IndexedDB along the way. */
async function fetchClipBytes(tokens) {
  const cached = await idbReadBytes(tokens);
  const missing = tokens.filter((token) => !cached.has(token));
  if (!missing.length) return cached;

  const manifest = await loadManifest();
  const resolved = missing.filter((token) => manifest.has(token));
  const unseeded = missing.filter((token) => !manifest.has(token));

  const urls = resolved.map((token) => [token, manifest.get(token)]);

  if (unseeded.length) {
    const rendered = await renderMissingClips(unseeded);
    rendered.forEach((url, token) => {
      manifest.set(token, url);
      urls.push([token, url]);
    });
  }

  const downloaded = await downloadClips(urls);
  await idbWriteBytes(downloaded);
  downloaded.forEach(({ token, bytes }) => cached.set(token, bytes));

  return cached;
}

// ---------------------------------------------------------------------------
// Playback
// ---------------------------------------------------------------------------

// Clips are stored with their silence trimmed, so back-to-back scheduling on a
// single timeline is what makes a stitched sequence sound like one sentence.
// A tiny gap keeps word boundaries from slurring together.
const WORD_GAP_SECONDS = 0.02;

const decodedCache = new Map();
let audioContext = null;
let activeSources = [];

function getAudioContext() {
  if (!audioContext) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio API unavailable");
    audioContext = new Ctor();
  }
  return audioContext;
}

function stopPlayback() {
  activeSources.forEach((source) => {
    try {
      source.stop();
    } catch {
      // already finished
    }
  });
  activeSources = [];
}

async function decodeTokens(tokens) {
  const needed = [...new Set(tokens)].filter((token) => !decodedCache.has(token));

  if (needed.length) {
    const ctx = getAudioContext();
    const bytesByToken = await fetchClipBytes(needed);

    await Promise.all(
      needed.map(async (token) => {
        const bytes = bytesByToken.get(token);
        if (!bytes) throw new Error(`No audio for token "${token}"`);
        // decodeAudioData detaches its input, so hand it a copy — the original
        // stays reusable if a later decode has to be retried
        decodedCache.set(token, await ctx.decodeAudioData(bytes.slice(0)));
      })
    );
  }

  return tokens.map((token) => decodedCache.get(token));
}

async function playTokens(tokens) {
  const buffers = await decodeTokens(tokens);
  const ctx = getAudioContext();

  // browsers suspend contexts created outside a gesture
  if (ctx.state === "suspended") await ctx.resume();

  stopPlayback();

  // small lead-in so the first clip is not clipped by scheduling jitter
  let at = ctx.currentTime + 0.05;
  const scheduled = [];

  buffers.forEach((buffer) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(at);
    at += buffer.duration + WORD_GAP_SECONDS;
    scheduled.push(source);
  });

  if (!scheduled.length) return;

  activeSources = scheduled;

  await new Promise((resolve) => {
    scheduled[scheduled.length - 1].onended = resolve;
  });

  // a newer announcement may have taken over while this one was playing —
  // only clear the list if it is still ours
  if (activeSources === scheduled) activeSources = [];
}

/** Last resort: the OS voice. Robotic, but it always says the number. */
function speakViaWebSpeech(text) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const hindiVoice = synth
    .getVoices()
    .find((v) => v.name === "Microsoft Kalpana - Hindi (India)");
  if (hindiVoice) utterance.voice = hindiVoice;

  utterance.lang = "hi-IN";
  utterance.rate = 0.85;
  utterance.pitch = 1;

  synth.speak(utterance);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Download every seeded clip into IndexedDB. Call once at app start: it is
 * ~5 MB across ~115 files, after which announcements are instant and survive
 * losing the network.
 */
export async function preloadAnnouncements() {
  try {
    const manifest = await loadManifest();
    const stored = await idbReadTokens();
    const missing = [...manifest.entries()].filter(([token]) => !stored.has(token));

    if (!missing.length) return;

    const downloaded = await downloadClips(missing);
    await idbWriteBytes(downloaded);
  } catch (error) {
    // not fatal — announcements fetch what they need on demand
    console.warn("TTS preload failed:", error);
  }
}

/**
 * "व्यापारी जिनका आई डी नंबर <id> के लिए <amount> रुपये जमा हुए"
 *
 * `vyapariName` is accepted for call-site compatibility but deliberately not
 * spoken — arbitrary names cannot come from a closed clip alphabet.
 */
export const speakCreditEntry = async ({ amount, vyapariId }) => {
  const amountTokens = numberToTokens(amount);
  const idTokens = digitsToTokens(vyapariId);

  const tokens = [
    PHRASES.vyapariWhose,
    PHRASES.idNumber,
    ...idTokens,
    PHRASES.forWhom,
    ...amountTokens,
    PHRASES.rupeesCredited,
  ];

  const spokenText =
    `${PHRASES.vyapariWhose}, ${PHRASES.idNumber} ${idTokens.join(" ")}, ` +
    `${PHRASES.forWhom} ${amountTokens.join(" ")} ${PHRASES.rupeesCredited}|`;

  // an amount outside the alphabet has no clips to stitch
  if (!amountTokens.length) {
    speakViaWebSpeech(`${PHRASES.forWhom} ${amount} ${PHRASES.rupeesCredited}`);
    return;
  }

  try {
    await playTokens(tokens);
  } catch (error) {
    console.error("Clip playback failed, falling back to Web Speech API:", error);
    stopPlayback();
    speakViaWebSpeech(spokenText);
  }
};
