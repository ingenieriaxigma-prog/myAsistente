# 🏗️ MY HEALTH APP - ARQUITECTURA DEL SERVIDOR

## 📋 Tabla de Contenidos
- [Visión General](#visión-general)
- [Módulos y Responsabilidades](#módulos-y-responsabilidades)
- [Flujo de Procesamiento de Mensajes](#flujo-de-procesamiento-de-mensajes)
- [Guía de Modificación](#guía-de-modificación)

---

## 🎯 Visión General

La arquitectura está diseñada con **separación de responsabilidades** para evitar que cambios en una funcionalidad rompan otras.

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                    (ClinicalChat.tsx)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP Request
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVER (index.tsx)                      │
│                    Routes & Controllers                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              CHAT ORCHESTRATOR SERVICE                      │
│           (chat_orchestrator.ts) ← COORDINADOR              │
│                                                              │
│  Coordina todos los servicios en orden:                     │
│  1. attachment_processor.ts                                 │
│  2. rag_service.ts                                          │
│  3. openai.ts                                               │
│  4. messages.ts                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Módulos y Responsabilidades

### 🎼 **chat_orchestrator.ts** (COORDINADOR PRINCIPAL)
**QUÉ HACE:**
- Coordina el flujo completo de procesamiento de un mensaje
- Llama a cada servicio en el orden correcto
- Logging detallado de cada paso

**CUÁNDO MODIFICAR:**
- Cuando necesites cambiar el ORDEN del procesamiento
- Cuando necesites agregar un NUEVO paso al flujo
- Para debugging del flujo completo

**⚠️ PRECAUCIÓN:** Este es el núcleo. Cambios aquí afectan TODO.

---

### 📎 **attachment_processor.ts** (PROCESADOR DE ARCHIVOS)
**QUÉ HACE:**
- Procesa imágenes para Vision API
- Extrae texto de documentos (PDFs, etc)
- Formatea attachments para OpenAI

**CUÁNDO MODIFICAR:**
- Agregar soporte para nuevo tipo de archivo
- Cambiar formato de imágenes
- Modificar extracción de texto

**✅ INDEPENDIENTE DE:**
- RAG (base de conocimiento)
- OpenAI (solo formatea, no llama API)

---

### 🔍 **rag_service.ts** (BÚSQUEDA EN BASE DE CONOCIMIENTO)
**QUÉ HACE:**
- Busca documentos relevantes usando embeddings
- Construye prompt con contexto de documentos
- Detecta si AI usó base de datos o conocimiento general

**CUÁNDO MODIFICAR:**
- Cambiar algoritmo de búsqueda
- Modificar threshold de similitud
- Ajustar formato del prompt RAG

**✅ INDEPENDIENTE DE:**
- Attachments (imágenes/PDFs del usuario)
- OpenAI (solo prepara contexto)

---

### 🤖 **openai.ts** (INTEGRACIÓN CON OPENAI)
**QUÉ HACE:**
- Llama a OpenAI API
- Selecciona modelo correcto (GPT-4o vs GPT-4o-mini)
- Genera prompts del sistema

**CUÁNDO MODIFICAR:**
- Cambiar modelo de AI
- Ajustar parámetros (temperature, tokens)
- Modificar prompts base

**✅ INDEPENDIENTE DE:**
- RAG (recibe prompt ya construido)
- Attachments (recibe mensajes ya procesados)

---

### 💾 **messages.ts, chats.ts, documents.ts**
**QUÉ HACE:**
- CRUD operations en base de datos
- Gestión de persistencia

**CUÁNDO MODIFICAR:**
- Cambiar esquema de base de datos
- Agregar nuevos campos
- Optimizar queries

---

### 🔢 **embeddings.ts**
**QUÉ HACE:**
- Crea embeddings usando OpenAI
- Usado por RAG para búsqueda vectorial

**CUÁNDO MODIFICAR:**
- Cambiar modelo de embeddings
- Optimizar performance

---

## 🔄 Flujo de Procesamiento de Mensajes

```
USUARIO ENVÍA MENSAJE
        │
        ▼
┌─────────────────────────────────────────┐
│ 1. ATTACHMENT PROCESSOR                 │
│    - Detecta imágenes                   │
│    - Detecta documentos                 │
│    - Formatea para OpenAI               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. RAG SERVICE (si useRAG = true)       │
│    - Crea embedding de pregunta         │
│    - Busca en base de conocimiento      │
│    - Construye prompt con contexto      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. OPENAI SERVICE                       │
│    - Selecciona modelo correcto         │
│    - Llama a OpenAI API                 │
│    - Retorna respuesta                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. RAG SERVICE (post-procesamiento)     │
│    - Detecta si usó base de datos       │
│    - Limpia marcadores de fuentes       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. MESSAGES SERVICE                     │
│    - Guarda en base de datos            │
└─────────────────────────────────────────┘
```

---

## 🛠️ Guía de Modificación

### ✅ MODIFICACIÓN SEGURA: Cambiar prompts de RAG

**ARCHIVO:** `rag_service.ts`
**FUNCIÓN:** `buildRAGSystemPrompt()`
**IMPACTO:** Solo afecta cómo se usa la base de conocimiento
**PRUEBA:** 
1. Subir un PDF como super admin
2. Preguntar algo relacionado
3. Verificar que responda con `[FUENTES_USADAS: BASE_DE_DATOS]`

---

### ✅ MODIFICACIÓN SEGURA: Agregar soporte para nuevo tipo de archivo

**ARCHIVO:** `attachment_processor.ts`
**FUNCIÓN:** `processAttachmentsForOpenAI()`
**IMPACTO:** Solo afecta procesamiento de archivos
**PRUEBA:**
1. Subir el nuevo tipo de archivo
2. Verificar que se procese correctamente
3. NO debería afectar RAG ni respuestas de texto

---

### ⚠️ MODIFICACIÓN MEDIA: Cambiar modelo de OpenAI

**ARCHIVO:** `openai.ts`
**FUNCIÓN:** `selectModel()` y `getChatCompletion()`
**IMPACTO:** Afecta TODAS las respuestas
**PRUEBA:**
1. Mensaje de solo texto
2. Mensaje con imagen
3. Mensaje con documento
4. Mensaje con RAG
5. Verificar que TODOS funcionen

---

### 🚨 MODIFICACIÓN CRÍTICA: Cambiar flujo del orchestrator

**ARCHIVO:** `chat_orchestrator.ts`
**FUNCIÓN:** `orchestrateChatMessage()`
**IMPACTO:** Afecta TODO el sistema
**PRUEBA COMPLETA:**
1. ✅ Texto simple
2. ✅ Texto con RAG
3. ✅ Imagen sola
4. ✅ Imagen + texto
5. ✅ PDF solo
6. ✅ PDF + texto
7. ✅ PDF + RAG
8. ✅ Todo junto

---

## 🐛 Debugging

### Ver logs paso a paso:
El orchestrator imprime logs detallados:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CHAT ORCHESTRATOR: Starting message processing
   Chat ID: xxx
   Specialty: MyColop
   Use RAG: true
   Message: "¿Qué son las hemorroides?..."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📎 STEP 1: Processing attachments...
   ✅ Attachments processed (images: false, docs: false)

📝 STEP 2: Building system prompt...
   ✅ Base system prompt ready

🔍 STEP 3: RAG - Searching knowledge base...
   ✅ Found 3 relevant chunks
   ✅ Enhanced system prompt with RAG context
   
... etc
```

### Si algo falla:
1. Busca el STEP donde falló
2. Ve al archivo correspondiente
3. Modifica SOLO ese archivo
4. NO toques otros módulos

---

## 📞 Contacto

Si necesitas hacer cambios y no estás seguro:
1. Lee ARCHITECTURE.md (este archivo)
2. Verifica qué módulo debes modificar
3. Lee los comentarios en ese archivo específico
4. Haz cambios SOLO en ese módulo
5. Prueba SOLO esa funcionalidad primero

**REGLA DE ORO:** 
> Un cambio en un módulo NO debería requerir cambios en otros módulos.
> Si es así, la arquitectura está mal diseñada y hay que refactorizar.
