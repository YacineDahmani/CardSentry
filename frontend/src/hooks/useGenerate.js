import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function buildGenerateErrorMessage(err) {
  const detail = err.response?.data?.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const parts = detail
      .map((entry) => {
        const field = Array.isArray(entry?.loc) ? entry.loc.slice(1).join('.') : '';
        return field ? `${field}: ${entry?.msg}` : entry?.msg;
      })
      .filter(Boolean);

    if (parts.length > 0) return parts.join(' | ');
  }

  if (err.code === 'ERR_NETWORK') {
    return 'Cannot reach API server. Start backend and verify VITE_API_URL.';
  }

  if (err.response?.status) {
    return `Generation failed (HTTP ${err.response.status}).`;
  }

  return err.message || 'Generation request failed';
}

export function useGenerate() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generate(count, brand, type, options = {}) {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/generate`, {
        count,
        brand,
        type,
        ...options,
      });
      setCards((prev) => [...response.data, ...prev]);
      return response.data;
    } catch (err) {
      const message = buildGenerateErrorMessage(err);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }

  function clearCards() {
    setCards([]);
    setError(null);
  }

  return { cards, loading, error, generate, clearCards };
}
