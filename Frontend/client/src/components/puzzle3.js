import Puzzle from './Puzzle';
import { usePuzzle } from '../hooks/usePuzzle';

const defaultData = {
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
};

export default function Puzzle3() {
  const { data } = usePuzzle('puzzle3', defaultData);
  return (
    <Puzzle
      puzzleData={data}
      title="Write a Function"
      subtitle="Drag each code segment to the correct line to write a function that checks for palindromes in a word"
    />
  );
}
