import type { SupabaseClient } from '@supabase/supabase-js';
import { detectFileType, type FileType } from '../detectors/detectFileType';
import { extractPdfText } from '../extractors/pdfExtractor';
import { extractText } from '../extractors/textExtractor';
import { extractAudio } from '../extractors/audioExtractor';
import { extractAudioFromVideo } from '../extractors/videoExtractor';
import { transcribeAudio } from '../transcribers/whisperTranscriber';
import { chunkText } from '../chunkers/textChunker';
import { createEmbeddings } from '../embedders/openaiEmbedder';
import { createDocumentRecord, updateDocumentStatus } from '../persistence/saveDocument';
import { saveChunks } from '../persistence/saveChunks';
import { saveEmbeddings } from '../persistence/saveEmbeddings';

export interface ProcessDocumentInput {
  supabase: SupabaseClient;
  storageBucket: string;
  storagePath: string;
  userId: string;
  specialty: string;
  title: string;
  openaiApiKey: string;
  fileTypeHint?: FileType;
  ffmpegPath?: string;
}

export async function processDocumentJob(input: ProcessDocumentInput) {
  const {
    supabase,
    storageBucket,
    storagePath,
    userId,
    specialty,
    title,
    openaiApiKey,
    fileTypeHint,
    ffmpegPath
  } = input;

  let documentId: string | null = null;

  try {
    console.log('[ingestion] Starting download:', storagePath);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(storageBucket)
      .download(storagePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // @ts-ignore supabase types differ between runtime; Blob in browser/edge
    const arrayBuffer: ArrayBuffer = await fileData.arrayBuffer();
    const binary = new Uint8Array(arrayBuffer);
    const fileSize = binary.byteLength;

    const fileType = fileTypeHint ?? detectFileType(storagePath);
    console.log('[ingestion] Detected fileType:', fileType);

    // 1) Crear registro de documento
    const document = await createDocumentRecord(supabase, {
      userId,
      specialty,
      title,
      fileName: storagePath.split('/').pop() || storagePath,
      fileType: fileType,
      fileSize,
      storagePath,
      metadata: { source: 'ingestion-pipeline', fileType }
    });
    documentId = document.id;

    // 2) Extraer texto
    const textContent = await extractTextByType({
      binary,
      fileType,
      storagePath,
      openaiApiKey,
      ffmpegPath
    });

    if (!textContent?.trim()) {
      throw new Error('Extraction produced empty content');
    }

    // 3) Chunking
    const chunks = chunkText(textContent);
    console.log('[ingestion] Generated chunks:', chunks.length);

    // 4) Persistir chunks
    const chunkRecords = await saveChunks(
      supabase,
      documentId,
      chunks.map(c => ({
        content: c.content,
        tokenCount: c.tokenCount,
        index: c.index,
        metadata: { fileType }
      }))
    );

    // 5) Embeddings
    const embeddings = await createEmbeddings(
      chunks.map(c => c.content),
      openaiApiKey
    );

    const chunkIdByIndex = new Map<number, string>();
    for (const record of chunkRecords) {
      chunkIdByIndex.set(record.chunk_index, record.id);
    }

    await saveEmbeddings(
      supabase,
      embeddings.map(e => ({
        chunkId: ensureChunkId(chunkIdByIndex, e.index),
        embedding: e.embedding,
        model: 'text-embedding-3-small'
      }))
    );

    // 6) Actualizar estado
    await updateDocumentStatus(supabase, documentId, 'ready', {
      totalChunks: chunks.length,
      metadata: { fileType, ingestedAt: new Date().toISOString() }
    });

    console.log('[ingestion] Completed for document:', documentId);
    return { documentId, chunks: chunks.length };
  } catch (error: any) {
    console.error('[ingestion] Error:', error);
    if (documentId) {
      try {
        await updateDocumentStatus(supabase, documentId, 'error', {
          metadata: { error: error.message }
        });
      } catch (statusError) {
        console.error('[ingestion] Failed to update error status:', statusError);
      }
    }
    throw error;
  }
}

async function extractTextByType(params: {
  binary: Uint8Array;
  fileType: FileType;
  storagePath: string;
  openaiApiKey: string;
  ffmpegPath?: string;
}): Promise<string> {
  const { binary, fileType, storagePath, openaiApiKey, ffmpegPath } = params;

  switch (fileType) {
    case 'pdf':
      return extractPdfText(binary);
    case 'markdown':
    case 'json':
    case 'text':
      return extractText(binary, fileType);
    case 'audio': {
      const audio = extractAudio(binary);
      return transcribeAudio(audio, storagePath, openaiApiKey);
    }
    case 'video': {
      const audioBuffer = await extractAudioFromVideo(binary, ffmpegPath);
      return transcribeAudio(audioBuffer, storagePath, openaiApiKey);
    }
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

function ensureChunkId(map: Map<number, string>, index: number): string {
  const id = map.get(index);
  if (!id) {
    throw new Error(`Missing chunk id for index ${index}`);
  }
  return id;
}

