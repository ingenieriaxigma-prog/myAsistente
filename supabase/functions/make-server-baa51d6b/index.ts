/**
 * MY HEALTH APP - MAIN SERVER
 * Sistema médico con RAG (Retrieval-Augmented Generation)
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getChatCompletionStream } from "./services/openai.ts";

const app = new Hono();

// Apply middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
// TODO: centralize Supabase client when server config can share the common instance.
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Super Admin configuration
const SUPER_ADMIN_EMAIL = 'ingenieriaxigma@gmail.com';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function verifyUser(authHeader: string | undefined) {
  if (!authHeader) {
    return { error: 'No authorization header', user: null };
  }

  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    return { error: 'Invalid authorization header', user: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return { error: error?.message || 'Unauthorized', user: null };
    }

    return { error: null, user };
  } catch (error) {
    return { error: 'Authentication failed', user: null };
  }
}

// Verify if user is super admin
async function verifySuperAdmin(authHeader: string | undefined) {
  const { error, user } = await verifyUser(authHeader);
  
  if (error || !user) {
    return { error: error || 'Unauthorized', user: null, isSuperAdmin: false };
  }

  const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
  
  if (!isSuperAdmin) {
    return { 
      error: 'Access denied. Only super administrators can perform this action.', 
      user, 
      isSuperAdmin: false 
    };
  }

  return { error: null, user, isSuperAdmin: true };
}

function getSystemPrompt(specialty: string): string {
  const baseFormatting = `
IMPORTANTE - Formato de respuesta:
- Usa Markdown para dar formato a tus respuestas
- Usa emojis relevantes para hacer las respuestas más amigables
- Usa **negritas** para títulos y puntos importantes
- Usa ### para títulos de secciones
- Siempre recomienda consultar con un profesional médico

IMPORTANTE - Análisis de imágenes:
- Si el usuario envía una imagen, DEBES analizarla cuidadosamente
- Describe lo que ves en la imagen con detalle médico
- Proporciona análisis, diagnóstico diferencial o información relevante
- NUNCA digas "no puedo ver imágenes" - SÍ PUEDES verlas y analizarlas
- Usa tu conocimiento médico para interpretar la imagen
- Al final de tu respuesta, agrega [FUENTES_USADAS: CONOCIMIENTO_GENERAL] ya que las imágenes se analizan con tu conocimiento visual

IMPORTANTE - Análisis de documentos:
- Si el usuario adjunta un documento (PDF, Word, TXT), el texto extraído estará incluido en el mensaje
- Lee cuidadosamente TODO el contenido del documento
- Responde basándote en la información del documento cuando sea relevante
- Proporciona resúmenes, análisis o responde preguntas específicas sobre el documento
- Si el documento contiene información médica, analízala profesionalmente
- Al final de tu respuesta, agrega [FUENTES_USADAS: CONOCIMIENTO_GENERAL] ya que estás analizando el documento proporcionado por el usuario`;

  if (specialty === 'MyPelvic') {
    return `Eres un asistente médico especializado en salud pélvica. Proporciona información precisa, empática y profesional sobre problemas del suelo pélvico, incontinencia, prolapsos y salud sexual.${baseFormatting}`;
  } else if (specialty === 'MyColop') {
    return `Eres un asistente médico especializado en coloproctología. Proporciona información precisa, empática y profesional sobre hemorroides, problemas colorectales, salud digestiva y trastornos del colon.${baseFormatting}`;
  }
  return `Eres un asistente médico profesional. Proporciona información precisa y empática.${baseFormatting}`;
}

async function callOpenAI(messages: any[], hasAttachments: boolean = false) {
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found');
    return null;
  }

  // Use vision-capable model
  const model = 'gpt-4o';
  
  console.log(`🤖 Using model: ${model} (attachments: ${hasAttachments})`);
  console.log(`📝 Message context length: ${messages.length} messages`);

  try {
    const requestBody = {
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    };

    console.log('📤 Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      const lowerBody = responseText.toLowerCase();
      if (response.status === 429 || lowerBody.includes('rate_limit')) {
        console.error(`❌ OpenAI API rate limit (${model})`);
        return { error: 'RATE_LIMIT' };
      }
      if (lowerBody.includes('insufficient_quota') || lowerBody.includes('exceeded your current quota')) {
        console.error(`❌ OpenAI API quota exceeded (${model})`);
        return { error: 'INSUFFICIENT_QUOTA' };
      }
      console.error(`❌ OpenAI API error (${model}):`, {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      return { error: 'GENERIC', status: response.status };
    }

    const data = JSON.parse(responseText);
    console.log('📥 OpenAI Response received:', {
      model: data.model || model,
      content_length: data.choices?.[0]?.message?.content?.length || 0,
      finish_reason: data.choices?.[0]?.finish_reason
    });

    return {
      content: data.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.',
      model: model
    };
  } catch (error) {
    console.error('❌ Error calling OpenAI:', error);
    console.error('Error details:', error.message);
    return null;
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/make-server-baa51d6b/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

app.post("/make-server-baa51d6b/auth/signup", async (c) => {
  try {
    const { email, password, name, gender } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, gender: gender || 'not_specified' },
      email_confirm: true
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        user_metadata: data.user?.user_metadata,
      }
    });
  } catch (error) {
    return c.json({ error: 'Signup failed' }, 500);
  }
});

app.get("/make-server-baa51d6b/auth/profile", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json({
    profile: {
      id: profile.id,
      email: profile.email,
      name: profile.name || '',
      specialty: profile.specialty || '',
    }
  });
});

// ============================================================================
// CHAT ENDPOINTS
// ============================================================================

app.get("/make-server-baa51d6b/chats", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { data: chats } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    const formattedChats = (chats || []).map(chat => ({
      id: chat.id,
      userId: chat.user_id,
      specialty: chat.specialty,
      title: chat.title,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
      lastUpdate: chat.updated_at,
    }));

    return c.json({ chats: formattedChats });
  } catch (error) {
    return c.json({ error: 'Failed to fetch chats' }, 500);
  }
});

app.post("/make-server-baa51d6b/chats", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { specialty, title } = await c.req.json();
    
    const { data: chat } = await supabase
      .from('chats')
      .insert({
        user_id: user.id,
        specialty: specialty || 'general',
        title: title || 'Nueva conversación',
      })
      .select()
      .single();

    if (!chat) {
      return c.json({ error: 'Failed to create chat' }, 500);
    }

    return c.json({ 
      chat: {
        id: chat.id,
        userId: chat.user_id,
        specialty: chat.specialty,
        title: chat.title,
        messages: [],
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to create chat' }, 500);
  }
});

app.get("/make-server-baa51d6b/chat/:chatId", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const chatId = c.req.param('chatId');
    
    const { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (!chat) {
      return c.json({ error: 'Chat not found' }, 404);
    }

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    return c.json({ 
      chat: {
        id: chat.id,
        userId: chat.user_id,
        specialty: chat.specialty,
        title: chat.title,
        messages: (messages || []).map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
          model: msg.model,
          attachments: msg.attachments,
        })),
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch chat' }, 500);
  }
});

app.delete("/make-server-baa51d6b/chat/:chatId", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const chatId = c.req.param('chatId');
    
    await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', user.id);

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete chat' }, 500);
  }
});

// ============================================================================
// MESSAGE ENDPOINTS
// ============================================================================

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) {
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
      console.error('OpenAI Embedding API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.data[0]?.embedding || null;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

// Semantic search in knowledge base using pgvector
async function searchKnowledgeBase(
  query: string, 
  specialty: string, 
  limit: number = 3  // REDUCED from 5 to 3 to save tokens
): Promise<{ content: string; metadata: any; similarity: number }[]> {
  try {
    console.log(`\n🔍 ═══════════════════════════════════════════════════`);
    console.log(`🔍 RAG SEARCH STARTED`);
    console.log(`🔍 Query: "${query}"`);
    console.log(`🔍 Specialty: "${specialty}"`);
    console.log(`🔍 Limit: ${limit}`);
    console.log(`🔍 ═══════════════════════════════════════════════════\n`);
    
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      console.error('❌ Failed to generate query embedding');
      return [];
    }
    
    console.log(`✅ Generated query embedding (${queryEmbedding.length} dimensions)`);

    const { data: results, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: limit,
      filter_specialty: specialty
    });

    if (error) {
      console.error('❌ Error searching knowledge base:', error);
      return [];
    }
    
    console.log(`📊 RAG Results: ${results?.length || 0} chunks found`);

    if (!results || results.length === 0) {
      console.log(`⚠️ No relevant chunks found for specialty: ${specialty}`);
      console.log(`⚠️ This means either:`);
      console.log(`   1. No documents uploaded for "${specialty}"`);
      console.log(`   2. No chunks match the query with >0.3 similarity`);
      console.log(`   3. Database function match_document_chunks is not working\n`);
      return [];
    }

    console.log(`✅ Found ${results.length} relevant chunks:`);
    results.forEach((r: any, i: number) => {
      const similarity = (1 - r.distance) * 100;
      console.log(`   ${i+1}. Similarity: ${similarity.toFixed(1)}% | Preview: ${r.content.substring(0, 80)}...`);
    });
    console.log(`\n🔍 ═══════════════════════════════════════════════════\n`);

    return (results || []).map((r: any) => ({
      content: r.content.substring(0, 800),  // LIMIT chunk size to 800 chars to reduce tokens
      metadata: r.metadata,
      similarity: 1 - r.distance
    }));

  } catch (error) {
    console.error('❌ Error in searchKnowledgeBase:', error);
    return [];
  }
}

app.post("/make-server-baa51d6b/chat/:chatId/message", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const chatId = c.req.param('chatId');
    const { message, useRAG, attachments } = await c.req.json();
    
    const hasAttachments = attachments && attachments.length > 0;
    
    // 🔍 DEBUG: Log what we received from frontend
    if (hasAttachments) {
      console.log('🔍 DEBUG: Received attachments:', JSON.stringify(attachments.map((a: any) => ({
        type: a.type,
        name: a.name,
        hasDataUrl: !!a.data_url,
        dataUrlLength: a.data_url?.length || 0,
        dataUrlPrefix: a.data_url?.substring(0, 50) || 'N/A',
        hasExtractedText: !!a.extractedText
      })), null, 2));
    }
    
    // Verify chat belongs to user
    const { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (!chat) {
      return c.json({ error: 'Chat not found' }, 404);
    }

    // Add user message
    const { data: userMessage } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        role: 'user',
        content: message,
        attachments: attachments || [],
      })
      .select()
      .single();

    if (!userMessage) {
      return c.json({ error: 'Failed to save message' }, 500);
    }

    // Get RECENT messages for context (LIMIT to last 10 to reduce tokens)
    const { data: allMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(10);  // FIXED: Limit history to last 10 messages

    // Reverse to get chronological order
    const recentMessages = (allMessages || []).reverse();

    // Prepare system prompt
    let systemPrompt = getSystemPrompt(chat.specialty);
    let relevantChunks = [];

    // Use RAG if requested
    if (useRAG && chat.specialty) {
      console.log(`🔍 Searching knowledge base for: "${message}"`);
      
      relevantChunks = await searchKnowledgeBase(message, chat.specialty, 3);  // Max 3 chunks
      
      relevantChunks = relevantChunks.filter(chunk => chunk.similarity > 0.30);
      
      if (relevantChunks.length > 0) {
        console.log(`📚 Found ${relevantChunks.length} relevant chunks from knowledge base`);
        
        const kbContext = relevantChunks
          .map((chunk, i) => `[Fuente ${i + 1} - ${(chunk.similarity * 100).toFixed(0)}%]\n${chunk.content}`)
          .join('\n\n---\n\n');
        
        systemPrompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 INFORMACIÓN DE LA BASE DE CONOCIMIENTO MÉDICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${kbContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ INSTRUCCIONES SOBRE USO DE FUENTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SI la información arriba responde la pregunta:
   - Úsala como fuente principal
   - Termina con: [FUENTES_USADAS: BASE_DE_DATOS]
   
❌ SI NO es relevante:
   - Usa tu conocimiento general
   - Termina con: [FUENTES_USADAS: CONOCIMIENTO_GENERAL]`;
      } else {
        console.log('⚠️ No relevant chunks found in knowledge base');
      }
    }

    // Helper to ensure we have an accessible image URL (signed from storage if needed)
    const getImageUrl = async (attachment: any): Promise<string | null> => {
      const directUrl = typeof attachment.url === 'string' ? attachment.url : '';
      if (directUrl && !directUrl.startsWith('blob:')) return directUrl;

      const storagePath = typeof attachment.storagePath === 'string' ? attachment.storagePath : '';
      if (storagePath) {
        const bucketName = 'chat-images';
        const signed = await supabase.storage
          .from(bucketName)
          .createSignedUrl(storagePath, 60 * 60 * 24 * 7);
        if (signed.error) {
          console.error('❌ Error creating signed URL for OpenAI vision:', signed.error);
          return null;
        }
        return signed.data.signedUrl;
      }

      const dataUrl = attachment.data_url || attachment.base64;
      if (!dataUrl) return null;

      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const fileExt = attachment.name?.split('.').pop() || 'jpg';
      const ext = (fileExt || '').toLowerCase();
      const extToMime: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
      };
      const contentType =
        (attachment.mimeType && attachment.mimeType.startsWith('image/') ? attachment.mimeType : '') ||
        extToMime[ext] ||
        'image/jpeg';
      const bucketName = 'chat-images';

      // Ensure bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, { public: false });
      }

      const uniquePath = `${chatId}/${crypto.randomUUID()}.${fileExt}`;
      const upload = await supabase.storage
        .from(bucketName)
        .upload(uniquePath, binaryData, {
          contentType,
          upsert: true
        });

      if (upload.error) {
        console.error('❌ Error uploading image for OpenAI vision:', upload.error);
        return null;
      }

      const signed = await supabase.storage
        .from(bucketName)
        .createSignedUrl(upload.data.path, 60 * 60 * 24 * 7); // 7 days

      if (signed.error) {
        console.error('❌ Error creating signed URL for OpenAI vision:', signed.error);
        return null;
      }

      return signed.data.signedUrl;
    };

    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...(await Promise.all(recentMessages.map(async msg => {
        if (msg.attachments && msg.attachments.length > 0) {
          const contentParts = [
            { type: 'text', text: msg.content }
          ];
          
          let documentContext = '';
          
          for (const attachment of msg.attachments) {
            const name = (attachment?.name || '').toLowerCase();
            const extIsImage = /\.(png|jpe?g|webp|gif)$/.test(name);
            const urlStr = typeof attachment?.url === 'string' ? attachment.url : '';
            const urlIsDataImage = urlStr.startsWith('data:image/');
            const urlIsHttpImage = urlStr.startsWith('http://') || urlStr.startsWith('https://');
            const mime = typeof attachment?.mimeType === 'string' ? attachment.mimeType : '';
            const mimeIsImage = mime.startsWith('image/');
            const hasBase64 = typeof attachment?.base64 === 'string' && attachment.base64.length > 0;
            const hasDataUrl = typeof attachment?.data_url === 'string' && attachment.data_url.length > 0;
            const hasStoragePath = typeof attachment?.storagePath === 'string' && attachment.storagePath.length > 0;
            console.log('[vision] attachment', {
              name: attachment?.name,
              type: attachment?.type,
              mimeType: attachment?.mimeType,
              extIsImage,
              hasBase64,
              hasDataUrl,
              hasStoragePath
            });

            const isImage =
              attachment?.type === 'image' ||
              (typeof attachment?.type === 'string' && attachment.type.startsWith('image/')) ||
              mimeIsImage ||
              urlIsDataImage ||
              urlIsHttpImage ||
              (extIsImage && (hasBase64 || hasDataUrl || hasStoragePath));

            if (isImage) {
              const imageUrl = await getImageUrl(attachment);
              if (imageUrl) {
                contentParts.push({
                  type: 'image_url',
                  image_url: { url: imageUrl }
                });
                console.log(`[vision] added image name=${attachment.name} urlPrefix=${imageUrl.substring(0, 8)}`);
                continue;
              }
            }
            
            if (!isImage && attachment.type === 'file' && attachment.extractedText) {
              // LIMIT document text to 2000 chars to reduce tokens
              const limitedText = attachment.extractedText.substring(0, 2000);
              documentContext += `\n\n📄 ${attachment.name}\n${limitedText}${attachment.extractedText.length > 2000 ? '... [truncado]' : ''}\n`;
              console.log(`📄 Added document: ${attachment.name} (${limitedText.length} chars)`);
            }
          }
          
          if (documentContext) {
            contentParts[0].text = `${msg.content}\n${documentContext}`;
          }
          
          return {
            role: msg.role,
            content: contentParts
          };
        }
        
        return {
          role: msg.role,
          content: msg.content
        };
      })))
    ];
    console.log(`📨 Prepared ${openaiMessages.length} messages for OpenAI`);
    console.log('🔍 OpenAI payload preview:', JSON.stringify(openaiMessages, null, 2));
    
    // 🔍 DEBUG: Log message structure
    openaiMessages.forEach((msg, i) => {
      if (Array.isArray(msg.content)) {
        console.log(`🔍 Message ${i} has ${msg.content.length} parts:`, msg.content.map((p: any) => p.type));
        msg.content.forEach((part: any, j: number) => {
          if (part.type === 'image_url') {
            console.log(`  🔍 Part ${j} is image_url with URL length: ${part.image_url?.url?.length || 0}`);
            console.log(`  🔍 URL starts with: ${part.image_url?.url?.substring(0, 50) || 'N/A'}`);
          }
        });
      }
    });

    const finalizeAIResponse = async (rawContent: string, modelUsed: string) => {
      let aiContent = rawContent;
      let actuallyUsedSources = false;
      const sourceMarkerRegex = /\[FUENTES_USADAS:\s*(BASE_DE_DATOS|CONOCIMIENTO_GENERAL)\]/i;
      const sourceMatch = aiContent.match(sourceMarkerRegex);

      if (sourceMatch) {
        actuallyUsedSources = sourceMatch[1].toUpperCase() === 'BASE_DE_DATOS';
        aiContent = aiContent.replace(sourceMarkerRegex, '').trim();
        console.log(`🎯 AI used: ${actuallyUsedSources ? 'BASE_DE_DATOS' : 'CONOCIMIENTO_GENERAL'}`);
      }

      const { data: aiMessage } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          role: 'assistant',
          content: aiContent,
          model: modelUsed,
          metadata: useRAG ? {
            rag_enabled: true,
            sources_count: relevantChunks.length,
            actually_used_sources: actuallyUsedSources,
            sources: actuallyUsedSources ? relevantChunks.map((chunk, i) => ({
              index: i + 1,
              similarity: chunk.similarity,
              preview: chunk.content.substring(0, 100) + '...'
            })) : []
          } : null
        })
        .select()
        .single();

      let updatedTitle = chat.title;
      const messageCount = recentMessages.length;

      if (messageCount === 1 || chat.title.includes('Chat') || chat.title === 'Nueva conversación') {
        try {
          const titleMessages = [
            {
              role: 'system',
              content: 'Generate a short medical chat title in Spanish. Max 6 words, no quotes.'
            },
            {
              role: 'user',
              content: `Title for: "${message}"`
            }
          ];

          const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: titleMessages,
              max_tokens: 20,
              temperature: 0.7,
            }),
          });

          if (titleResponse.ok) {
            const titleData = await titleResponse.json();
            updatedTitle = titleData.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || chat.title;

            await supabase
              .from('chats')
              .update({
                title: updatedTitle,
                updated_at: new Date().toISOString()
              })
              .eq('id', chatId);
          }
        } catch (titleError) {
          console.error('Title generation error:', titleError);
          await supabase
            .from('chats')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', chatId);
        }
      } else {
        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId);
      }

      return { aiMessage, updatedTitle, actuallyUsedSources };
    };

    // Vision debug before OpenAI call
    const lastMsg = openaiMessages[openaiMessages.length - 1];
    const imageParts = Array.isArray(lastMsg?.content)
      ? lastMsg.content.filter((p: any) => p.type === 'image_url')
      : [];
    const firstImageUrl = imageParts[0]?.image_url?.url || '';
    console.log('[vision] images:', imageParts.length, 'urlPrefix:', firstImageUrl.substring(0, 8));

    const wantsStream = c.req.header('accept')?.includes('text/event-stream') || c.req.query('stream') === '1';
    if (wantsStream) {
      const streamAbort = new AbortController();
      const timeoutId = setTimeout(() => streamAbort.abort(), 60000);
      c.req.raw.signal.addEventListener('abort', () => streamAbort.abort(), { once: true });

      const streamResult = await getChatCompletionStream(
        {
          model: 'gpt-4o',
          messages: openaiMessages,
          maxTokens: 2000,
          temperature: 0.7,
        },
        streamAbort.signal
      );

      if (!streamResult || !streamResult.response.body) {
        clearTimeout(timeoutId);
        return c.json({ error: 'Failed to get AI response' }, 500);
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const reader = streamResult.response.body.getReader();
      let fullContent = '';

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = '';
          let doneStream = false;
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data:')) continue;
                const data = trimmed.slice(5).trim();
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  doneStream = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content || '';
                  if (delta) {
                    fullContent += delta;
                    controller.enqueue(encoder.encode(`data: ${delta}\n\n`));
                  }
                } catch {
                  // Ignore parse errors for non-JSON lines
                }
              }
              if (doneStream) break;
            }

            await finalizeAIResponse(fullContent, streamResult.model);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Stream error';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
          } finally {
            clearTimeout(timeoutId);
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // Get AI response
  const aiResponse = await callOpenAI(openaiMessages, hasAttachments);

  if (aiResponse?.error === 'RATE_LIMIT') {
    return c.json({ error: 'RATE_LIMIT', message: 'El asistente está ocupado por límite de solicitudes. Intenta de nuevo en unos segundos.' }, 429);
  }
  if (aiResponse?.error === 'INSUFFICIENT_QUOTA') {
    return c.json({ error: 'INSUFFICIENT_QUOTA', message: 'Se agotó la cuota/créditos de OpenAI del proyecto. Agrega créditos o ajusta límites y vuelve a intentar.' }, 402);
  }
  if (!aiResponse || aiResponse.error) {
    return c.json({ error: 'Failed to get AI response' }, 500);
  }

    const { aiMessage, updatedTitle } = await finalizeAIResponse(aiResponse.content, aiResponse.model);

    return c.json({ 
      userMessage: {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.created_at,
        attachments: userMessage.attachments || [],
      },
      aiMessage: {
        id: aiMessage.id,
        role: aiMessage.role,
        content: aiMessage.content,
        timestamp: aiMessage.created_at,
        model: aiMessage.model,
        metadata: aiMessage.metadata,
      },
      chat: {
        id: chat.id,
        title: updatedTitle,
        lastUpdate: new Date().toISOString(),
      },
      rag: useRAG ? {
        enabled: true,
        chunks_found: relevantChunks.length,
        chunks: relevantChunks.map((c, i) => ({
          index: i + 1,
          similarity: c.similarity,
          preview: c.content.substring(0, 100) + '...'
        }))
      } : { enabled: false }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// ============================================================================
// KNOWLEDGE BASE ENDPOINTS
// ============================================================================

app.post("/make-server-baa51d6b/knowledge/upload", async (c) => {
  const { error, user, isSuperAdmin } = await verifySuperAdmin(c.req.header('Authorization'));
  
  if (error || !user || !isSuperAdmin) {
    console.log(`🚫 Super admin access denied for user: ${user?.email || 'unknown'}`);
    return c.json({ error: error || 'Unauthorized. Only super administrators can upload knowledge bases.' }, 403);
  }

  console.log(`✅ Super admin verified: ${user.email}`);

  try {
    const knowledgeBase = await c.req.json();
    
    if (!knowledgeBase.specialty || !knowledgeBase.chunks || !Array.isArray(knowledgeBase.chunks)) {
      return c.json({ error: 'Invalid knowledge base format' }, 400);
    }

    const { specialty, version, updated_at, metadata, chunks } = knowledgeBase;

    console.log(`📚 Processing knowledge base: ${specialty} v${version} (${chunks.length} chunks)`);

    const documentData = {
      user_id: user.id,
      specialty,
      title: `Knowledge Base - ${specialty}`,
      file_name: `kb_${specialty}_v${version}.json`,
      file_type: 'application/json',
      file_size: JSON.stringify(knowledgeBase).length,
      storage_path: `knowledge_bases/${specialty}`,
      total_chunks: chunks.length,
      status: 'processing',
      metadata: {
        version,
        updated_at,
        description: metadata?.description || '',
        sources: metadata?.sources || [],
        kb_type: 'medical_knowledge'
      }
    };

    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('specialty', specialty)
      .eq('title', `Knowledge Base - ${specialty}`)
      .maybeSingle();

    let documentId: string;

    if (existingDoc) {
      const { data: updatedDoc, error: updateError } = await supabase
        .from('documents')
        .update({
          ...documentData,
          processed_at: new Date().toISOString()
        })
        .eq('id', existingDoc.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('Error updating document:', updateError);
        return c.json({ error: 'Failed to update document' }, 500);
      }

      documentId = updatedDoc.id;

      await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId);

      console.log(`♻️ Updated existing document: ${documentId}`);
    } else {
      const { data: newDoc, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating document:', insertError);
        return c.json({ error: 'Failed to create document' }, 500);
      }

      documentId = newDoc.id;
      console.log(`✨ Created new document: ${documentId}`);
    }

    let successCount = 0;
    let failedCount = 0;
    const chunkBatch = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        console.log(`🔄 Processing chunk ${i + 1}/${chunks.length}...`);
        const embedding = await generateEmbedding(chunk.content);
        
        if (!embedding) {
          console.error(`Failed to generate embedding for chunk ${chunk.id}`);
          failedCount++;
          continue;
        }

        const chunkData = {
          document_id: documentId,
          chunk_index: i,
          content: chunk.content,
          token_count: chunk.content.split(/\s+/).length,
          embedding: `[${embedding.join(',')}]`,
          metadata: {
            ...chunk.metadata,
            chunk_id: chunk.id,
            specialty,
            version,
            kb_updated_at: updated_at
          }
        };

        chunkBatch.push(chunkData);

        if (chunkBatch.length >= 10 || i === chunks.length - 1) {
          const { error: insertError } = await supabase
            .from('document_chunks')
            .insert(chunkBatch);

          if (insertError) {
            console.error('Error inserting chunk batch:', insertError);
            failedCount += chunkBatch.length;
          } else {
            successCount += chunkBatch.length;
          }

          chunkBatch.length = 0;
        }

      } catch (chunkError) {
        console.error(`Error processing chunk ${chunk.id}:`, chunkError);
        failedCount++;
      }
    }

    await supabase
      .from('documents')
      .update({
        status: failedCount > 0 ? 'partial' : 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    console.log(`✅ Knowledge base uploaded: ${successCount} success, ${failedCount} failed`);

    return c.json({ 
      success: true,
      specialty,
      version,
      document_id: documentId,
      processed: chunks.length,
      successful: successCount,
      failed: failedCount,
      message: `Base de conocimiento actualizada: ${successCount}/${chunks.length} chunks procesados`
    });

  } catch (error) {
    console.error('Error uploading knowledge base:', error);
    return c.json({ error: 'Failed to upload knowledge base', details: error.message }, 500);
  }
});

app.get("/make-server-baa51d6b/knowledge/info", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const specialty = c.req.query('specialty');
    
    if (!specialty) {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .like('title', 'Knowledge Base -%')
        .eq('status', 'completed')
        .order('processed_at', { ascending: false });

      const knowledgeBases = (documents || []).map(doc => ({
        specialty: doc.specialty,
        version: doc.metadata?.version || 'unknown',
        updated_at: doc.metadata?.updated_at || doc.processed_at,
        total_chunks: doc.total_chunks,
        sources: doc.metadata?.sources || [],
        description: doc.metadata?.description || '',
        last_upload: doc.processed_at,
        uploaded_by: doc.user_id,
      }));

      const uniqueBases = [];
      const seenSpecialties = new Set();
      
      for (const kb of knowledgeBases) {
        if (!seenSpecialties.has(kb.specialty)) {
          seenSpecialties.add(kb.specialty);
          uniqueBases.push(kb);
        }
      }

      return c.json({ knowledgeBases: uniqueBases });
    } else {
      const { data: document } = await supabase
        .from('documents')
        .select('*')
        .eq('specialty', specialty)
        .like('title', 'Knowledge Base -%')
        .eq('status', 'completed')
        .order('processed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!document) {
        return c.json({ error: 'Knowledge base not found' }, 404);
      }

      const knowledgeBase = {
        specialty: document.specialty,
        version: document.metadata?.version || 'unknown',
        updated_at: document.metadata?.updated_at || document.processed_at,
        total_chunks: document.total_chunks,
        sources: document.metadata?.sources || [],
        description: document.metadata?.description || '',
        last_upload: document.processed_at,
        uploaded_by: document.user_id,
      };

      return c.json({ knowledgeBase });
    }
  } catch (error) {
    console.error('Error fetching knowledge base info:', error);
    return c.json({ error: 'Failed to fetch knowledge base info' }, 500);
  }
});

// ============================================================================
// START SERVER
// ============================================================================

// ============================================================================
// DIAGNOSIS ENDPOINTS
// ============================================================================

/**
 * Intelligent diagnosis analysis endpoint
 * Uses RAG + OpenAI to provide real medical diagnosis
 */
