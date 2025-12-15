import type { SupabaseClient } from '@supabase/supabase-js';

export interface ChunkInput {
  content: string;
  tokenCount: number;
  index: number;
  metadata?: Record<string, any>;
}

export interface ChunkRecord {
  id: string;
  chunk_index: number;
  content: string;
}

export async function saveChunks(
  supabase: SupabaseClient,
  documentId: string,
  chunks: ChunkInput[]
): Promise<ChunkRecord[]> {
  if (!chunks.length) return [];

  const { data, error } = await supabase
    .from('document_chunks')
    .insert(
      chunks.map(chunk => ({
        document_id: documentId,
        chunk_index: chunk.index,
        content: chunk.content,
        token_count: chunk.tokenCount,
        metadata: chunk.metadata ?? {}
      }))
    )
    .select('id, chunk_index, content');

  if (error) {
    throw new Error(`Failed to save chunks: ${error.message}`);
  }

  return data ?? [];
}

