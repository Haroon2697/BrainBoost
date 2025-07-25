// utils/fetchWords.ts
import wordBank from '../assets/words.json';

type Difficulty = 'easy' | 'medium' | 'hard';

export async function fetchWord(difficulty: Difficulty): Promise<string> {
  let length = 4;
  if (difficulty === 'medium') length = 6;
  else if (difficulty === 'hard') length = 9;

  try {
    const res = await fetch(
      `https://random-word-api.herokuapp.com/word?number=1&length=${length}`
    );
    if (!res.ok) throw new Error('API failed');

    const [word] = await res.json();
    return word.toUpperCase();
  } catch (err) {
    console.warn('⚠️ Using fallback words from local JSON');
    const localWords = wordBank[difficulty];
    const fallback = localWords[Math.floor(Math.random() * localWords.length)];
    return fallback.toUpperCase();
  }
}
