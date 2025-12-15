/**
 * OPENAI SERVICE
 * Gestiona interacciones con la API de OpenAI
 */

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | any[];
}

export interface ChatCompletionOptions {
  model?: string;
  messages: OpenAIMessage[];
  maxTokens?: number;
  temperature?: number;
}

/**
 * Get system prompt based on specialty
 */
export function getSystemPrompt(specialty: string): string {
  const baseFormatting = `
IMPORTANTE - Formato de respuesta:
- Usa Markdown para dar formato a tus respuestas
- Usa emojis relevantes para hacer las respuestas más amigables (ej: 💪, 🏥, ✅, ⚠️, 📋, 🎯)
- Usa **negritas** para títulos y puntos importantes
- Usa ### para títulos de secciones
- Usa listas numeradas o con viñetas cuando sea apropiado
- Estructura la información de forma clara y organizada
- Siempre recomienda consultar con un profesional médico para diagnósticos y tratamientos específicos`;

  if (specialty === 'MyPelvic') {
    return `Eres un asistente médico especializado en salud pélvica. Proporciona información precisa, empática y profesional sobre problemas del suelo pélvico, incontinencia, prolapsos y salud sexual.${baseFormatting}`;
  } else if (specialty === 'MyColop') {
    return `Eres un asistente médico especializado en coloproctología. Proporciona información precisa, empática y profesional sobre hemorroides, problemas colorectales, salud digestiva y trastornos del colon.${baseFormatting}`;
  } else {
    return `Eres un asistente médico profesional. Proporciona información precisa y empática.${baseFormatting}`;
  }
}

/**
 * Call OpenAI Chat Completions API
 */
export async function getChatCompletion(
  options: ChatCompletionOptions
): Promise<{ content: string; model: string } | null> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    return null;
  }

  const {
    model = 'gpt-4o-mini',
    messages,
    maxTokens = 2000,
    temperature = 0.7,
  } = options;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

    return {
      content,
      model,
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return null;
  }
}

/**
 * Generate a chat title based on the first user message
 */
export async function generateChatTitle(firstMessage: string): Promise<string | null> {
  const result = await getChatCompletion({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Genera un título corto (máximo 6 palabras) para esta conversación médica. Responde SOLO con el título, sin puntos finales ni comillas.'
      },
      {
        role: 'user',
        content: firstMessage
      }
    ],
    maxTokens: 20,
    temperature: 0.7,
  });

  return result?.content || null;
}

/**
 * Prepare messages with attachments for OpenAI
 */
export function prepareMessagesWithAttachments(
  messages: any[],
  systemPrompt: string
): OpenAIMessage[] {
  const openaiMessages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const msg of messages) {
    const imageAttachments = msg.attachments?.filter((att: any) => 
      att.type === 'image' && att.base64
    ) || [];
    
    const fileAttachments = msg.attachments?.filter((att: any) => 
      att.type === 'file' && att.base64
    ) || [];

    // Build content array
    let contentArray: any[] = [
      {
        type: 'text',
        text: msg.content
      }
    ];

    // Add file content as text if present
    if (fileAttachments.length > 0) {
      for (const file of fileAttachments) {
        const safeText = file.extractedText 
          ? String(file.extractedText).replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').trim()
          : '[El contenido del archivo no pudo ser extraído. Por favor, compárteme manualmente el contenido que necesitas que analice.]';
        
        const fileName = String(file.name || 'documento').replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        
        contentArray.push({
          type: 'text',
          text: `\n\n[Archivo adjunto: ${fileName}]\n${safeText}\n`
        });
      }
    }

    // Add images
    if (imageAttachments.length > 0) {
      contentArray.push(...imageAttachments.map((att: any) => {
        let imageUrl = att.base64;
        
        if (!imageUrl.startsWith('data:image/')) {
          if (!imageUrl.includes('data:')) {
            imageUrl = `data:image/jpeg;base64,${imageUrl}`;
          }
        }
        
        return {
          type: 'image_url',
          image_url: {
            url: imageUrl,
            detail: 'high'
          }
        };
      }));
    }

    openaiMessages.push({
      role: msg.role,
      content: contentArray
    });
  }

  return openaiMessages;
}

/**
 * Determine which model to use based on content
 */
export function selectModel(messages: OpenAIMessage[]): string {
  const hasVisionContent = messages.some(msg => 
    Array.isArray(msg.content) && msg.content.some((c: any) => c.type === 'image_url')
  );
  
  // Use gpt-4o for vision (supports images), gpt-4o-mini for text only
  return hasVisionContent ? 'gpt-4o' : 'gpt-4o-mini';
}