app.post("/make-server-baa51d6b/diagnosis/analyze", async (c) => {
  // 1. Verify authenticated user
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // 2. Extract data from request
  const { 
    patientData,    // PatientData (gender, age, description, etc.)
    symptoms,       // string[] (selected symptoms)
    specialty       // 'MyColop' | 'MyPelvic'
  } = await c.req.json();

  console.log('🔍 Starting intelligent diagnosis analysis...');
  console.log('Patient:', { gender: patientData.gender, age: patientData.ageRange });
  console.log('Symptoms count:', symptoms.length);
  console.log('Specialty:', specialty);

  try {
    // 3. Prepare query for RAG
    const symptomsText = symptoms
      .map(s => s.replace('otro:', '').replace(/-/g, ' '))
      .join(', ');
    
    const ragQuery = `
      Paciente ${patientData.gender === 'male' ? 'masculino' : patientData.gender === 'female' ? 'femenino' : 'transgénero'}, 
      ${patientData.ageRange}, 
      con los siguientes síntomas: ${symptomsText}.
      ${patientData.healthDescription ? `Descripción adicional: ${patientData.healthDescription}` : ''}
    `.trim();

    console.log('🔍 RAG Query:', ragQuery.substring(0, 200) + '...');

    // 4. Search in Knowledge Base (use existing embedding function)
    const specialtyKey = specialty === 'MyColop' ? 'mycolop' : 'mypelvic';
    
    let chunks: any[] = [];
    try {
      // Generate embedding of the query
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: ragQuery
        })
      });

      if (!embeddingResponse.ok) {
        console.error('❌ Embedding API error:', await embeddingResponse.text());
        throw new Error('Embedding generation failed');
      }

      const embeddingData = await embeddingResponse.json();
      const queryEmbedding = embeddingData.data[0].embedding;

      // Search for similar chunks
      const { data: chunkData, error: chunksError } = await supabase.rpc(
        'match_document_chunks',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.5,  // Lower threshold for diagnosis
          match_count: 10,       // More context for diagnosis
          filter_specialty: specialtyKey
        }
      );

      if (chunksError) {
        console.error('❌ Error searching chunks:', chunksError);
      } else if (chunkData) {
        chunks = chunkData;
      }
    } catch (ragError) {
      console.error('⚠️ RAG disabled due to embedding/search error:', ragError);
      chunks = [];
    }

    console.log('📚 RAG chunks found:', chunks?.length || 0);
    if (chunks && chunks.length > 0) {
      console.log('Top similarity:', chunks[0].similarity);
    }

    // 5. Prepare medical context
    let medicalContext = '';
    if (chunks && chunks.length > 0) {
      medicalContext = chunks
        .map((chunk: any, index: number) => 
          `[Fuente médica ${index + 1} - Relevancia: ${(chunk.similarity * 100).toFixed(0)}%]\n${chunk.content}`
        )
        .join('\n\n');
      
      console.log('✅ Using medical knowledge base for diagnosis');
    } else {
      console.log('⚠️ No relevant medical knowledge found, using general medical knowledge');
    }

    // 6. Build specialized prompt for diagnosis
    const diagnosticPrompt = `Eres un asistente médico especializado en ${specialty === 'MyColop' ? 'coloproctología' : 'piso pélvico'}.

INFORMACIÓN DEL PACIENTE:
- Género: ${patientData.gender === 'male' ? 'Masculino' : patientData.gender === 'female' ? 'Femenino' : 'Transgénero'}
- Edad: ${patientData.ageRange}
- Antecedentes médicos: ${patientData.medicalHistory ? 'Sí' : 'No reportados'}
- Medicamentos actuales: ${patientData.medications ? 'Sí' : 'No reportados'}
- Áreas problemáticas: ${patientData.problemAreas?.join(', ') || 'No especificadas'}

SÍNTOMAS REPORTADOS:
${symptoms.map((s, i) => `${i + 1}. ${s.replace('otro:', '').replace(/-/g, ' ')}`).join('\n')}

${patientData.healthDescription ? `DESCRIPCIÓN ADICIONAL DEL PACIENTE:\n${patientData.healthDescription}\n` : ''}

${medicalContext ? `CONOCIMIENTO MÉDICO RELEVANTE DE NUESTRA BASE DE DATOS:\n${medicalContext}\n` : ''}

INSTRUCCIONES:
Analiza esta información y proporciona un diagnóstico preliminar estructurado. Responde ÚNICAMENTE en formato JSON con esta estructura exacta (sin markdown, sin \`\`\`json\`):

{
  "urgencyLevel": "urgent|moderate|mild",
  "urgencyTitle": "Título personalizado del nivel de urgencia para este caso específico (ej: 'Síntomas digestivos controlables', 'Evaluación urgente recomendada')",
  "urgencyDescription": "Descripción personalizada en 1-2 oraciones explicando por qué este caso tiene este nivel de urgencia basándose en los síntomas específicos del paciente",
  "urgencyTimeframe": "Recomendación temporal personalizada (ej: 'Consulta en las próximas 24-48 horas', 'Monitorea por 2-3 semanas')",
  "summary": "Resumen en 2-3 oraciones del análisis clínico basado en los síntomas y el perfil del paciente",
  "possibleDiagnoses": [
    {
      "name": "Nombre específico del diagnóstico",
      "probability": "high|medium|low",
      "description": "Explicación clara y profesional de por qué este diagnóstico es probable dado el cuadro clínico"
    }
  ],
  "recommendations": {
    "immediate": [
      {
        "title": "Acción inmediata recomendada",
        "description": "Explicación detallada de qué hacer y por qué",
        "priority": "high|medium|low"
      }
    ],
    "lifestyle": [
      {
        "title": "Cambio específico en estilo de vida",
        "description": "Explicación de cómo implementarlo y beneficios esperados"
      }
    ],
    "monitoring": [
      {
        "title": "Aspecto a monitorear",
        "description": "Cómo y cuándo monitorearlo, qué cambios observar"
      }
    ]
  },
  "redFlags": ["Señal de alarma 1 si aplica", "Señal de alarma 2 si aplica"],
  "nextSteps": ["Paso concreto 1", "Paso concreto 2", "Paso concreto 3"]
}

CRITERIOS PARA NIVEL DE URGENCIA:
- "urgent": Sangrado severo o rectal, dolor intenso e incapacitante, pérdida de peso inexplicable >5kg, fiebre persistente, incontinencia total súbita, síntomas de obstrucción intestinal
- "moderate": Síntomas persistentes >2 semanas que afectan calidad de vida, combinación de múltiples síntomas digestivos, dolor moderado recurrente, cambios en hábitos intestinales
- "mild": Síntomas leves u ocasionales, manejables con cambios de estilo de vida, sin señales de alarma

IMPORTANTE:
- Genera 2-4 diagnósticos diferenciales ordenados por probabilidad
- Sé específico con nombres de condiciones médicas (ej: "Hemorroides internas grado II" en lugar de solo "hemorroides")
- Las recomendaciones deben ser accionables y específicas
- Incluye red flags solo si realmente hay señales de alarma en los síntomas
- Siempre recomienda consultar con un profesional médico para confirmación
- Usa terminología médica pero accesible para el paciente`;

    // 7. Call OpenAI for analysis
    console.log('🤖 Calling OpenAI for diagnosis analysis...');
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: diagnosticPrompt
        }],
        temperature: 0.3,  // More deterministic for diagnoses
        max_tokens: 2500
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API error:', errorText);
      throw new Error('Failed to get diagnosis from OpenAI');
    }

    const openaiData = await openaiResponse.json();
    
    if (!openaiData.choices?.[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    // 8. Parse JSON response
    let diagnosisResult;
    try {
      const responseText = openaiData.choices[0].message.content.trim();
      // Remove markdown if exists
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      diagnosisResult = JSON.parse(jsonText);
      
      console.log('✅ Successfully parsed diagnosis result');
    } catch (parseError) {
      console.error('❌ Error parsing OpenAI response:', parseError);
      console.error('Raw response:', openaiData.choices[0].message.content);
      throw new Error('Failed to parse diagnosis result from AI');
    }

    console.log('✅ Diagnosis completed successfully');
    console.log('Urgency level:', diagnosisResult.urgencyLevel);
    console.log('Possible diagnoses:', diagnosisResult.possibleDiagnoses?.length);
    console.log('Red flags:', diagnosisResult.redFlags?.length || 0);

    // 9. Return result
    return c.json({
      success: true,
      result: diagnosisResult,
      metadata: {
        ragUsed: chunks && chunks.length > 0,
        chunksFound: chunks?.length || 0,
        symptomsAnalyzed: symptoms.length
      }
    });

  } catch (error) {
    console.error('❌ Error in diagnosis analysis:', error);
    return c.json({ 
      error: 'Failed to analyze diagnosis',
      details: error.message 
    }, 500);
  }
});

