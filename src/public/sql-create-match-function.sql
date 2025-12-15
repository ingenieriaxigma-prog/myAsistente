-- ============================================================================
-- FUNCIÓN RPC PARA BÚSQUEDA SEMÁNTICA CON PGVECTOR
-- ============================================================================
-- Esta función realiza búsqueda de similitud vectorial en los chunks
-- filtrando por specialty directamente
-- ============================================================================

-- Drop function if exists (to recreate)
DROP FUNCTION IF EXISTS match_document_chunks(vector, float, int, text);

-- Create the match function
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5,
  filter_specialty text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  chunk_index int,
  distance float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as distance
  FROM document_chunks dc
  INNER JOIN documents d ON dc.document_id = d.id
  WHERE 
    -- Filter by specialty if provided
    (filter_specialty IS NULL OR d.specialty = filter_specialty)
    -- Only search in completed knowledge bases
    AND d.status = 'completed'
    AND d.title LIKE 'Knowledge Base -%'
    -- Apply similarity threshold
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_document_chunks(vector, float, int, text) TO authenticated;

-- Test the function (optional - comment out if you don't have data yet)
-- SELECT * FROM match_document_chunks(
--   (SELECT embedding FROM document_chunks LIMIT 1),
--   0.3,
--   5,
--   'MyColop'
-- );

-- ============================================================================
-- VERIFICACIÓN: Asegurarse de que las extensiones están instaladas
-- ============================================================================

-- Instalar pgvector si no existe
CREATE EXTENSION IF NOT EXISTS vector;

-- Verificar que la columna embedding existe y tiene el tipo correcto
-- Si no existe, crearla:
-- ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Crear índice HNSW para búsquedas rápidas (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- INFORMACIÓN ÚTIL
-- ============================================================================

-- Ver todas las funciones RPC disponibles:
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name LIKE '%match%';

-- Ver estructura de document_chunks:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'document_chunks';

-- Contar chunks por specialty:
-- SELECT d.specialty, COUNT(*) as chunks
-- FROM document_chunks dc
-- INNER JOIN documents d ON dc.document_id = d.id
-- GROUP BY d.specialty;
