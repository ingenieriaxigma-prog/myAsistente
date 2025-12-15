/**
 * EMBEDDINGS SERVICE
 * Gestiona embeddings para búsqueda semántica (RAG)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export interface Embedding {
  id: string;
  chunk_id: string;
  embedding: number[];
  model: string;
  created_at: string;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  document_title: string;
  chunk_index: number;
  metadata: any;
}

/**
 * Generate embedding using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI embeddings API error:', errorData);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

/**
 * Store embedding for a chunk
 */
export async function createEmbedding(
  chunkId: string,
  embedding: number[],
  model: string = 'text-embedding-3-small'
): Promise<Embedding | null> {
  const { data, error } = await supabase
    .from('embeddings')
    .insert({
      chunk_id: chunkId,
      embedding,
      model,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating embedding:', error);
    return null;
  }

  return data;
}

/**
 * Search for similar chunks using cosine similarity
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  specialty?: 'MyPelvic' | 'MyColop' | 'general',
  limit: number = 5,
  similarityThreshold: number = 0.7
): Promise<SearchResult[]> {
  try {
    // Call Supabase RPC function for vector similarity search
    const { data, error } = await supabase.rpc('search_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: similarityThreshold,
      match_count: limit,
      filter_specialty: specialty || null,
    });

    if (error) {
      console.error('Error searching embeddings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception searching embeddings:', error);
    return [];
  }
}

/**
 * Get embedding for a chunk
 */
export async function getEmbedding(chunkId: string): Promise<Embedding | null> {
  const { data, error } = await supabase
    .from('embeddings')
    .select('*')
    .eq('chunk_id', chunkId)
    .single();

  if (error) {
    console.error('Error fetching embedding:', error);
    return null;
  }

  return data;
}

/**
 * Delete embeddings for a document (via chunk_ids)
 */
export async function deleteEmbeddingsByChunks(chunkIds: string[]): Promise<boolean> {
  const { error } = await supabase
    .from('embeddings')
    .delete()
    .in('chunk_id', chunkIds);

  if (error) {
    console.error('Error deleting embeddings:', error);
    return false;
  }

  return true;
}

/**
 * Process query and search for relevant chunks
 */
export async function searchKnowledgeBase(
  query: string,
  specialty?: 'MyPelvic' | 'MyColop' | 'general',
  limit: number = 3
): Promise<SearchResult[]> {
  console.log(`🔍 Searching knowledge base for: "${query.substring(0, 50)}..."`);
  
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  
  if (!queryEmbedding) {
    console.error('❌ Failed to generate query embedding');
    return [];
  }

  console.log('✅ Query embedding generated');

  // Search for similar chunks
  const results = await searchSimilarChunks(queryEmbedding, specialty, limit, 0.7);
  
  console.log(`📊 Found ${results.length} relevant chunks (similarity > 0.7)`);
  
  if (results.length > 0) {
    results.forEach((r, i) => {
      console.log(`  ${i + 1}. [${r.similarity.toFixed(3)}] ${r.document_title} (chunk ${r.chunk_index})`);
    });
  }

  return results;
}