// ============================================================================
// DIAGNOSIS HISTORY ENDPOINTS
// ============================================================================

/**
 * Save diagnosis result to user's history
 */
app.post("/make-server-baa51d6b/diagnosis/save", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    console.error('❌ Authorization failed:', error);
    return c.json({ error: 'Unauthorized', details: error }, 401);
  }

  try {
    const requestData = await c.req.json();
    const { diagnosisResult, patientData, symptoms, specialty, metadata } = requestData;

    console.log('💾 ========================================');
    console.log('💾 SAVING DIAGNOSIS TO DATABASE');
    console.log('💾 ========================================');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('Specialty (raw):', specialty);
    console.log('Specialty (type):', typeof specialty);
    console.log('Patient Data:', patientData);
    console.log('Symptoms (count):', symptoms?.length);
    console.log('Symptoms:', symptoms);
    console.log('Diagnosis Result Keys:', diagnosisResult ? Object.keys(diagnosisResult) : 'null');
    console.log('Metadata:', metadata);
    console.log('💾 ========================================');

    // Validate required fields
    if (!diagnosisResult) {
      throw new Error('diagnosisResult is required');
    }
    if (!specialty) {
      throw new Error('specialty is required');
    }
    if (!patientData) {
      throw new Error('patientData is required');
    }

    // Normalize specialty (ensure it's a valid value)
    const normalizedSpecialty = specialty === 'MyColop' || specialty === 'MyPelvic' 
      ? specialty 
      : 'MyColop'; // fallback

    console.log('✅ Normalized specialty:', normalizedSpecialty);

    // Prepare data for insertion with careful type handling
    const insertData = {
      user_id: user.id,
      specialty: normalizedSpecialty,
      // Patient data - handle nulls carefully
      patient_gender: patientData?.gender || null,
      patient_age_range: patientData?.ageRange || null,
      patient_health_description: patientData?.healthDescription || null,
      patient_metadata: {
        medicalHistory: Array.isArray(patientData?.medicalHistory) ? patientData.medicalHistory : [],
        medications: Array.isArray(patientData?.medications) ? patientData.medications : [],
        problemAreas: Array.isArray(patientData?.problemAreas) ? patientData.problemAreas : []
      },
      // Symptoms - ensure it's an array
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      // Diagnosis result - validate urgency_level
      urgency_level: ['urgent', 'moderate', 'mild'].includes(diagnosisResult?.urgencyLevel) 
        ? diagnosisResult.urgencyLevel 
        : 'mild',
      urgency_title: diagnosisResult?.urgencyTitle || null,
      urgency_description: diagnosisResult?.urgencyDescription || null,
      urgency_timeframe: diagnosisResult?.urgencyTimeframe || null,
      summary: diagnosisResult?.summary || null,
      // JSONB fields - ensure they're valid JSON
      possible_diagnoses: Array.isArray(diagnosisResult?.possibleDiagnoses) 
        ? diagnosisResult.possibleDiagnoses 
        : [],
      recommendations: diagnosisResult?.recommendations && typeof diagnosisResult.recommendations === 'object'
        ? diagnosisResult.recommendations
        : {},
      // Arrays
      red_flags: Array.isArray(diagnosisResult?.redFlags) ? diagnosisResult.redFlags : [],
      next_steps: Array.isArray(diagnosisResult?.nextSteps) ? diagnosisResult.nextSteps : [],
      // Metadata
      rag_used: Boolean(metadata?.ragUsed),
      chunks_found: Number(metadata?.chunksFound) || 0
    };

    console.log('📝 ========================================');
    console.log('📝 INSERT DATA PREPARED');
    console.log('📝 ========================================');
    console.log('user_id:', insertData.user_id);
    console.log('specialty:', insertData.specialty);
    console.log('patient_gender:', insertData.patient_gender);
    console.log('patient_age_range:', insertData.patient_age_range);
    console.log('symptoms (count):', insertData.symptoms.length);
    console.log('urgency_level:', insertData.urgency_level);
    console.log('possible_diagnoses (count):', insertData.possible_diagnoses.length);
    console.log('recommendations (keys):', Object.keys(insertData.recommendations));
    console.log('red_flags (count):', insertData.red_flags.length);
    console.log('next_steps (count):', insertData.next_steps.length);
    console.log('rag_used:', insertData.rag_used);
    console.log('chunks_found:', insertData.chunks_found);
    console.log('📝 ========================================');

    // Insert into diagnosis_history table
    console.log('🔄 Calling Supabase insert...');
    const { data: diagnosis, error: insertError } = await supabase
      .from('diagnosis_history')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ ========================================');
      console.error('❌ DATABASE INSERT ERROR');
      console.error('❌ ========================================');
      console.error('Error message:', insertError.message);
      console.error('Error code:', insertError.code);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
      console.error('Full error:', JSON.stringify(insertError, null, 2));
      console.error('❌ ========================================');
      throw new Error(`Database error: ${insertError.message || insertError.code || 'Unknown error'}`);
    }

    if (!diagnosis) {
      console.error('❌ No diagnosis data returned after insert');
      throw new Error('No diagnosis data returned from database');
    }

    console.log('✅ ========================================');
    console.log('✅ DIAGNOSIS SAVED SUCCESSFULLY');
    console.log('✅ ========================================');
    console.log('Diagnosis ID:', diagnosis.id);
    console.log('Created at:', diagnosis.created_at);
    console.log('✅ ========================================');

    return c.json({
      success: true,
      diagnosisId: diagnosis.id,
      message: 'Diagnóstico guardado exitosamente'
    });

  } catch (error) {
    console.error('❌ ========================================');
    console.error('❌ FATAL ERROR SAVING DIAGNOSIS');
    console.error('❌ ========================================');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('❌ ========================================');
    
    return c.json({ 
      error: 'Failed to save diagnosis',
      details: error.message,
      type: error.name
    }, 500);
  }
});

