import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function buildErrorMessage(err, fallback) {
  const detail = err?.response?.data?.detail;

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

  if (err?.code === 'ERR_NETWORK') {
    return 'Cannot reach API server. Start backend and verify VITE_API_URL.';
  }

  return fallback;
}

export function useFakeAddress() {
  const [countries, setCountries] = useState([]);
  const [identity, setIdentity] = useState(null);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingIdentity, setLoadingIdentity] = useState(false);
  const [error, setError] = useState(null);

  async function fetchCountries() {
    setLoadingCountries(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/fake-address/countries`);
      setCountries(response.data || []);
      return response.data || [];
    } catch (err) {
      const message = buildErrorMessage(err, 'Failed to load country list.');
      setError(message);
      return [];
    } finally {
      setLoadingCountries(false);
    }
  }

  async function generateIdentity(countryCode) {
    setLoadingIdentity(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/fake-address/generate`, {
        params: { country: countryCode },
      });
      setIdentity(response.data);
      return response.data;
    } catch (err) {
      const message = buildErrorMessage(err, 'Failed to generate fake address.');
      setError(message);
      return null;
    } finally {
      setLoadingIdentity(false);
    }
  }

  return {
    countries,
    identity,
    loadingCountries,
    loadingIdentity,
    error,
    fetchCountries,
    generateIdentity,
  };
}
