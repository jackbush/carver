/** Counts words in rendered text: runs of letters or digits, joined by apostrophes or hyphens. */
export function countWords(text) {
  const words = text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  return words ? words.length : 0;
}

export function formatWordCount(count) {
  if (count === 0) return 'No words yet';
  return `${count.toLocaleString('en')} ${count === 1 ? 'word' : 'words'}`;
}
