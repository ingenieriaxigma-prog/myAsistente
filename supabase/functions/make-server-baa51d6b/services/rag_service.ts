/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RAG SERVICE (Retrieval-Augmented Generation)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RESPONSABILIDAD: Gestionar búsqueda en base de conocimiento médica
 * 
 * FUNCIONES PRINCIPALES:
 * 1. searchKnowledgeBase() - Busca documentos relevantes usando embeddings
 * 2. buildRAGSystemPrompt() - Construye el prompt con contexto de documentos
 * 3. detectSourceUsage() - Detecta si AI usó base de datos o conocimiento general
 * 
 * DEPENDENCIAS:
 * - embeddings.ts (para crear embeddings de búsqueda)
 * - supabase (para búsqueda en base de datos)
 * 
 * ⚠️ NO MODIFICAR sin entender impacto en chat.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createEmbedding } from './embeddings.ts';

export interface KnowledgeChunk {
  content: string;
  similarity: number;
  document_id: string;
  chunk_id: string;
  metadata?: any;
}

/**
 * Search knowledge base for relevant content
 * 
 * @param query - User's question/message
 * @param specialty - Medical specialty (MyPelvic, MyColop, etc)
 * @param limit - Max number of results
 * @param minSimilarity - Minimum similarity threshold (0-1)
 * @returns Array of relevant document chunks
 */
export async function searchKnowledgeBase(
  query: string,
  specialty: string,
  limit: number = 5,
  minSimilarity: number = 0.30,
  supabase: any
): Promise<KnowledgeChunk[]> {
  try {
    console.log(`🔍 RAG: Searching knowledge base for "${query.substring(0, 50)}..."`);
    
    // Create embedding for the query
    const embedding = await createEmbedding(query);
    
    if (!embedding) {
      console.error('❌ RAG: Failed to create embedding for query');
      return [];
    }

    // Search in database using vector similarity
    const { data: chunks, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: minSimilarity,
      match_count: limit,
      filter_specialty: specialty
    });

    if (error) {
      console.error('❌ RAG: Database search error:', error);
      return [];
    }

    if (!chunks || chunks.length === 0) {
      console.log('⚠️ RAG: No relevant chunks found in knowledge base');
      return [];
    }

    console.log(`✅ RAG: Found ${chunks.length} relevant chunks (min similarity: ${minSimilarity})`);
    
    return chunks.map((chunk: any) => ({
      content: chunk.content,
      similarity: chunk.similarity,
      document_id: chunk.document_id,
      chunk_id: chunk.id,
      metadata: chunk.metadata
    }));
    
  } catch (error) {
    console.error('❌ RAG: Unexpected error during search:', error);
    return [];
  }
}

/**
 * Build enhanced system prompt with RAG context
 * 
 * @param basePrompt - Original system prompt
 * @param chunks - Relevant document chunks from knowledge base
 * @returns Enhanced prompt with knowledge base context
 */
