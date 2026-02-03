/**
 * PDF Text Extractor for Deno
 * Extracts text from base64-encoded PDF files using pdf-parse library
 */

import pdf from "npm:pdf-parse@1.1.1";
import mammoth from "npm:mammoth@1.6.0";

/**
 * Sanitize text to remove problematic characters and escape sequences
 */
function sanitizeText(text: string): string {
  if (!text) return '';
  
  // First, normalize the text
  let sanitized = text;
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove or replace problematic control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  
  // Replace problematic Unicode characters that cause JSON issues
  // Keep only safe characters: letters, numbers, common punctuation, spaces, newlines
  sanitized = sanitized
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      // Allow: printable ASCII, extended Latin, common Unicode
      if (
        (code >= 32 && code <= 126) ||  // Basic ASCII
        code === 9 ||                    // Tab
        code === 10 ||                   // Line feed
        code === 13 ||                   // Carriage return
        (code >= 160 && code <= 255) ||  // Extended Latin
        (code >= 0x0100 && code <= 0x017F) || // Latin Extended-A
        (code >= 0x0180 && code <= 0x024F) || // Latin Extended-B
        (code >= 0x1E00 && code <= 0x1EFF) || // Latin Extended Additional
        (code >= 0x2000 && code <= 0x206F) || // General Punctuation
        (code >= 0x20A0 && code <= 0x20CF) || // Currency Symbols
        (code >= 0x2100 && code <= 0x214F)    // Letterlike Symbols
      ) {
        return char;
      }
      // Replace unsafe characters with space
      return ' ';
    })
    .join('');
  
  // Normalize whitespace
  sanitized = sanitized
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\r/g, '\n')     // Mac line endings
    .replace(/\t/g, ' ')      // Tabs to spaces
    .replace(/  +/g, ' ')     // Multiple spaces to single
    .replace(/\n\n\n+/g, '\n\n'); // Max 2 consecutive newlines
  
  return sanitized.trim();
}

/**
 * Extract text from PDF using pdf-parse library
 */
export async function extractTextFromPDF(base64Data: string): Promise<string> {
  try {
    console.log('Starting PDF text extraction...');
    
    // Remove data URL prefix if present
    const base64String = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;
    
    // Decode base64 to binary buffer
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('PDF decoded, size:', bytes.length, 'bytes');
    
    // Parse PDF using pdf-parse
    const data = await pdf(bytes);
    
    console.log('PDF parsed successfully:', {
      pages: data.numpages,
      textLength: data.text?.length || 0
    });
    
    if (!data.text || data.text.trim().length === 0) {
      console.log('No text found in PDF');
      return '[El PDF no contiene texto extraíble. Puede ser un PDF escaneado (solo imágenes). Por favor, describe el contenido del documento o convierte las imágenes a texto primero.]';
    }
    
    // Sanitize the extracted text
    const sanitizedText = sanitizeText(data.text);
    
    console.log('PDF text extraction successful:', {
      originalLength: data.text.length,
      sanitizedLength: sanitizedText.length,
      preview: sanitizedText.substring(0, 200)
    });
    
    return sanitizedText;
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    return '[Error al procesar el PDF. El archivo puede estar corrupto, protegido con contraseña, o tener un formato no compatible. Por favor, intenta convertirlo a texto o describe su contenido.]';
  }
}

/**
 * Extract text from TXT files
 */
export async function extractTextFromTXT(base64Data: string): Promise<string> {
  try {
    const base64String = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;
    
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(bytes);
    
    return sanitizeText(text);
  } catch (error) {
    console.error('Error extracting text from TXT:', error);
    return '[Error al leer el archivo de texto.]';
  }
}

/**
 * Extract text from DOCX files
 */
export async function extractTextFromDOCX(base64Data: string): Promise<string> {
  try {
    const base64String = base64Data.includes('base64,')
      ? base64Data.split('base64,')[1]
      : base64Data;

    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { value } = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });
    return sanitizeText(value || '');
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    return '[Error al leer el archivo Word.]';
  }
}