/**
 * Get user's diagnosis history
 */
app.get("/make-server-baa51d6b/diagnosis/history", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const specialty = c.req.query('specialty');
    
    console.log('📋 Fetching diagnosis history for user:', user.id);
    if (specialty) {
      console.log('Filtering by specialty:', specialty);
    }

    // Query diagnosis_history table
    let query = supabase
      .from('diagnosis_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by specialty if provided
    if (specialty) {
      query = query.eq('specialty', specialty);
    }

    const { data: history, error: queryError } = await query;

    if (queryError) {
      console.error('❌ Database query error:', queryError);
      throw queryError;
    }

    console.log(`✅ Retrieved ${history?.length || 0} diagnoses from database`);

    return c.json({
      success: true,
      history: history || [],
      count: history?.length || 0
    });

  } catch (error) {
    console.error('❌ Error getting diagnosis history:', error);
    return c.json({ 
      error: 'Failed to get diagnosis history',
      details: error.message 
    }, 500);
  }
});

/**
 * Delete a diagnosis from history
 */
app.delete("/make-server-baa51d6b/diagnosis/:diagnosisId", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const diagnosisId = c.req.param('diagnosisId');

    console.log('🗑️ Deleting diagnosis:', diagnosisId);
    console.log('User ID:', user.id);

    // Delete from diagnosis_history table
    // RLS policies will ensure user can only delete their own diagnoses
    const { error: deleteError } = await supabase
      .from('diagnosis_history')
      .delete()
      .eq('id', diagnosisId)
      .eq('user_id', user.id); // Extra safety check

    if (deleteError) {
      console.error('❌ Database delete error:', deleteError);
      throw deleteError;
    }

    console.log('✅ Diagnosis deleted successfully:', diagnosisId);

    return c.json({
      success: true,
      message: 'Diagnóstico eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error deleting diagnosis:', error);
    return c.json({ 
      error: 'Failed to delete diagnosis',
      details: error.message 
    }, 500);
  }
});

