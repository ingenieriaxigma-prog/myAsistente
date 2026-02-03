/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ATTACHMENT PROCESSOR SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RESPONSABILIDAD: Procesar archivos adjuntos (imágenes y documentos)
 * 
 * FUNCIONES PRINCIPALES:
 * 1. processAttachmentsForOpenAI() - Formatea attachments para OpenAI API
 * 2. hasVisionContent() - Detecta si hay imágenes en los mensajes
 * 3. hasDocumentContent() - Detecta si hay documentos en los mensajes
 * 
 * TIPOS DE ATTACHMENTS SOPORTADOS:
 * - Imágenes (JPG, PNG) → Usa Vision API
 * - PDFs → Texto extraído en el frontend
 * - Documentos de texto → Contenido directo
 * 
 * ⚠️ NO MODIFICAR sin verificar que imágenes y PDFs sigan funcionando.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface Attachment {
  type: 'image' | 'file';
  name: string;
  data_url?: string;  // For images (base64)
  extractedText?: string;  // For documents
}

export interface ProcessedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
}

/**
 * Process attachments and format messages for OpenAI
 * 
 * IMPORTANTE: Esta función maneja TANTO imágenes como documentos
 * - Imágenes → Se envían como image_url para Vision API
 * - Documentos → Se envían como texto extraído
 * 
 * @param messages - Array of chat messages with potential attachments
 * @returns Processed messages ready for OpenAI API
 */
export function processAttachmentsForOpenAI(messages: any[]): {
  processedMessages: ProcessedMessage[];
  hasImages: boolean;
  hasDocuments: boolean;
} {
  let hasImages = false;
  let hasDocuments = false;

  const processedMessages: ProcessedMessage[] = messages.map(msg => {
    // Messages without attachments - simple text
    if (!msg.attachments || msg.attachments.length === 0) {
      return {
        role: msg.role,
        content: msg.content
      };
    }

    // Messages with attachments - build content array
    const contentParts: any[] = [
      { type: 'text', text: msg.content }
    ];

    let documentContext = '';

    // Process each attachment
    for (const attachment of msg.attachments) {
      // IMAGES: Use Vision API
      if (attachment.type === 'image' && attachment.data_url) {
        hasImages = true;
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: attachment.data_url,
            detail: 'high' // High detail for medical images
          }
        });
        console.log(`📷 ATTACHMENTS: Added image "${attachment.name}" (${Math.round(attachment.data_url.length / 1024)}KB)`);
      }

      // DOCUMENTS: Extract text and add to context
      if (attachment.type === 'file' && attachment.extractedText) {
        hasDocuments = true;
        documentContext += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📄 DOCUMENTO: ${attachment.name}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${attachment.extractedText}\n`;
        console.log(`📄 ATTACHMENTS: Added document "${attachment.name}" (${attachment.extractedText.length} chars)`);
      }
    }

    // If there are documents, append them to the text
    if (documentContext) {
      contentParts[0].text = `${msg.content}\n${documentContext}`;
    }

    return {
      role: msg.role,
      content: contentParts
    };
  });

  console.log(`✅ ATTACHMENTS: Processed ${messages.length} messages (images: ${hasImages}, documents: ${hasDocuments})`);

  return {
    processedMessages,
    hasImages,
    hasDocuments
  };
}

/**
 * Check if messages contain vision content (images)
 * 
 * @param messages - Array of chat messages
 * @returns true if any message has images
 */
export function hasVisionContent(messages: any[]): boolean {
  return messages.some(msg => 
    msg.attachments?.some((att: Attachment) => 
      att.type === 'image' && att.data_url
    )
  );
}

/**
 * Check if messages contain document content
 * 
 * @param messages - Array of chat messages
 * @returns true if any message has documents
 */
export function hasDocumentContent(messages: any[]): boolean {
  return messages.some(msg =>
    msg.attachments?.some((att: Attachment) =>
      att.type === 'file' && att.extractedText
    )
  );
}

/**
 * Get total size of attachments in a message
 * 
 * @param message - Single message with attachments
 * @returns Size in bytes
 */
export function getAttachmentsSize(message: any): number {
  if (!message.attachments) return 0;
  
  let totalSize = 0;
  for (const att of message.attachments) {
    if (att.data_url) {
      totalSize += att.data_url.length;
    }
    if (att.extractedText) {
      totalSize += att.extractedText.length;
    }
  }
  
  return totalSize;
}
