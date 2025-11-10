export function chunkText(input: string, max = 2000): string[] {
  if (!input) return [];

  const normalized = input.replace(/\r\n/g, "\n");
  const chunks: string[] = [];

  for (let i = 0; i < normalized.length; i += max) {
    chunks.push(normalized.slice(i, i + max));
  }

  return chunks;
}
