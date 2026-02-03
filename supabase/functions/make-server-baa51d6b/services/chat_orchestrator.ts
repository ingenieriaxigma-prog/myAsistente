/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHAT ORCHESTRATOR SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RESPONSABILIDAD: Orquestar el flujo completo de un mensaje de chat
 * 
 * FLUJO DE PROCESAMIENTO:
 * 1. Procesar attachments (imágenes/documentos) ← attachment_processor.ts
 * 2. Buscar en base de conocimiento (si RAG activado) ← rag_service.ts
 * 3. Construir prompt del sistema ← openai.ts
 * 4. Llamar a OpenAI con el contexto completo ← openai.ts
 * 5. Detectar fuentes usadas y limpiar respuesta ← rag_service.ts
 * 6. Guardar mensaje en base de datos ← messages.ts
 * 
 * VENTAJAS DE ESTA ARQUITECTURA:
 * - Cada módulo es independiente
 * - Cambios en RAG no afectan attachments
 * - Cambios en attachments no afectan RAG
 * - Fácil testear cada parte por separado
 * 
 * ⚠️ Este es el ÚNICO módulo que coordina todo el flujo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { searchKnowledgeBase, buildRAGSystemPrompt, detectSourceUsage } from './rag_service.ts';
import { processAttachmentsForOpenAI } from './attachment_processor.ts';
import { getSystemPrompt, getChatCompletion, selectModel } from './openai.ts';

export interface ChatOrchestrationOptions {
  chatId: string;
  specialty: string;
  userMessage: string;
  allMessages: any[];
  useRAG: boolean;
  supabase: any;
}

export interface ChatOrchestrationResult {
  success: boolean;
  aiResponse?: string;
  usedKnowledgeBase?: boolean;
  sourceType?: string;
  modelUsed?: string;
  error?: string;
}

/**
 * MAIN ORCHESTRATION FUNCTION
 * 
 * Este es el corazón del sistema de chat.
 * Coordina todos los servicios para procesar un mensaje.
 * 
 * @param options - Configuration for chat processing
 * @returns Result with AI response and metadata
 */
export async function orchestrateChatMessage(
  options: ChatOrchestrationOptions
): Promise<ChatOrchestrationResult> {
  const { chatId, specialty, userMessage, allMessages, useRAG, supabase } = options;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 CHAT ORCHESTRATOR: Starting message processing');
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Specialty: ${specialty}`);
  console.log(`   Use RAG: ${useRAG}`);
  console.log(`   Message: "${userMessage.substring(0, 50)}..."`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // ──────────────────────────────────────────────────────────────────────
    // STEP 1: Process Attachments (Images & Documents)
    // ──────────────────────────────────────────────────────────────────────
    console.log('📎 STEP 1: Processing attachments...');
    const { processedMessages, hasImages, hasDocuments } = processAttachmentsForOpenAI(allMessages);
    console.log(`   ✅ Attachments processed (images: ${hasImages}, docs: ${hasDocuments})\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 2: Get Base System Prompt
    // ──────────────────────────────────────────────────────────────────────
    console.log('📝 STEP 2: Building system prompt...');
    let systemPrompt = getSystemPrompt(specialty);
    console.log(`   ✅ Base system prompt ready\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 3: RAG - Search Knowledge Base (if enabled)
    // ──────────────────────────────────────────────────────────────────────
    let relevantChunks: any[] = [];
    
    if (useRAG) {
      console.log('🔍 STEP 3: RAG - Searching knowledge base...');
      relevantChunks = await searchKnowledgeBase(
        userMessage,
        specialty,
        5,  // Max 5 chunks
        0.30,  // Min 30% similarity
        supabase
      );

      if (relevantChunks.length > 0) {
        console.log(`   ✅ Found ${relevantChunks.length} relevant chunks`);
        systemPrompt = buildRAGSystemPrompt(systemPrompt, relevantChunks);
        console.log(`   ✅ Enhanced system prompt with RAG context\n`);
      } else {
        console.log(`   ⚠️ No relevant chunks found, using general knowledge\n`);
      }
    } else {
      console.log('⏭️  STEP 3: RAG disabled, skipping knowledge base search\n');
    }

    // ──────────────────────────────────────────────────────────────────────
    // STEP 4: Build Final Messages Array for OpenAI
    // ──────────────────────────────────────────────────────────────────────
    console.log('🔨 STEP 4: Building OpenAI messages array...');
    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...processedMessages
    ];
    console.log(`   ✅ Prepared ${openaiMessages.length} messages\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 5: Select Model (GPT-4o for images, GPT-4o-mini for text)
    // ──────────────────────────────────────────────────────────────────────
    console.log('🤖 STEP 5: Selecting AI model...');
    const selectedModel = selectModel(openaiMessages);
    console.log(`   ✅ Selected model: ${selectedModel}\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 6: Call OpenAI API
    // ──────────────────────────────────────────────────────────────────────
    console.log('☁️  STEP 6: Calling OpenAI API...');
    const aiResult = await getChatCompletion({
      model: selectedModel,
      messages: openaiMessages,
      maxTokens: 2000,
      temperature: 0.7
    });

    if (!aiResult) {
      console.error('   ❌ OpenAI API call failed\n');
      return {
        success: false,
        error: 'Failed to get AI response'
      };
    }

    console.log(`   ✅ Received response from OpenAI (${aiResult.content.length} chars)\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 7: Detect Source Usage & Clean Response
    // ──────────────────────────────────────────────────────────────────────
    console.log('🎯 STEP 7: Detecting source usage...');
    const { usedKnowledgeBase, cleanedResponse, sourceType } = detectSourceUsage(aiResult.content);
    console.log(`   ✅ Source: ${sourceType} (used KB: ${usedKnowledgeBase})\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 8: Return Result
    // ──────────────────────────────────────────────────────────────────────
    console.log('✅ CHAT ORCHESTRATOR: Message processed successfully\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      aiResponse: cleanedResponse,
      usedKnowledgeBase,
      sourceType,
      modelUsed: aiResult.model
    };

  } catch (error) {
    console.error('❌ CHAT ORCHESTRATOR: Error during message processing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
