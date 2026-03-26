import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function buildValidateErrorMessage(err, statusCode) {
  if (err instanceof SyntaxError) {
    return 'Received malformed or incomplete data stream from the validation server.';
  }

  const message = typeof err?.message === 'string' ? err.message.trim() : '';

  if (message) {
    if (/Failed to fetch/i.test(message) || /NetworkError/i.test(message)) {
      return 'Cannot reach API server. Start backend and verify VITE_API_URL.';
    }
    return message;
  }

  if (statusCode) {
    return `Validation failed (HTTP ${statusCode}).`;
  }

  return 'Validation request failed due to an unknown error.';
}

export function useValidate() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function validate(cards) {
    setLoading(true);
    setError(null);
    setResults([]);
    let responseStatus = null;
    try {
      const response = await fetch(`${API_BASE}/validate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      });
      responseStatus = response.status;

      if (!response.ok) {
        let detail = null;
        try {
          const payload = await response.json();
          if (typeof payload?.detail === 'string') {
            detail = payload.detail;
          } else if (Array.isArray(payload?.detail)) {
            detail = payload.detail
              .map((entry) => {
                const field = Array.isArray(entry?.loc) ? entry.loc.slice(1).join('.') : '';
                return field ? `${field}: ${entry?.msg}` : entry?.msg;
              })
              .filter(Boolean)
              .join(' | ');
          }
        } catch {
          detail = null;
        }
        throw new Error(detail || `Validation failed with status ${response.status}`);
      }

      if (!response.body) {
        const fallback = await response.json();
        setResults(fallback);
        return fallback;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const collected = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const payload = line.trim();
          if (!payload) continue;

          const item = JSON.parse(payload);
          collected.push(item);
          setResults((prev) => [...prev, item]);
        }
      }

      buffer += decoder.decode();
      const tail = buffer.trim();
      if (tail) {
        const item = JSON.parse(tail);
        collected.push(item);
        setResults((prev) => [...prev, item]);
      }

      return collected;
    } catch (err) {
      const message = buildValidateErrorMessage(err, responseStatus);
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
