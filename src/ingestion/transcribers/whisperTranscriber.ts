export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
}

/**
 * Transcribe audio buffer usando OpenAI Whisper.
 */
export async function transcribeAudio(
  audioBuffer: Uint8Array,
  fileName: string,
  openaiApiKey: string,
  options: TranscriptionOptions = {}
): Promise<string> {
  const form = new FormData();
  const file = new Blob([audioBuffer], { type: 'audio/wav' });
  form.append('file', file, fileName);
  form.append('model', 'whisper-1');
  if (options.language) form.append('language', options.language);
  if (options.prompt) form.append('prompt', options.prompt);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`
    },
    body: form
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whisper transcription failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.text ?? '';
}

