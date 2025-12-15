import type { FileType } from '../detectors/detectFileType';

/**
 * Extrae texto plano desde buffers UTF-8.
 * Para JSON se normaliza con pretty print.
 */
export function extractText(
  buffer: Uint8Array,
  fileType: FileType = 'text'
): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const raw = decoder.decode(buffer);

  if (fileType === 'json') {
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  }

  return raw;
}
