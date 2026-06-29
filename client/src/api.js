// In production: set VITE_API_BASE to your Render backend URL in Vercel env settings
// e.g. https://snaplink-api.onrender.com/api
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const shortenUrl = async (longUrl, expiresInDays) => {
  const response = await fetch(`${API_BASE}/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      longUrl,
      expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
    }),
  });
  const data = await response.json();
  return { data, status: response.status, ok: response.ok };
};

export const fetchAnalyticsSummary = async (code) => {
  const res = await fetch(`${API_BASE}/analytics/${code}`);
  const data = await res.json();
  return { data, ok: res.ok };
};

export const fetchCountries = async (code) => {
  const res = await fetch(`${API_BASE}/analytics/${code}/countries`);
  return res.json();
};

export const fetchDevices = async (code) => {
  const res = await fetch(`${API_BASE}/analytics/${code}/devices`);
  return res.json();
};
