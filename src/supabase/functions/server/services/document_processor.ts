/**
 * DOCUMENT PROCESSOR
 * Procesa documentos: extrae texto, divide en chunks, genera embeddings
 */

import * as documentsService from './documents.ts';
import * as embeddingsService from './embeddings.ts';

/**
 * Split text into chunks with overlap
 */
export function splitIntoChunks(
  text: string,
  maxTokens: number = 500,
  overlap: number = 50
): string[] {
  // Approximate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  const overlapChars = overlap * 4;

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChars;

    // If not the last chunk, try to break at sentence or paragraph
    if (end < text.length) {
      // Look for paragraph break
      const paragraphBreak = text.lastIndexOf('\n\n', end);
      if (paragraphBreak > start) {
        end = paragraphBreak;
      } else {
        // Look for sentence break
        const sentenceBreak = text.lastIndexOf('. ', end);
        if (sentenceBreak > start) {
          end = sentenceBreak + 1;
        }
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start with overlap
    start = end - overlapChars;
    if (start < 0) start = 0;
  }

  return chunks;
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Process a document: create chunks and generate embeddings
 */
export async function processDocument(
  documentId: string,
  fullText: string,
  metadata?: any
): Promise<boolean> {
  console.log(`📄 Processing document: ${documentId}`);
  console.log(`   Text length: ${fullText.length} characters`);

  try {
    // Split into chunks
    const chunks = splitIntoChunks(fullText, 500, 50);
    console.log(`   Created ${chunks.length} chunks`);

    // Create chunk records in database
    const chunkRecords = chunks.map((content, index) => ({
      document_id: documentId,
      chunk_index: index,
      content,
      token_count: estimateTokenCount(content),
      metadata: metadata || {},
    }));

    const createdChunks = await documentsService.createChunks(chunkRecords);

    if (!createdChunks) {
      console.error('❌ Failed to create chunks');
      await documentsService.updateDocument(documentId, {
        status: 'failed',
        metadata: { error: 'Failed to create chunks' },
      });
      return false;
    }

    console.log(`✅ Created ${createdChunks.length} chunk records`);

    // Generate embeddings for each chunk
    let successCount = 0;
    let failCount = 0;

    for (const chunk of createdChunks) {
      console.log(`   Generating embedding for chunk ${chunk.chunk_index + 1}/${createdChunks.length}...`);
      
      const embedding = await embeddingsService.generateEmbedding(chunk.content);
      
      if (embedding) {
        const created = await embeddingsService.createEmbedding(chunk.id, embedding);
        if (created) {
          successCount++;
        } else {
          failCount++;
          console.error(`   ❌ Failed to store embedding for chunk ${chunk.chunk_index}`);
        }
      } else {
        failCount++;
        console.error(`   ❌ Failed to generate embedding for chunk ${chunk.chunk_index}`);
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Embeddings: ${successCount} success, ${failCount} failed`);

    // Update document status
    await documentsService.updateDocument(documentId, {
      status: successCount > 0 ? 'completed' : 'failed',
      total_chunks: createdChunks.length,
      processed_at: new Date().toISOString(),
      metadata: {
        ...metadata,
        chunks_processed: createdChunks.length,
        embeddings_created: successCount,
        embeddings_failed: failCount,
      },
    });

    console.log(`✅ Document processing complete`);
    return true;

  } catch (error) {
    console.error('❌ Error processing document:', error);
    
    await documentsService.updateDocument(documentId, {
      status: 'failed',
      metadata: { error: String(error) },
    });

    return false;
  }
}

/**
 * Process a PDF file (extract text and process)
 */
export async function processPDFDocument(
  documentId: string,
  pdfBase64: string,
  metadata?: any
): Promise<boolean> {
  try {
    console.log(`📄 Extracting text from PDF for document: ${documentId}`);

    // Import PDF extractor
    const { extractTextFromPDF } = await import('../pdf_extractor.tsx');
    
    // Extract text
    const extractedText = await extractTextFromPDF(pdfBase64);

    if (!extractedText || extractedText.trim().length === 0) {
      console.error('❌ No text extracted from PDF');
      await documentsService.updateDocument(documentId, {
        status: 'failed',
        metadata: { error: 'No text could be extracted from PDF' },
      });
      return false;
    }

    console.log(`✅ Extracted ${extractedText.length} characters from PDF`);

    // Process the extracted text
    return await processDocument(documentId, extractedText, {
      ...metadata,
      extraction_method: 'pdf-parse',
    });

  } catch (error) {
    console.error('❌ Error processing PDF:', error);
    
    await documentsService.updateDocument(documentId, {
      status: 'failed',
      metadata: { error: String(error) },
    });

    return false;
  }
}
