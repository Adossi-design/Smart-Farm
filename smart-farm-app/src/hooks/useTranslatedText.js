import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateFieldMap, translateText } from '../utils/translationApi';

const normalizeLanguage = (language) => {
  if (!language) {
    return 'en';
  }

  return String(language).toLowerCase().split('-')[0];
};

export const useTranslatedText = (text, options = {}) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text || '');

  const targetLanguage = normalizeLanguage(options.targetLanguage || i18n.language);
  const sourceLanguage = options.sourceLanguage || 'auto';
  const enabled = options.enabled !== false;

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!enabled || typeof text !== 'string' || !text.trim()) {
        setTranslatedText(text || '');
        return;
      }

      const translated = await translateText(text, targetLanguage, sourceLanguage);
      if (active) {
        setTranslatedText(translated || text);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [enabled, sourceLanguage, targetLanguage, text]);

  return translatedText;
};

export const useTranslatedFields = (fields, options = {}) => {
  const { i18n } = useTranslation();
  const [translatedFields, setTranslatedFields] = useState(fields || {});

  const targetLanguage = normalizeLanguage(options.targetLanguage || i18n.language);
  const sourceLanguage = options.sourceLanguage || 'auto';
  const enabled = options.enabled !== false;

  const normalizedFields = useMemo(() => fields || {}, [fields]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!enabled) {
        setTranslatedFields(normalizedFields);
        return;
      }

      const keys = Object.keys(normalizedFields);
      const values = keys.map((key) => normalizedFields[key]);

      if (values.length === 0) {
        setTranslatedFields({});
        return;
      }

      const translatedValues = await translateFieldMap(normalizedFields, targetLanguage, sourceLanguage);

      if (active) {
        setTranslatedFields(translatedValues);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [enabled, normalizedFields, sourceLanguage, targetLanguage]);

  return translatedFields;
};