import { useDrop } from 'react-dnd';
import { X } from 'lucide-react';

export function DropZone({ blankId, word, wordColor, onDrop, onRemove, showResults, isCorrect, isIncorrect, isLocked }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'word',
    drop: (item) => {
      onDrop(blankId, item.word);
    },
    canDrop: () => !word || !isLocked, // Only allow drop if the zone is empty or not locked
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const getBorderColor = () => {
    if (isLocked && isCorrect) return 'border-green-500 bg-green-100';
    if (showResults && isIncorrect) return 'border-red-500 bg-red-100';
    if (isOver && canDrop) return 'border-indigo-500 bg-indigo-50';
    if (word) return 'border-indigo-300 bg-indigo-50';
    return 'border-slate-300 bg-slate-50';
  };

  const getTextColor = () => {
    if (isLocked && isCorrect) return 'text-green-700';
    if (showResults && isIncorrect) return 'text-red-700';
    return 'text-indigo-700';
  };

  return (
    <div
      ref={drop}
      className={`inline-flex items-center justify-center min-w-[120px] h-10 px-3 border-2 border-dashed rounded-lg transition-all ${getBorderColor()} blank-box ${word ? 'filled' : 'empty'}`}
    >
      {word ? (
        <div className="flex items-center gap-2">
          <div className={`word-box in-blank ${getTextColor()} inline-word-with-remove`} style={{ backgroundColor: wordColor || undefined }}>
            <span className="word-text">{word}</span>
            {!isLocked && (
              <button
                onClick={() => onRemove(blankId)}
                className="remove-in-blank"
                aria-label="Remove word"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <span className="text-slate-400 text-sm">
          {isOver && canDrop ? 'Drop here' : 'blank'}
        </span>
      )}
    </div>
  );
}
