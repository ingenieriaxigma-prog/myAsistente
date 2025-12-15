export type FileType =
  | 'pdf'
  | 'text'
  | 'markdown'
  | 'json'
  | 'audio'
  | 'video'
  | 'unknown';

const audioExts = new Set(['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg']);
const videoExts = new Set(['mp4', 'mkv', 'avi', 'mov', 'webm']);

export function detectFileType(fileName: string, mimeType?: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (mimeType?.includes('pdf') || ext === 'pdf') return 'pdf';
  if (mimeType?.includes('markdown') || ext === 'md') return 'markdown';
  if (mimeType?.includes('json') || ext === 'json') return 'json';
  if (
    mimeType?.startsWith('text/') ||
    ext === 'txt' ||
    ext === 'csv' // se trata como texto plano
  ) {
    return 'text';
  }
  if (audioExts.has(ext) || mimeType?.startsWith('audio/')) return 'audio';
  if (videoExts.has(ext) || mimeType?.startsWith('video/')) return 'video';
  return 'unknown';
}

