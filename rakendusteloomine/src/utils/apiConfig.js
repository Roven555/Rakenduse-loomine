const DEFAULT_API_URL = 'http://localhost:5000';

const isPlaceholder = (value) => /^\[.*\]$/.test(value);

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiUrl = rawApiUrl && !isPlaceholder(rawApiUrl)
  ? rawApiUrl.replace(/\/$/, '')
  : DEFAULT_API_URL;

export const API_BASE_URL = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
