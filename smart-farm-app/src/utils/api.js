const sanitizeBaseUrl = () => {
  const rawBase = import.meta.env.VITE_API_BASE_URL || '';
  const trimmed = rawBase.trim().replace(/\/+$/, '');
  return trimmed || '';
};

export const buildApiUrl = (path = '') => {
  const base = sanitizeBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};