/**
 * Get a specific diagnosis by ID
 */
app.get("/make-server-baa51d6b/diagnosis/:diagnosisId", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const diagnosisId = c.req.param('diagnosisId');

    console.log('📋 Fetching diagnosis details:', diagnosisId);
    console.log('User ID:', user.id);

    // Get diagnosis from database
    const { data: diagnosis, error: queryError } = await supabase
      .from('diagnosis_history')
      .select('*')
      .eq('id', diagnosisId)
      .eq('user_id', user.id) // Ensure user can only access their own diagnoses
      .single();

    if (queryError) {
      console.error('❌ Database query error:', queryError);
      throw queryError;
    }

    if (!diagnosis) {
      return c.json({ error: 'Diagnosis not found' }, 404);
    }

    console.log('✅ Diagnosis retrieved successfully');
    console.log('📋 Raw diagnosis data from DB:', diagnosis);

    // Reconstruct patient_data object from separate fields
    const reconstructedDiagnosis = {
      ...diagnosis,
      patient_data: {
        gender: diagnosis.patient_gender,
        ageRange: diagnosis.patient_age_range,
        healthDescription: diagnosis.patient_health_description,
        medicalHistory: diagnosis.patient_metadata?.medicalHistory || [],
        medications: diagnosis.patient_metadata?.medications || [],
        problemAreas: diagnosis.patient_metadata?.problemAreas || []
      }
    };

    console.log('✅ Reconstructed patient_data:', reconstructedDiagnosis.patient_data);

    return c.json({
      success: true,
      diagnosis: reconstructedDiagnosis
    });

  } catch (error) {
    console.error('❌ Error getting diagnosis:', error);
    return c.json({ 
      error: 'Failed to get diagnosis',
      details: error.message 
    }, 500);
  }
});

