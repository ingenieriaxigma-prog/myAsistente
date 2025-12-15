interface ChunkTextOptions {
  targetTokens?: number; // aprox tokens por chunk
  overlapTokens?: number;
}

/**
 * Divide texto en chunks aproximados a 500-800 tokens (estimación 4 chars/token).
 */
export function chunkText(
  text: string,
  options: ChunkTextOptions = {}
): { content: string; tokenCount: number; index: number }[] {
  const targetTokens = options.targetTokens ?? 650;
  const overlapTokens = options.overlapTokens ?? 80;
  const avgCharsPerToken = 4;
  const targetChars = targetTokens * avgCharsPerToken;
  const overlapChars = overlapTokens * avgCharsPerToken;

  const sentences = splitSentences(text);
  const chunks: { content: string; tokenCount: number; index: number }[] = [];

  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length <= targetChars) {
      current += sentence;
      continue;
    }

    if (current.trim()) {
      chunks.push(buildChunk(current, chunks.length, avgCharsPerToken));
      // aplicar overlap manteniendo final del chunk previo
      const overlap = current.slice(-overlapChars);
      current = overlap + sentence;
    } else {
      // oración muy larga, cortar directamente
      chunks.push(buildChunk(sentence.slice(0, targetChars), chunks.length, avgCharsPerToken));
      current = sentence.slice(targetChars - overlapChars);
    }
  }

  if (current.trim()) {
    chunks.push(buildChunk(current, chunks.length, avgCharsPerToken));
  }

  return chunks;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[\.\!\?\n])\s+/)
    .filter(Boolean);
}

function buildChunk(content: string, index: number, avgCharsPerToken: number) {
  const tokenCount = Math.max(1, Math.round(content.length / avgCharsPerToken));
  return { content: content.trim(), tokenCount, index };
}

