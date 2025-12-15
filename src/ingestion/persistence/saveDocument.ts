import type { SupabaseClient } from '@supabase/supabase-js';

export interface DocumentInsertInput {
  userId: string;
  specialty: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  metadata?: Record<string, any>;
}

export interface DocumentRecord {
  id: string;
  status: string;
}

export async function createDocumentRecord(
  supabase: SupabaseClient,
  input: DocumentInsertInput
): Promise<DocumentRecord> {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: input.userId,
      specialty: input.specialty,
      title: input.title,
      file_name: input.fileName,
      file_type: input.fileType,
      file_size: input.fileSize,
      storage_path: input.storagePath,
      status: 'processing',
      metadata: input.metadata ?? {},
      total_chunks: 0
    })
    .select('id, status')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create document record: ${error?.message}`);
  }

  return data;
}

export async function updateDocumentStatus(
  supabase: SupabaseClient,
  documentId: string,
  status: 'ready' | 'error' | 'processing',
  fields: Partial<{ totalChunks: number; metadata: Record<string, any> }> = {}
) {
  const updatePayload: Record<string, any> = {
    status,
    ...('totalChunks' in fields ? { total_chunks: fields.totalChunks } : {}),
    ...('metadata' in fields ? { metadata: fields.metadata } : {})
  };

  if (status === 'ready' || status === 'error') {
    updatePayload.processed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('documents')
    .update(updatePayload)
    .eq('id', documentId);

  if (error) {
    throw new Error(`Failed to update document status: ${error.message}`);
  }
}

