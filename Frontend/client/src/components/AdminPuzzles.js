import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuzzle } from '../hooks/usePuzzle';
import Puzzle from './Puzzle';

const defaultPuzzles = {
  puzzle1: {
    sentences: [
      {
        id: 1,
        parts: [
          { id: 1, correctWord: 'def' },
          'fib(n):\n\tif ',
          { id: 2, correctWord: 'n' },
          '== 0:\n\t\treturn 0\n\telif n ',
          { id: 3, correctWord: '==' },
          ' 1:\n\t\treturn 1\n\telse:\n\t\treturn ',
          { id: 4, correctWord: 'fib' },
          '(n-1) + fib(n-2)',
        ],
      },
    ],
    words: ['def', 'fib', 'n', '=='],
  },
  puzzle2: {
    sentences: [
      {
        id: 1,
        parts: [
          'Line 1: ',
          { id: 1, correctWord: 'def add(a, b)' },
          '\nLine 2: \t',
          { id: 2, correctWord: 'c = a + b' },
          '\nLine 3: \t',
          { id: 3, correctWord: 'return c' },
        ],
      },
    ],
    words: ['return c', 'def add(a, b)', 'c = a + b'],
  },
  puzzle3: {
    sentences: [
      {
        id: 1,
        parts: [
          'Line 1: ',
          { id: 1, correctWord: 'def isPalindrome(str):' },
          '\nLine 2: \t',
          { id: 2, correctWord: 'cleaned = ""' },
          '\nLine 3: \t',
          { id: 3, correctWord: 'for c in str.lower():' },
          '\nLine 4: \t\t',
          { id: 4, correctWord: 'if c.isalnum():' },
          '\nLine 5: \t\t\t',
          { id: 5, correctWord: 'cleaned += c' },
          '\nLine 6: \t',
          { id: 6, correctWord: 'return cleaned == cleaned[::-1' },
        ],
      },
    ],
    words: [
      'return cleaned == cleaned[::-1',
      'def isPalindrome(str):',
      'if c.isalnum():',
      'cleaned += c',
      'for c in str.lower():',
      'cleaned = ""',
    ],
  },
};

export default function AdminPuzzles() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('puzzle1');
  const { data, loading, error, savePuzzle } = usePuzzle(activeId, defaultPuzzles[activeId]);
  const [json, setJson] = useState(JSON.stringify(data, null, 2));
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleApply = async () => {
    try {
      const parsed = JSON.parse(json);
      const result = await savePuzzle(parsed);
      if (result.success) {
        setSaveSuccess(true);
        setSaveError(null);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error || 'Failed to save');
      }
    } catch (e) {
      setSaveError(e.message);
    }
  };

  const handleReset = () => {
    setJson(JSON.stringify(defaultPuzzles[activeId], null, 2));
  };

  const handleTabChange = (id) => {
    setActiveId(id);
    setJson(JSON.stringify(defaultPuzzles[id], null, 2));
    setSaveError(null);
    setSaveSuccess(false);
  };

  if (loading) return <div style={{ padding: 20 }}>Loading puzzle...</div>;

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ flex: 1 }}>
        <h1>Puzzle Editor</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['puzzle1', 'puzzle2', 'puzzle3'].map((id) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              style={{
                padding: '8px 16px',
                backgroundColor: activeId === id ? '#4f46e5' : '#ddd',
                color: activeId === id ? 'white' : 'black',
                cursor: 'pointer',
                border: 'none',
                borderRadius: 4,
                fontWeight: activeId === id ? 'bold' : 'normal',
              }}
            >
              {id}
            </button>
          ))}
        </div>

        <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: '#666' }}>
          Puzzle JSON:
        </label>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          style={{
            width: '100%',
            height: 500,
            fontFamily: 'monospace',
            fontSize: 12,
            padding: 8,
            border: '1px solid #ccc',
            borderRadius: 4,
            boxSizing: 'border-box',
          }}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={handleApply}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: 'white',
              cursor: 'pointer',
              border: 'none',
              borderRadius: 4,
              fontWeight: 'bold',
            }}
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              backgroundColor: '#999',
              color: 'white',
              cursor: 'pointer',
              border: 'none',
              borderRadius: 4,
            }}
          >
            Reset to Default
          </button>
          <button
            onClick={() => navigate('/teacher-dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#22c55e',
              color: 'white',
              cursor: 'pointer',
              border: 'none',
              borderRadius: 4,
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && <div style={{ color: 'red', marginTop: 12, fontSize: 12 }}>Fetch error: {error}</div>}
        {saveError && <div style={{ color: 'red', marginTop: 12, fontSize: 12 }}>Save error: {saveError}</div>}
        {saveSuccess && <div style={{ color: 'green', marginTop: 12, fontSize: 12 }}>✓ Puzzle saved!</div>}
      </div>

      <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: 20, maxHeight: '100vh', overflowY: 'auto' }}>
        <h2>Live Preview</h2>
        <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 12, backgroundColor: 'white' }}>
          {json ? (
            <Puzzle puzzleData={JSON.parse(json)} title={activeId} isPreview={true} />
          ) : (
            <p>Invalid JSON</p>
          )}
        </div>
      </div>
    </div>
  );
}