export function buildRAGSystemPrompt(
  basePrompt: string,
  chunks: KnowledgeChunk[]
): string {
  if (chunks.length === 0) {
    return basePrompt;
  }

  // Build context from chunks
  const kbContext = chunks
    .map((chunk, i) => 
      `[Fuente ${i + 1} - Relevancia: ${(chunk.similarity * 100).toFixed(1)}%]\n${chunk.content}`
    )
    .join('\n\n---\n\n');

  // Add RAG instructions to system prompt
  const ragPrompt = `${basePrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 INFORMACIÓN DISPONIBLE DE LA BASE DE CONOCIMIENTO MÉDICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${kbContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ INSTRUCCIONES CRÍTICAS SOBRE USO DE FUENTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧠 EVALÚA ANTES DE RESPONDER:

1. 🔍 LEE LA PREGUNTA DEL USUARIO Y LA INFORMACIÓN ARRIBA
   - ¿La información arriba RESPONDE DIRECTAMENTE la pregunta?
   - ¿La información es ESPECÍFICA y RELEVANTE para lo que pregunta?
   
2. ✅ SI LA INFORMACIÓN ARRIBA ES RELEVANTE Y ÚTIL:
   - Úsala como fuente PRINCIPAL
   - Al final de tu respuesta, agrega EXACTAMENTE esta línea:
     [FUENTES_USADAS: BASE_DE_DATOS]
   - Menciona que viene de "nuestra base de conocimiento especializada"
   
3. ❌ SI LA INFORMACIÓN ARRIBA NO ES RELEVANTE O NO RESPONDE LA PREGUNTA:
   - USA tu conocimiento médico general
   - Al final de tu respuesta, agrega EXACTAMENTE esta línea:
     [FUENTES_USADAS: CONOCIMIENTO_GENERAL]
   - NO menciones "nuestra base de datos"
   - NO digas que la información viene de fuentes específicas

4. 📝 EJEMPLO DE EVALUACIÓN:
   
   Pregunta: "¿Dónde nació la coloproctología?"
   → Información arriba: [Habla sobre enfermedades específicas, síntomas, tratamientos]
   → DECISIÓN: NO es relevante (habla de historia, no de enfermedades)
   → ACCIÓN: Usar conocimiento general + [FUENTES_USADAS: CONOCIMIENTO_GENERAL]
   
   Pregunta: "¿Cuáles son los síntomas de las hemorroides?"
   → Información arriba: [Describe síntomas y tratamiento de hemorroides]
   → DECISIÓN: SÍ es relevante y útil
   → ACCIÓN: Usar información de arriba + [FUENTES_USADAS: BASE_DE_DATOS]

5. 🎯 SÉ HONESTO Y PRECISO:
   - Si no tienes información específica en la base de datos, dilo
   - Es mejor usar conocimiento general que forzar información irrelevante
   - La precisión es más importante que siempre usar las fuentes

RECUERDA: Siempre termina tu respuesta con [FUENTES_USADAS: BASE_DE_DATOS] o [FUENTES_USADAS: CONOCIMIENTO_GENERAL]`;

  return ragPrompt;
}

/**
 * Detect if AI used knowledge base or general knowledge
 * 
 * @param aiResponse - AI's response text
 * @returns Object with usedKnowledgeBase flag and cleaned response
 */
export function detectSourceUsage(aiResponse: string): {
  usedKnowledgeBase: boolean;
  cleanedResponse: string;
  sourceType: 'BASE_DE_DATOS' | 'CONOCIMIENTO_GENERAL' | 'UNKNOWN';
} {
  const sourceMarkerRegex = /\[FUENTES_USADAS:\s*(BASE_DE_DATOS|CONOCIMIENTO_GENERAL)\]/i;
  const sourceMatch = aiResponse.match(sourceMarkerRegex);
  
  if (sourceMatch) {
    const sourceType = sourceMatch[1].toUpperCase() as 'BASE_DE_DATOS' | 'CONOCIMIENTO_GENERAL';
    const usedKnowledgeBase = sourceType === 'BASE_DE_DATOS';
    
    // Remove marker from response (user shouldn't see it)
    const cleanedResponse = aiResponse.replace(sourceMarkerRegex, '').trim();
    
    console.log(`🎯 RAG: AI used ${sourceType}`);
    
    return {
      usedKnowledgeBase,
      cleanedResponse,
      sourceType
    };
  }
  
  // If no marker found, assume general knowledge
  console.log('⚠️ RAG: No source marker found, assuming general knowledge');
  return {
    usedKnowledgeBase: false,
    cleanedResponse: aiResponse,
    sourceType: 'UNKNOWN'
  };
}

/**
 * Format source citations for user display
 * 
 * @param chunks - Document chunks that were provided to AI
 * @param usedKnowledgeBase - Whether AI actually used the knowledge base
 * @returns Formatted source citations or null
 */
export function formatSourceCitations(
  chunks: KnowledgeChunk[],
  usedKnowledgeBase: boolean
): string | null {
  if (!usedKnowledgeBase || chunks.length === 0) {
    return null;
  }

  const citations = chunks
    .map((chunk, i) => `${i + 1}. Documento médico (${(chunk.similarity * 100).toFixed(0)}% relevancia)`)
    .join('\n');

  return `\n\n📚 **Fuentes consultadas:**\n${citations}`;
}
