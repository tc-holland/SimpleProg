import Puzzle from './Puzzle';
import { usePuzzle } from '../hooks/usePuzzle';

const defaultData = {
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
};

export default function Puzzle2() {
  const { data } = usePuzzle('puzzle2', defaultData);
  return (
    <Puzzle
      puzzleData={data}
      title="Write a Function"
      subtitle="Drag each code segment to the correct line to make an addition function"
    />
  );
}
