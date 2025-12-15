import type { SupabaseClient } from '@supabase/supabase-js';

export interface EmbeddingInput {
  chunkId: string;
  embedding: number[];
  model?: string;
}

export async function saveEmbeddings(
  supabase: SupabaseClient,
  embeddings: EmbeddingInput[]
): Promise<void> {
  if (!embeddings.length) return;

  const payload = embeddings.map(e => ({
    chunk_id: e.chunkId,
    embedding: e.embedding,
    model: e.model ?? 'text-embedding-3-small'
  }));

  const { error } = await supabase.from('embeddings').insert(payload);

  if (error) {
    throw new Error(`Failed to save embeddings: ${error.message}`);
  }
}

