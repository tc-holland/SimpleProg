import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState, useMemo } from 'react';
import { DropZone } from './DropZone';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { useDrag } from 'react-dnd';
import { useNavigate } from 'react-router-dom';
import './puzzle1.css';

export default function Puzzle({ puzzleData, title = 'Fill in the Blanks', subtitle, isPreview = false }) {
  const data = puzzleData || { sentences: [], words: [] };
  const [droppedWords, setDroppedWords] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [lockedBlanks, setLockedBlanks] = useState(new Set());
  const navigate = useNavigate();

  const InlineDraggableWord = ({ word }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'word',
      item: { word },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    return (
      <div
        ref={drag}
        className={
          'px-4 py-2 text-white rounded-lg cursor-move select-none transition-all hover:shadow-md word-box ' +
          (isDragging ? 'opacity-50 scale-95' : 'opacity-100')
        }
        style={{ backgroundColor: (colorMap && colorMap[word]) || '#4f46e5' }}
      >
        {word}
      </div>
    );
  };

  const colorMap = useMemo(() => {
    const map = {};
    const randomColor = () => {
      const h = Math.floor(Math.random() * 360);
      const s = 65 + Math.floor(Math.random() * 15);
      const l = 45 + Math.floor(Math.random() * 7);
      return `hsl(${h} ${s}% ${l}%)`;
    };
    (data.words || []).forEach((w) => {
      map[w] = randomColor();
    });
    return map;
  }, [(data.words || []).join(',')]);

  const handleDrop = (blankId, word) => {
    setDroppedWords((prev) => ({ ...prev, [blankId]: word }));
    setShowResults(false);
  };

  const handleRemove = (blankId) => {
    if (lockedBlanks.has(blankId)) return;

    setDroppedWords((prev) => {
      const newState = { ...prev };
      delete newState[blankId];
      return newState;
    });
    setShowResults(false);
  };

  const usedWords = new Set(Object.values(droppedWords));
  const availableWords = (data.words || []).filter((word) => !usedWords.has(word));

  const checkAnswers = () => {
    setShowResults(true);
    const newLockedBlanks = new Set();
    (data.sentences || []).forEach((sentence) => {
      sentence.parts.forEach((part) => {
        if (typeof part === 'object' && droppedWords[part.id] === part.correctWord) {
          newLockedBlanks.add(part.id);
        }
      });
    });
    setLockedBlanks(newLockedBlanks);
  };

  const reset = () => {
    setDroppedWords({});
    setShowResults(false);
    setLockedBlanks(new Set());
  };

  const allCorrect = (data.sentences || []).every((sentence) =>
    sentence.parts.every((part) => {
      if (typeof part === 'object') return droppedWords[part.id] === part.correctWord;
      return true;
    })
  );

  const allFilled = (data.sentences || []).every((sentence) =>
    sentence.parts.every((part) => {
      if (typeof part === 'object') return droppedWords[part.id] !== undefined;
      return true;
    })
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg">
        <div className="container">
          <button className="container-close" aria-label="Close" onClick={() => !isPreview && navigate('/dashboard')} disabled={isPreview}>
            ×
          </button>
          <div className="title">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <div className="finblank">
            <div>
              {(data.sentences || []).map((sentence) => (
                <div key={sentence.id} className="s1">
                  {sentence.parts.map((part, index) => {
                    if (typeof part === 'string') {
                      const normalized = part.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                      return (
                        <span key={sentence.id + '-' + index} className="sentence-text">
                          {normalized}
                        </span>
                      );
                    } else {
                      const isCorrect = droppedWords[part.id] === part.correctWord;
                      const isIncorrect = showResults && droppedWords[part.id] && !isCorrect;

                      return (
                        <DropZone
                          key={part.id}
                          blankId={part.id}
                          word={droppedWords[part.id]}
                          wordColor={droppedWords[part.id] ? colorMap[droppedWords[part.id]] : undefined}
                          onDrop={handleDrop}
                          onRemove={handleRemove}
                          showResults={showResults}
                          isCorrect={isCorrect}
                          isIncorrect={isIncorrect}
                          isLocked={lockedBlanks.has(part.id)}
                        />
                      );
                    }
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="word-bank bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-slate-700 mb-4">Word Bank</h2>
            <div className="bank-list flex flex-wrap gap-3">
              {availableWords.length > 0 ? (
                availableWords.map((word, index) => (
                  <InlineDraggableWord key={word + '-' + index} word={word} />
                ))
              ) : (
                <p className="text-slate-400 italic">All words have been used</p>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <div className="action-buttons">
              <button onClick={checkAnswers} disabled={!allFilled} className="action-button gap-2">
                <CheckCircle2 className="size-4" />
                Check Answers
              </button>
              <button onClick={reset} variant="outline" className="action-button gap-2">
                <RotateCcw className="size-4" />
                Reset
              </button>
            </div>
          </div>

          {showResults && (
            <div
              className={
                'mt-6 p-6 rounded-lg ' +
                (allCorrect
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-amber-50 border-2 border-amber-200') +
                ' results-block'
              }
            >
              <div className="flex items-center justify-center gap-4">
                {allCorrect ? (
                  <>
                    <CheckCircle2 className="size-6 text-green-600" />
                    <p className="result-message text-green-800">Perfect! All answers are correct! 🎉</p>
                    {showResults && allCorrect && (
                      <button className="return-button" onClick={() => !isPreview && navigate('/dashboard')} disabled={isPreview}>
                        Return to Dashboard
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <XCircle className="size-6 text-amber-600" />
                    <p className="text-amber-800">Some answers are incorrect. Try again!</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
