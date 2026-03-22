import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useValidate() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function validate(cards) {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const response = await axios.post(`${API_BASE}/validate`, { cards });
      setResults(response.data);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || 'Validation request failed';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }

  function clearResults() {
    setResults([]);
    setError(null);
  }

  return { results, loading, error, validate, clearResults };
}
