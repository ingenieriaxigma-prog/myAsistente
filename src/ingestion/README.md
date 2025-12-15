# Ingestión de Documentos y Multimedia

Arquitectura modular para cargar, procesar y vectorizar documentos/audio/video para el sistema RAG. No modifica código existente: todo es opt‑in y autocontenido bajo `src/ingestion/`.

## Flujo
1) Crear registro en `documents` (`status=processing`).
2) Descargar archivo desde Supabase Storage.
3) Detectar tipo (PDF, texto, audio, video).
4) Extraer texto o transcribir (audio/video → Whisper).
5) Chunking del texto (≈500–800 tokens equivalentes).
6) Guardar chunks en `document_chunks`.
7) Generar embeddings (OpenAI `text-embedding-3-small`).
8) Guardar embeddings en tabla `embeddings`.
9) Actualizar `documents.status=ready` y `processed_at`.
10) Ante error: marcar `status=error` y loguear.

## Formatos soportados
- PDF: extracción de texto.
- TXT/MD/JSON: ingestión directa (UTF-8).
- Audio (mp3/wav): transcripción con Whisper.
- Video (mp4/mkv/avi): ffmpeg → audio → Whisper. No se generan embeddings de video crudo.

## Estructura
```
src/ingestion/
 ├─ index.ts                  # Punto de entrada/orquestador
 ├─ detectors/detectFileType.ts
 ├─ extractors/pdfExtractor.ts
 ├─ extractors/textExtractor.ts
 ├─ extractors/audioExtractor.ts
 ├─ extractors/videoExtractor.ts
 ├─ transcribers/whisperTranscriber.ts
 ├─ chunkers/textChunker.ts
 ├─ embedders/openaiEmbedder.ts
 ├─ persistence/saveDocument.ts
 ├─ persistence/saveChunks.ts
 ├─ persistence/saveEmbeddings.ts
 ├─ queues/ingestionQueue.ts
 └─ jobs/processDocumentJob.ts
```

## Uso básico
- `processDocumentJob` recibe `supabase`, `storageBucket`, `storagePath`, `userId`, `specialty`, `title`, `openaiApiKey` y orquesta todo.
- `ingestDocument` en `index.ts` es un wrapper que usa la cola simple (`ingestionQueue`) para ejecutar en serie.

## Extender
- Nuevos extractores: agregar en `extractors/` y mapear en `processDocumentJob`.
- Nuevos modelos de embeddings: crear otro embedder y cambiar la llamada en el job.
- Nuevos esquemas de chunking: reemplazar `chunkText` por otra implementación.

## Requisitos de entorno
- Variables de entorno con credenciales de Supabase y `OPENAI_API_KEY`.
- ffmpeg disponible en runtime para extraer audio de video.

## Ejecución
- Importar y llamar `ingestDocument` o `processDocumentJob` desde tu scheduler/tarea batch en servidor (Deno/Hono/Node). No se usa en frontend.

