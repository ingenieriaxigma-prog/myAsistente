/**
 * DOCUMENTS SERVICE
 * Gestiona documentos de la base de conocimiento médico
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Document {
  id: string;
  user_id: string | null;
  specialty: 'MyPelvic' | 'MyColop' | 'general';
  title: string;
  file_name: string;
  file_type: 'pdf' | 'txt' | 'image' | 'video';
  file_size: number;
  storage_path: string;
  status: 'processing' | 'completed' | 'failed';
  total_chunks: number;
  metadata: any;
  created_at: string;
  processed_at: string | null;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  metadata: any;
  created_at: string;
}

/**
 * Get all documents, optionally filtered by specialty
 */
export async function getDocuments(
  specialty?: 'MyPelvic' | 'MyColop' | 'general',
  userId?: string
): Promise<Document[]> {
  let query = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (specialty) {
    query = query.eq('specialty', specialty);
  }

  // If userId is provided, get user's documents + global documents
  if (userId) {
    query = query.or(`user_id.eq.${userId},user_id.is.null`);
  } else {
    // Only global documents
    query = query.is('user_id', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching documents:', error);
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a specific document by ID
 */
export async function getDocument(documentId: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) {
    console.error('Error fetching document:', error);
    return null;
  }

  return data;
}

/**
 * Create a new document entry (before processing)
 */
export async function createDocument(document: {
  user_id?: string;
  specialty: 'MyPelvic' | 'MyColop' | 'general';
  title: string;
  file_name: string;
  file_type: 'pdf' | 'txt' | 'image' | 'video';
  file_size: number;
  storage_path: string;
  metadata?: any;
}): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: document.user_id || null,
      specialty: document.specialty,
      title: document.title,
      file_name: document.file_name,
      file_type: document.file_type,
      file_size: document.file_size,
      storage_path: document.storage_path,
      status: 'processing',
      total_chunks: 0,
      metadata: document.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating document:', error);
    return null;
  }

  return data;
}

/**
 * Update document status and metadata after processing
 */
export async function updateDocument(
  documentId: string,
  updates: {
    status?: 'processing' | 'completed' | 'failed';
    total_chunks?: number;
    metadata?: any;
    processed_at?: string;
  }
): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating document:', error);
    return null;
  }

  return data;
}

/**
 * Delete a document and its chunks (cascade)
 */
export async function deleteDocument(documentId: string, userId?: string): Promise<boolean> {
  let query = supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  // Only allow deleting user's own documents (not global ones)
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { error } = await query;

  if (error) {
    console.error('Error deleting document:', error);
    return false;
  }

  return true;
}

/**
 * Create document chunks
 */
export async function createChunks(chunks: {
  document_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  metadata?: any;
}[]): Promise<DocumentChunk[] | null> {
  const { data, error } = await supabase
    .from('document_chunks')
    .insert(chunks)
    .select();

  if (error) {
    console.error('Error creating chunks:', error);
    return null;
  }

  return data;
}

/**
 * Get chunks for a document
 */
export async function getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
  const { data, error } = await supabase
    .from('document_chunks')
    .select('*')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true });

  if (error) {
    console.error('Error fetching chunks:', error);
    throw new Error(`Failed to fetch chunks: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a specific chunk
 */
export async function getChunk(chunkId: string): Promise<DocumentChunk | null> {
  const { data, error } = await supabase
    .from('document_chunks')
    .select('*')
    .eq('id', chunkId)
    .single();

  if (error) {
    console.error('Error fetching chunk:', error);
    return null;
  }

  return data;
}
