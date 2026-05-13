const express = require('express');
const { translate } = require('@vitalets/google-translate-api');

const router = express.Router();

const translationEndpoints = [
  process.env.TRANSLATION_API_URL,
  'https://translate.argosopentech.com/translate',
  'https://libretranslate.de/translate',
  'https://api.mymemory.translated.net/get'
].filter(Boolean);

const normalizeLanguage = (language) => {
  if (!language || language === 'auto') {
    return 'auto';
  }

  return String(language).toLowerCase().split('-')[0];
};

const isUsefulTranslation = (sourceText, translatedText, targetLang) => {
  if (typeof translatedText !== 'string' || !translatedText.trim()) return false;
  if (targetLang === 'en') return true;
  return translatedText.trim().toLowerCase() !== String(sourceText || '').trim().toLowerCase();
};

const translateWithEndpoint = async (endpoint, text, target, source) => {
  if (endpoint.includes('api.mymemory.translated.net/get')) {
    const langPair = `${source === 'auto' ? 'en' : source}|${target}`;
    const url = `${endpoint}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Translation API responded with ${response.status}`);
    }

    const data = await response.json();
    const translated = data?.responseData?.translatedText;
    if (isUsefulTranslation(text, translated, target)) {
      return translated;
    }

    throw new Error('Unexpected translation API response');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: text,
      source,
      target,
      format: 'text'
    })
  });

  if (!response.ok) {
    throw new Error(`Translation API responded with ${response.status}`);
  }

  let data;
  try {
    data = await response.clone().json();
  } catch {
    const raw = await response.text();
    throw new Error(`Non-JSON translation response: ${raw.slice(0, 80)}`);
  }
  if (isUsefulTranslation(text, data.translatedText, target)) {
    return data.translatedText;
  }

  if (isUsefulTranslation(text, data?.responseData?.translatedText, target)) {
    return data.responseData.translatedText;
  }

  throw new Error('Unexpected translation API response');
};

const translateText = async (text, target, source = 'auto', options = {}) => {
  if (typeof text !== 'string' || !text.trim()) {
    return text;
  }

  const normalizedTarget = normalizeLanguage(target);
  const normalizedSource = normalizeLanguage(source);

  if (normalizedTarget === normalizedSource && normalizedSource !== 'auto') {
    return text;
  }

  const errors = [];

  // If caller requests Google directly, skip other endpoints and use google wrapper.
  if (options && options.forceGoogle) {
    try {
      const sourceForGoogle = normalizedSource === 'auto' ? undefined : normalizedSource;
      const result = await translate(text, { to: normalizedTarget, from: sourceForGoogle });
      if (isUsefulTranslation(text, result?.text, normalizedTarget)) {
        return result.text;
      }
      errors.push('Google returned unusable translation');
    } catch (error) {
      errors.push(error.message);
    }
    return text;
  }

  for (const endpoint of translationEndpoints) {
    try {
      return await translateWithEndpoint(endpoint, text, normalizedTarget, normalizedSource);
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Final fallback: Google Translate web endpoint wrapper.
  try {
    const sourceForGoogle = normalizedSource === 'auto' ? undefined : normalizedSource;
    const result = await translate(text, { to: normalizedTarget, from: sourceForGoogle });
    if (isUsefulTranslation(text, result?.text, normalizedTarget)) {
      return result.text;
    }
  } catch (error) {
    errors.push(error.message);
  }

  if (errors.length > 0) {
    return text;
  }

  throw new Error('Translation failed');
};

router.post('/', async (req, res) => {
  const { text, texts, target = 'en', source = 'auto', forceGoogle = false } = req.body || {};
  const inputTexts = Array.isArray(texts)
    ? texts
    : typeof text === 'string'
      ? [text]
      : [];

  if (inputTexts.length === 0) {
    return res.status(400).json({ message: 'text or texts is required' });
  }

  const translations = [];
  const errors = [];

  for (const entry of inputTexts) {
    try {
      translations.push(await translateText(entry, target, source, { forceGoogle }));
    } catch (error) {
      // Keep partial success: fallback to source text when one segment fails.
      translations.push(entry);
      errors.push(error.message);
    }
  }

  return res.json({
    target: normalizeLanguage(target),
    source: normalizeLanguage(source),
    translations,
    translation: translations[0] || '',
    partialFailure: errors.length > 0,
    failedCount: errors.length
  });
});

module.exports = router;