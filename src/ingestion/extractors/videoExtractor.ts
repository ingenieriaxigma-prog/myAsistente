import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';

/**
 * Extrae audio de un video usando ffmpeg.
 * Retorna un buffer WAV mono 16k listo para transcripción.
 */
export async function extractAudioFromVideo(
  buffer: Uint8Array,
  ffmpegPath: string = 'ffmpeg'
): Promise<Uint8Array> {
  const tempDir = await fs.mkdtemp(join(tmpdir(), 'ingestion-'));
  const inputPath = join(tempDir, `${randomUUID()}.video`);
  const outputPath = join(tempDir, `${randomUUID()}.wav`);

  try {
    await fs.writeFile(inputPath, buffer);

    await runFfmpeg(ffmpegPath, [
      '-y',
      '-i',
      inputPath,
      '-vn',
      '-acodec',
      'pcm_s16le',
      '-ar',
      '16000',
      '-ac',
      '1',
      outputPath
    ]);

    const audio = await fs.readFile(outputPath);
    return audio;
  } finally {
    // Limpieza best-effort
    await Promise.allSettled([
      fs.rm(inputPath, { force: true }),
      fs.rm(outputPath, { force: true }),
      fs.rm(tempDir, { recursive: true, force: true })
    ]);
  }
}

function runFfmpeg(ffmpegPath: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { stdio: 'ignore' });
    proc.on('error', reject);
    proc.on('exit', code => {
      if (code === 0) return resolve();
      reject(new Error(`ffmpeg exited with code ${code ?? 'unknown'}`));
    });
  });
}
