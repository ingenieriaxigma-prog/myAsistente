/**
 * Normaliza entrada binaria de audio.
 * No convierte formato; solo asegura que sea Uint8Array.
 */
export function extractAudio(buffer: ArrayBuffer | Uint8Array): Uint8Array {
  if (buffer instanceof Uint8Array) return buffer;
  return new Uint8Array(buffer);
}