// ============================================================================
// USER PROFILE ROUTES
// ============================================================================

/**
 * Get user profile
 */
app.get("/make-server-baa51d6b/profile", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    console.error('❌ Authorization failed:', error);
    return c.json({ error: 'Unauthorized', details: error }, 401);
  }

  try {
    console.log('📋 Fetching profile for user:', user.id);
    console.log('📋 User email:', user.email);

    // Get profile from KV store
    const profileKey = `user_profile:${user.id}`;
    const { data: profileData, error: kvError } = await supabase
      .from('kv_store_baa51d6b')
      .select('value')
      .eq('key', profileKey)
      .single();

    if (kvError && kvError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Database error:', kvError);
      throw kvError;
    }

    // If no profile exists, return default profile with email
    if (!profileData) {
      console.log('📝 No profile found, returning default with email');
      return c.json({
        success: true,
        profile: {
          name: '',
          email: user.email,
          birthDate: '',
          gender: '',
          photoUrl: ''
        }
      });
    }

    const profile = profileData.value;
    console.log('✅ Profile found:', profile);

    return c.json({
      success: true,
      profile: {
        ...profile,
        email: user.email // Always use the authenticated email
      }
    });

  } catch (error) {
    console.error('❌ Error getting profile:', error);
    return c.json({ 
      error: 'Failed to get profile',
      details: error.message 
    }, 500);
  }
});

