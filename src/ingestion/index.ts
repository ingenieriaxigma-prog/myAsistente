import type { SupabaseClient } from '@supabase/supabase-js';
import { ingestionQueue } from './queues/ingestionQueue';
import { processDocumentJob, type ProcessDocumentInput } from './jobs/processDocumentJob';

/**
 * Encola y procesa un documento desde Supabase Storage hasta tablas de RAG.
 * No modifica lógica existente; es opt-in.
 */
export async function ingestDocument(input: {
  supabase: SupabaseClient;
  storageBucket: string;
  storagePath: string;
  userId: string;
  specialty: string;
  title: string;
  openaiApiKey: string;
  fileTypeHint?: ProcessDocumentInput['fileTypeHint'];
  ffmpegPath?: string;
}) {
  return ingestionQueue.enqueue(() =>
    processDocumentJob({
      supabase: input.supabase,
      storageBucket: input.storageBucket,
      storagePath: input.storagePath,
      userId: input.userId,
      specialty: input.specialty,
      title: input.title,
      openaiApiKey: input.openaiApiKey,
      fileTypeHint: input.fileTypeHint,
      ffmpegPath: input.ffmpegPath
    })
  );
}

export type { ProcessDocumentInput };