/**
 * Process attachments and extract text from files
 */
export async function processAttachments(attachments: any[]): Promise<any[]> {
  if (!attachments || attachments.length === 0) {
    console.log('[processAttachments] No attachments to process');
    return [];
  }
  
  console.log('[processAttachments] Processing', attachments.length, 'attachments');
  const processedAttachments = [];
  
  const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024; // 5 MB

  for (const attachment of attachments) {
    console.log('[processAttachments] Processing attachment:', {
      type: attachment.type,
      name: attachment.name,
      hasBase64: !!attachment.base64
    });
    
    if (attachment.type === 'file' && attachment.base64) {
      const fileName = attachment.name?.toLowerCase() || '';
      const size = typeof attachment.size === 'number' ? attachment.size : 0;
      
      // Check file type
      const isPDF = fileName.endsWith('.pdf') || attachment.base64.includes('application/pdf');
      const isTXT = fileName.endsWith('.txt') || attachment.base64.includes('text/plain');
      const isDOCX = fileName.endsWith('.docx') || attachment.base64.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      const isDOC = fileName.endsWith('.doc') || attachment.base64.includes('application/msword');
      const hasPlaceholderText = typeof attachment.extractedText === 'string' && attachment.extractedText.trim().startsWith('[');

      if (size > MAX_DOCUMENT_BYTES) {
        processedAttachments.push({
          ...attachment,
          extractedText: '',
          extractionError: 'El documento supera el tamaño máximo permitido (5 MB).'
        });
        continue;
      }
      
      if (isDOC) {
        processedAttachments.push({
          ...attachment,
          extractedText: '',
          extractionError: 'El formato DOC no es compatible. Por favor convierte el archivo a DOCX o PDF.'
        });
      } else if (isPDF && (!attachment.extractedText || hasPlaceholderText)) {
        console.log('[processAttachments] Extracting text from PDF:', attachment.name);
        const extractedText = await extractTextFromPDF(attachment.base64);
        const isInvalid = !extractedText || extractedText.startsWith('[');
        processedAttachments.push({
          ...attachment,
          extractedText: isInvalid ? '' : extractedText,
          extractionError: isInvalid ? 'No se pudo extraer texto del PDF. Es posible que sea escaneado o ilegible.' : undefined
        });
      } else if (isTXT && (!attachment.extractedText || hasPlaceholderText)) {
        console.log('[processAttachments] Extracting text from TXT:', attachment.name);
        const extractedText = await extractTextFromTXT(attachment.base64);
        const isInvalid = !extractedText || extractedText.startsWith('[');
        processedAttachments.push({
          ...attachment,
          extractedText: isInvalid ? '' : extractedText,
          extractionError: isInvalid ? 'No se pudo leer el archivo de texto. Verifica que no esté vacío o corrupto.' : undefined
        });
      } else if (isDOCX && (!attachment.extractedText || hasPlaceholderText)) {
        console.log('[processAttachments] Extracting text from DOCX:', attachment.name);
        const extractedText = await extractTextFromDOCX(attachment.base64);
        const isInvalid = !extractedText || extractedText.startsWith('[');
        processedAttachments.push({
          ...attachment,
          extractedText: isInvalid ? '' : extractedText,
          extractionError: isInvalid ? 'No se pudo leer el documento Word. Verifica que no esté protegido o corrupto.' : undefined
        });
      } else {
        processedAttachments.push(attachment);
      }
    } else {
      // Pass through non-file attachments (like images) unchanged
      console.log('[processAttachments] Passing through attachment (not a file):', attachment.type);
      processedAttachments.push(attachment);
    }
  }
  
  console.log('[processAttachments] Finished processing. Result count:', processedAttachments.length);
  return processedAttachments;
}
