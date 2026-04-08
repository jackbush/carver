/**
 * Derives a default filename from the document's first # heading.
 * Strips non-alphanumeric characters, lowercases, hyphenates spaces.
 * Falls back to 'document' if no heading is found or the result is empty.
 */
export function getDefaultFilename(content) {
  const match = content.match(/^#\s+(.+)$/m);
  if (!match) return 'document';
  const slug = match[1]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  return slug || 'document';
}

/**
 * Triggers a browser download of content as a .md file.
 */
export function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
