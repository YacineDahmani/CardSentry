import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useGenerate() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generate(count, brand, type) {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/generate`, {
        count,
        brand,
        type,
      });
      setCards((prev) => [...response.data, ...prev]);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || 'Generation request failed';
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
