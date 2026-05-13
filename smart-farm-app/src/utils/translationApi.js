import { buildApiUrl } from './api';

const translationCache = new Map();

const normalizeLanguage = (language) => {
  if (!language) {
    return 'en';
  }

  return String(language).toLowerCase().split('-')[0];
};

const makeCacheKey = (text, targetLanguage, sourceLanguage) => `${sourceLanguage || 'auto'}::${targetLanguage}::${text}`;

export const translateTexts = async (texts, targetLanguage, sourceLanguage = 'auto') => {
  const target = normalizeLanguage(targetLanguage);
  const source = normalizeLanguage(sourceLanguage);
  const items = Array.isArray(texts) ? texts : [texts];

  const response = await fetch(buildApiUrl('/api/translate'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      texts: items,
      target,
      source
    })
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.translations) ? data.translations : items;
};

export const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
  if (typeof text !== 'string' || !text.trim()) {
    return text;
  }

  const target = normalizeLanguage(targetLanguage);
  const source = normalizeLanguage(sourceLanguage);
  const cacheKey = makeCacheKey(text, target, source);

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const [translation] = await translateTexts([text], target, source);
    const translatedText = translation || text;
    translationCache.set(cacheKey, translatedText);
    return translatedText;
  } catch (error) {
    console.error('Translation API error:', error);
    translationCache.set(cacheKey, text);
    return text;
  }
};

export const translateFieldMap = async (fields, targetLanguage, sourceLanguage = 'auto') => {
  const keys = Object.keys(fields || {});
  const values = keys.map((key) => fields[key]);
  const translatedValues = await translateTexts(values, targetLanguage, sourceLanguage);

  return keys.reduce((accumulator, key, index) => {
    accumulator[key] = translatedValues[index] || fields[key];
    return accumulator;
  }, {});
};