# 🔍 Configuración de pgvector para búsqueda semántica

## ✅ Ya tienes configurado:
- ✅ Extensión `pgvector` habilitada
- ✅ Tabla `documents` con metadata
- ✅ Tabla `document_chunks` con columna `embedding vector(1536)`
- ✅ Índices vectoriales creados

---

## 📝 Función RPC necesaria para búsqueda optimizada

Ejecuta este SQL en el **SQL Editor** de Supabase para crear la función de búsqueda vectorial:

```sql
-- Función para búsqueda semántica con pgvector
-- Usa cosine distance para encontrar los chunks más similares
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5,
  filter_document_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float,
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
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.embedding <=> query_embedding AS distance
  FROM document_chunks dc
  WHERE 
    (filter_document_id IS NULL OR dc.document_id = filter_document_id)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 🚀 Cómo funciona:

### **Operador `<=>`**
Este es el operador de **cosine distance** de pgvector:
- `0` = vectores idénticos (100% similitud)
- `2` = vectores completamente opuestos (0% similitud)

### **Conversión a similitud**
- `similarity = 1 - distance`
- `similarity > 0.7` = Muy relevante
- `similarity > 0.5` = Moderadamente relevante
- `similarity > 0.3` = Posiblemente relevante

### **Parámetros**
- `query_embedding`: Vector de 1536 dimensiones de OpenAI
- `match_threshold`: Umbral mínimo de similitud (default: 0.3)
- `match_count`: Número máximo de resultados (default: 5)
- `filter_document_id`: Filtrar por documento específico

---

## 🧪 Prueba la función

Después de crear la función, pruébala con este SQL:

```sql
-- Obtener un embedding de ejemplo de la base de datos
WITH sample_embedding AS (
  SELECT embedding 
  FROM document_chunks 
  LIMIT 1
)
SELECT 
  content,
  metadata->>'specialty' as specialty,
  similarity,
  distance
FROM match_document_chunks(
  (SELECT embedding FROM sample_embedding),
  0.3,  -- threshold
  5     -- limit
)
ORDER BY similarity DESC;
```

---

## 📊 Verificar índices

Verifica que los índices vectoriales existan:

```sql
-- Ver todos los índices en document_chunks
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'document_chunks';
```

Si **NO** existe un índice HNSW o IVFFlat, créalo para mejorar el rendimiento:

```sql
-- Crear índice HNSW (recomendado para mejor precisión)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- O crear índice IVFFlat (más rápido pero menos preciso)
-- CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
-- ON document_chunks 
-- USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);
```

---

## ✨ Beneficios de la función RPC

1. **🚀 Más rápida** - Usa índices nativos de Postgres
2. **🎯 Más precisa** - Operadores optimizados de pgvector
3. **💾 Menos datos transferidos** - Filtra en la base de datos
4. **⚡ Escalable** - Maneja millones de vectores eficientemente

---

## 🔄 Fallback automático

El sistema tiene un **fallback JavaScript** que calcula la similitud coseno manualmente si la función RPC no existe. Esto funciona, pero es más lento porque:
- Descarga todos los chunks del documento
- Calcula la similitud en JavaScript
- Usa más memoria y ancho de banda

Una vez crees la función RPC, el sistema automáticamente usará la versión optimizada. ✅

---

## 📈 Próximos pasos

1. ✅ **Ejecuta el SQL** de la función RPC arriba
2. ✅ **Verifica los índices** están creados
3. ✅ **Prueba el chat** con preguntas sobre la base de conocimiento
4. ✅ **Revisa los logs** de la consola para ver los chunks encontrados

¡Listo! 🎉
