import { toDevanagari } from '@mazi/marathi';

/**
 * Transliterates an entire string of text from Roman/Latin script to Devanagari,
 * preserving existing Devanagari characters, numbers, punctuation, and whitespace.
 */
export function transliterateText(text: string): string {
  if (!text) return '';
  // Check if string contains any Latin characters [A-Za-z]
  if (!/[a-zA-Z]/.test(text)) return text;

  // Replace each contiguous sequence of Latin letters with its Devanagari transliteration
  return text.replace(/[a-zA-Z]+/g, (match) => {
    // Avoid transliterating known technical/URL patterns like http, https, www, .com
    if (/^(http|https|www|com|in|org|net|gov)$/i.test(match)) {
      return match;
    }
    return toDevanagari(match);
  });
}

export interface TransliterateCursorResult {
  newValue: string;
  newCursorPos: number;
  replaced: boolean;
}

/**
 * Checks the text immediately preceding the cursor.
 * If it ends with a Latin word, converts that word to Devanagari
 * and places the cursor right after the newly inserted Devanagari word.
 */
export function transliteratePrecedingWord(
  value: string,
  cursorPos: number
): TransliterateCursorResult {
  if (cursorPos <= 0 || !value) {
    return { newValue: value, newCursorPos: cursorPos, replaced: false };
  }

  const left = value.slice(0, cursorPos);
  const right = value.slice(cursorPos);

  // Match the word preceding cursor that consists of Latin characters
  const match = left.match(/([a-zA-Z]+)$/);
  if (!match || !match[1]) {
    return { newValue: value, newCursorPos: cursorPos, replaced: false };
  }

  const word = match[1];
  const devanagariWord = toDevanagari(word);
  const startIdx = cursorPos - word.length;
  const newLeft = left.slice(0, startIdx) + devanagariWord;
  const newValue = newLeft + right;
  const newCursorPos = startIdx + devanagariWord.length;

  return { newValue, newCursorPos, replaced: true };
}
