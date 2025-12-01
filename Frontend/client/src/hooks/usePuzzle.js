import { useState, useEffect } from 'react';

export function usePuzzle(id, defaultData) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/puzzles/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json.data);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch puzzle ${id}:`, err);
        setError(err.message);
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzle();
  }, [id, defaultData]);

  const savePuzzle = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:3001/api/puzzles/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedData }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(updatedData);
      return { success: true };
    } catch (err) {
      console.error(`Failed to save puzzle ${id}:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return { data, loading, error, savePuzzle };
}
