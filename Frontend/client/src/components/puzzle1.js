import Puzzle from './Puzzle';
import { usePuzzle } from '../hooks/usePuzzle';

const defaultData = {
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
};

export default function Puzzle1() {
  const { data } = usePuzzle('puzzle1', defaultData);
  return (
    <Puzzle
      puzzleData={data}
      title="Fill in the Blanks"
      subtitle="Drag the words below into the correct blank spaces"
      name ="puzzle1"
    />
  );
}