/**
 * Update user profile
 */
app.put("/make-server-baa51d6b/profile", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    console.error('❌ Authorization failed:', error);
    return c.json({ error: 'Unauthorized', details: error }, 401);
  }

  try {
    const profileData = await c.req.json();
    const { name, birthDate, gender, photoUrl } = profileData;

    console.log('💾 Updating profile for user:', user.id);
    console.log('💾 Profile data:', { name, birthDate, gender, photoUrl: photoUrl ? 'present' : 'empty' });

    const profileKey = `user_profile:${user.id}`;
    const profileValue = {
      name: name || '',
      birthDate: birthDate || '',
      gender: gender || '',
      photoUrl: photoUrl || '',
      updatedAt: new Date().toISOString()
    };

    // Upsert profile in KV store
    const { error: kvError } = await supabase
      .from('kv_store_baa51d6b')
      .upsert({
        key: profileKey,
        value: profileValue
      }, {
        onConflict: 'key'
      });

    if (kvError) {
      console.error('❌ Database error:', kvError);
      throw kvError;
    }

    console.log('✅ Profile updated successfully');

    return c.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      profile: {
        ...profileValue,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return c.json({ 
      error: 'Failed to update profile',
      details: error.message 
    }, 500);
  }
});

/**
 * Upload profile photo
 */
app.post("/make-server-baa51d6b/profile/upload-photo", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    console.error('❌ Authorization failed:', error);
    return c.json({ error: 'Unauthorized', details: error }, 401);
  }

  try {
    const body = await c.req.json();
    const { photoBase64, fileName } = body;

    if (!photoBase64) {
      return c.json({ error: 'No photo data provided' }, 400);
    }

    console.log('📸 Uploading profile photo for user:', user.id);
    console.log('📸 File name:', fileName);

    // Create bucket if it doesn't exist
    const bucketName = 'make-baa51d6b-profile-photos';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('📦 Creating storage bucket:', bucketName);
      await supabase.storage.createBucket(bucketName, {
        public: false
      });
    }

    // Remove data URL prefix if present
    const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to binary
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Generate unique file name
    const fileExt = fileName?.split('.').pop() || 'jpg';
    const uniqueFileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, binaryData, {
        contentType: `image/${fileExt}`,
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    console.log('✅ Photo uploaded:', uploadData.path);

    // Create signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(uploadData.path, 31536000); // 1 year in seconds

    if (urlError) {
      console.error('❌ Error creating signed URL:', urlError);
      throw urlError;
    }

    console.log('✅ Signed URL created');

    return c.json({
      success: true,
      photoUrl: urlData.signedUrl,
      message: 'Foto subida exitosamente'
    });

  } catch (error) {
    console.error('❌ Error uploading photo:', error);
    return c.json({ 
      error: 'Failed to upload photo',
      details: error.message 
    }, 500);
  }
});

// ============================================================================
// TREATMENT PLAN GENERATION WITH AI
// ============================================================================

/**
 * Generate personalized treatment plan using AI
 * POST /make-server-baa51d6b/treatment/generate
 */
