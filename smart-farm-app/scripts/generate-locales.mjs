import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const appRoot = path.resolve(process.cwd());
const i18nPath = path.join(appRoot, 'src', 'i18n.js');
const localesDir = path.join(appRoot, 'src', 'locales');

const extractObjectLiteral = (source, marker) => {
  const markerIdx = source.indexOf(marker);
  if (markerIdx === -1) throw new Error(`Marker not found: ${marker}`);

  const start = source.indexOf('{', markerIdx);
  if (start === -1) throw new Error(`Opening brace not found for marker: ${marker}`);

  let i = start;
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (; i < source.length; i++) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error(`Could not parse object literal for marker: ${marker}`);
};

const flattenObject = (obj, prefix = '') => {
  const result = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result.push(...flattenObject(value, fullKey));
    } else {
      result.push({ path: fullKey, value: String(value) });
    }
  }
  return result;
};

const setNestedValue = (obj, dottedPath, value) => {
  const parts = dottedPath.split('.');
  let cursor = obj;
  for (let idx = 0; idx < parts.length - 1; idx++) {
    const part = parts[idx];
    if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
};

const BATCH_SIZE = 40;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const translateBatch = async (texts, target, attempt = 1) => {
  try {
    const controller = new AbortController();
    const timeoutMs = 60000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch('http://localhost:5001/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, target, source: 'en' }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Translation endpoint returned ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data.translations)) {
      throw new Error('Invalid translation response format');
    }

    return data.translations;
  } catch (error) {
    if (attempt >= 5) {
      throw error;
    }
    const backoff = 1000 * Math.pow(2, attempt - 1);
    await sleep(backoff);
    return translateBatch(texts, target, attempt + 1);
  }
};

const translateBundle = async (texts, target) => {
  const output = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const translated = await translateBatch(batch, target);
    output.push(...translated);
    process.stdout.write(`Translated ${Math.min(i + BATCH_SIZE, texts.length)}/${texts.length} for ${target}\n`);
  }
  return output;
};

const source = await fs.readFile(i18nPath, 'utf8');
const enLiteral = extractObjectLiteral(source, 'const enTranslation =');
const enTranslation = vm.runInNewContext(`(${enLiteral})`);

const flat = flattenObject(enTranslation);
const texts = flat.map((entry) => entry.value);

const [frValues, arValues] = await Promise.all([
  translateBundle(texts, 'fr'),
  translateBundle(texts, 'ar')
]);

const frObject = {};
const arObject = {};

for (let i = 0; i < flat.length; i++) {
  setNestedValue(frObject, flat[i].path, frValues[i] ?? flat[i].value);
  setNestedValue(arObject, flat[i].path, arValues[i] ?? flat[i].value);
}

await fs.mkdir(localesDir, { recursive: true });
await fs.writeFile(path.join(localesDir, 'fr.json'), `${JSON.stringify(frObject, null, 2)}\n`);
await fs.writeFile(path.join(localesDir, 'ar.json'), `${JSON.stringify(arObject, null, 2)}\n`);

console.log('Generated src/locales/fr.json and src/locales/ar.json');

// Second pass: detect untranslated entries (where target equals source)
const frPath = path.join(localesDir, 'fr.json');
const arPath = path.join(localesDir, 'ar.json');
const frCurrent = JSON.parse(await fs.readFile(frPath, 'utf8'));
const arCurrent = JSON.parse(await fs.readFile(arPath, 'utf8'));

const needsFr = [];
const needsAr = [];

for (let i = 0; i < flat.length; i++) {
  const key = flat[i].path;
  const src = flat[i].value;
  // get nested value from current
  const getNested = (obj, dotted) => dotted.split('.').reduce((s,k)=>s && s[k], obj);
  const frVal = getNested(frCurrent, key);
  const arVal = getNested(arCurrent, key);
  if (String(frVal || '').trim() === String(src || '').trim()) needsFr.push({ idx: i, text: src, path: key });
  if (String(arVal || '').trim() === String(src || '').trim()) needsAr.push({ idx: i, text: src, path: key });
}

const retranslate = async (items, target) => {
  if (items.length === 0) return [];
  const CHUNK = 20;
  const out = [];
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const texts = chunk.map(x => x.text);
    const maxAttempts = 4;
    let translated = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), 45000 * attempt);
        const res = await fetch('http://localhost:5001/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, target, source: 'en', forceGoogle: true }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`ForceGoogle translate failed: ${res.status}`);
        const js = await res.json();
        translated = js.translations || [];
        break;
      } catch (e) {
        if (attempt === maxAttempts) throw e;
        await sleep(1000 * attempt);
      }
    }
    out.push(...(translated || texts));
  }
  return out;
};

try {
  if (needsFr.length) {
    const frNew = await retranslate(needsFr, 'fr');
    for (let i = 0; i < needsFr.length; i++) {
      setNestedValue(frCurrent, needsFr[i].path, frNew[i] || needsFr[i].text);
    }
    await fs.writeFile(frPath, `${JSON.stringify(frCurrent, null, 2)}\n`);
    console.log(`Patched ${needsFr.length} fr entries`);
  }
  if (needsAr.length) {
    const arNew = await retranslate(needsAr, 'ar');
    for (let i = 0; i < needsAr.length; i++) {
      setNestedValue(arCurrent, needsAr[i].path, arNew[i] || needsAr[i].text);
    }
    await fs.writeFile(arPath, `${JSON.stringify(arCurrent, null, 2)}\n`);
    console.log(`Patched ${needsAr.length} ar entries`);
  }
} catch (e) {
  console.error('Second-pass retranslation failed:', e.message);
}