app.post("/make-server-baa51d6b/treatment/generate", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    console.error('❌ Authorization failed:', error);
    return c.json({ error: 'Unauthorized', details: error }, 401);
  }

  try {
    const body = await c.req.json();
    const { 
      specialty, 
      patientData, 
      diagnosisResult,
      symptoms,
      metadata 
    } = body;

    console.log('🏋️ Generating personalized treatment plan...');
    console.log('📋 Patient:', { 
      gender: patientData.gender, 
      age: patientData.ageRange,
      problemAreas: patientData.problemAreas 
    });
    console.log('🎯 Diagnosis urgency:', diagnosisResult.urgencyLevel);

    if (!OPENAI_API_KEY) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    // Build comprehensive prompt for AI
    const treatmentPrompt = `Eres un fisioterapeuta especializado en ${specialty === 'MyPelvic' ? 'suelo pélvico' : 'salud colorectal'} con 15+ años de experiencia. 

INFORMACIÓN DEL PACIENTE:
- Género: ${patientData.gender === 'male' ? 'Masculino' : patientData.gender === 'female' ? 'Femenino' : 'Transgénero'}
- Edad: ${patientData.ageRange}
- Áreas problemáticas: ${patientData.problemAreas?.join(', ') || 'No especificadas'}
- Descripción de salud: ${patientData.healthDescription || 'No proporcionada'}
- Antecedentes médicos: ${patientData.medicalHistory ? 'Sí' : 'No'}
- Medicamentos actuales: ${patientData.medications ? 'Sí' : 'No'}

DIAGNÓSTICO ACTUAL:
- Nivel de urgencia: ${diagnosisResult.urgencyLevel}
- ${diagnosisResult.urgencyTitle}
- ${diagnosisResult.urgencyDescription}
- Resumen: ${diagnosisResult.summary}
- Posibles diagnósticos: ${diagnosisResult.possibleDiagnoses.map(d => `${d.name} (${d.probability})`).join(', ')}
- Señales de alerta: ${diagnosisResult.redFlags.join(', ')}

SÍNTOMAS REPORTADOS:
${symptoms.join(', ')}

INSTRUCCIONES PARA GENERAR EL PLAN:
Genera un plan de tratamiento COMPLETO y PERSONALIZADO de 8 semanas estructurado en 4 fases. Debe incluir:

1. **PROGRAMA DE EJERCICIOS** (lo más importante):
   - 8-12 ejercicios específicos distribuidos en 8 semanas
   - Progresión gradual de intensidad
   - Cada ejercicio debe tener:
     * Nombre descriptivo y motivador
     * Categoría (Fortalecimiento/Estiramiento/Relajación/Cardio/Yoga)
     * Nivel de dificultad (fácil/medio/difícil)
     * Duración estimada (en minutos)
     * Instrucciones paso a paso (5-6 pasos claros)
     * Beneficios específicos (3-4 beneficios)
     * Repeticiones/series
     * Frecuencia recomendada
     * Semanas recomendadas (ej: "Semanas 1-2" o "Semanas 3-4")
     * Precauciones si aplica
   
2. **FASES DEL PROGRAMA**:
   - Semanas 1-2: Adaptación (ejercicios suaves, educación)
   - Semanas 3-4: Fortalecimiento básico
   - Semanas 5-6: Intensificación progresiva  
   - Semanas 7-8: Consolidación y mantenimiento

3. **CAMBIOS EN ESTILO DE VIDA**:
   - Hábitos alimenticios específicos
   - Hidratación
   - Postura y ergonomía
   - Manejo del estrés
   - Hábitos de sueño

4. **SEGUIMIENTO Y MONITOREO**:
   - Qué síntomas monitorear
   - Cuándo consultar al médico
   - Hitos de progreso esperados

5. **CONSEJOS MOTIVACIONALES**:
   - Mensaje personalizado de ánimo
   - Recordatorios importantes
   - Tips para mantener la constancia

IMPORTANTE:
- Si urgencia es "urgent": Plan MUY SUAVE, énfasis en consulta médica URGENTE
- Si urgencia es "moderate": Plan balanceado, ejercicios moderados
- Si urgencia es "mild": Plan completo y progresivo
- Adapta según género y edad (ej: personas mayores = ejercicios más suaves)
- Considera las áreas problemáticas específicas
- Sé empático, motivador y profesional

FORMATO DE RESPUESTA:
Devuelve un JSON válido con esta estructura exacta:
{
  "planOverview": {
    "title": "string (título motivador del plan)",
    "description": "string (descripción breve)",
    "duration": "8 semanas",
    "difficulty": "Suave|Moderado|Intensivo",
    "goals": ["objetivo 1", "objetivo 2", "objetivo 3"]
  },
  "exercises": [
    {
      "id": "exercise-1",
      "title": "Nombre del ejercicio",
      "category": "Fortalecimiento|Estiramiento|Relajación|Cardio|Yoga",
      "difficulty": "easy|medium|hard",
      "duration": "10 min",
      "weeks": "Semanas 1-2",
      "icon": "🧘‍♀️|💪|🌬️|🚶|🐱|🌉|etc",
      "instructions": ["paso 1", "paso 2", "paso 3", "paso 4", "paso 5"],
      "benefits": ["beneficio 1", "beneficio 2", "beneficio 3"],
      "repetitions": "3 series de 10 repeticiones",
      "frequency": "Diario|3 veces por semana|etc",
      "precautions": ["precaución 1"] // opcional
    }
  ],
  "lifestyleChanges": [
    {
      "category": "Nutrición|Hidratación|Postura|Estrés|Sueño",
      "title": "Título del cambio",
      "description": "Descripción detallada",
      "icon": "🥗|💧|🧘|😌|😴"
    }
  ],
  "monitoring": {
    "trackSymptoms": ["síntoma a monitorear 1", "síntoma 2"],
    "warningSignsForDoctor": ["señal de alerta 1", "señal 2"],
    "expectedMilestones": [
      {
        "week": 2,
        "milestone": "Deberías sentir X"
      }
    ]
  },
  "motivationalMessage": "Mensaje personalizado y motivador para el paciente"
}

RESPONDE SOLO CON EL JSON, SIN MARKDOWN, SIN EXPLICACIONES ADICIONALES.`;

    console.log('🤖 Calling OpenAI to generate treatment plan...');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Eres un fisioterapeuta experto que genera planes de tratamiento personalizados en formato JSON. Respondes SOLO con JSON válido, sin markdown ni explicaciones.'
          },
          {
            role: 'user',
            content: treatmentPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('❌ OpenAI API error:', errorData);
      return c.json({ 
        error: 'Failed to generate treatment plan',
        details: errorData 
      }, 500);
    }

    const openAIData = await openAIResponse.json();
    const aiResponseContent = openAIData.choices[0]?.message?.content;

    if (!aiResponseContent) {
      console.error('❌ No content in OpenAI response');
      return c.json({ error: 'No treatment plan generated' }, 500);
    }

    console.log('✅ AI generated treatment plan');

    // Parse the JSON response
    let treatmentPlan;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = aiResponseContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      treatmentPlan = JSON.parse(cleanedContent);
      console.log('✅ Successfully parsed treatment plan JSON');
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', aiResponseContent);
      return c.json({ 
        error: 'Invalid treatment plan format',
        details: parseError.message,
        rawResponse: aiResponseContent 
      }, 500);
    }

    // Add IDs and completion status to exercises
    const exercisesWithMetadata = treatmentPlan.exercises.map((exercise: any, index: number) => ({
      ...exercise,
      id: exercise.id || `ai-exercise-${index + 1}`,
      completed: false,
      completedDates: [],
      applicableFor: patientData.problemAreas || []
    }));

    const finalPlan = {
      ...treatmentPlan,
      exercises: exercisesWithMetadata,
      generatedAt: new Date().toISOString(),
      generatedFor: {
        userId: user.id,
        specialty,
        urgencyLevel: diagnosisResult.urgencyLevel
      }
    };

    console.log('✅ Treatment plan generated successfully');
    console.log(`📊 Plan includes ${exercisesWithMetadata.length} exercises`);

    // 🆕 AUTO-SAVE: Guardar el plan generado en la base de datos
    try {
      const diagnosisId = body.diagnosisId; // ID del diagnóstico asociado
      if (diagnosisId) {
        const planKey = `treatment_plan:${user.id}:${diagnosisId}`;
        
        // Guardar en kv_store usando supabase directamente
        await supabase
          .from('kv_store_baa51d6b')
          .upsert({
            key: planKey,
            value: finalPlan
          });
        
        console.log(`💾 Treatment plan auto-saved with key: ${planKey}`);
      }
    } catch (saveError) {
      console.error('⚠️ Failed to auto-save treatment plan:', saveError);
      // No bloqueamos la respuesta si falla el guardado
    }

    return c.json({ 
      success: true,
      treatmentPlan: finalPlan
    });

  } catch (error) {
    console.error('❌ Error generating treatment plan:', error);
    return c.json({ 
      error: 'Failed to generate treatment plan',
      details: error.message 
    }, 500);
  }
});

// ============================================================================
// TREATMENT PLAN PERSISTENCE
// ============================================================================

/**
 * Save treatment plan to database
 * POST /make-server-baa51d6b/treatment/save
 */
app.post("/make-server-baa51d6b/treatment/save", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    console.error('❌ Authorization failed:', error);
    return c.json({ error: 'Unauthorized', details: error }, 401);
  }

  try {
    const body = await c.req.json();
    const { diagnosisId, treatmentPlan } = body;

    if (!diagnosisId || !treatmentPlan) {
      return c.json({ error: 'Missing diagnosisId or treatmentPlan' }, 400);
    }

    const planKey = `treatment_plan:${user.id}:${diagnosisId}`;
    
    // Guardar en kv_store usando supabase directamente
    await supabase
      .from('kv_store_baa51d6b')
      .upsert({
        key: planKey,
        value: {
          ...treatmentPlan,
          savedAt: new Date().toISOString()
        }
      });

    console.log(`💾 Treatment plan saved for user ${user.id}, diagnosis ${diagnosisId}`);

    return c.json({ 
      success: true,
      message: 'Treatment plan saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving treatment plan:', error);
    return c.json({ 
      error: 'Failed to save treatment plan',
      details: error.message 
    }, 500);
  }
});

/**
 * Get treatment plan from database
 * GET /make-server-baa51d6b/treatment/plan/:diagnosisId
 */
app.get("/make-server-baa51d6b/treatment/plan/:diagnosisId", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) {
    console.error('❌ Authorization failed:', error);
    return c.json({ error: 'Unauthorized', details: error }, 401);
  }

  try {
    const diagnosisId = c.req.param('diagnosisId');
    const planKey = `treatment_plan:${user.id}:${diagnosisId}`;
    
    // Obtener del kv_store usando supabase directamente
    const { data, error: kvError } = await supabase
      .from('kv_store_baa51d6b')
      .select('value')
      .eq('key', planKey)
      .single();

    if (kvError || !data) {
      console.error('❌ Error retrieving treatment plan:', kvError);
      return c.json({ error: 'Treatment plan not found' }, 404);
    }

    const treatmentPlan = data.value;

    console.log(`📥 Retrieved treatment plan for user ${user.id}, diagnosis ${diagnosisId}`);

    return c.json({ 
      success: true,
      treatmentPlan
    });

  } catch (error) {
    console.error('❌ Error retrieving treatment plan:', error);
    return c.json({ 
      error: 'Failed to retrieve treatment plan',
      details: error.message 
    }, 500);
  }
});

// ============================================================================
// START SERVER
// ============================================================================

console.log('🚀 Server starting...');
console.log('✅ Server ready!');

Deno.serve(app.fetch);
