# 🏥 My - Plataforma de Salud Digital con IA

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E.svg)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991.svg)](https://openai.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

Plataforma móvil de salud digital que combina **modelos de OpenAI (GPT-4o-mini)** con **base de conocimiento médico propia** mediante RAG (Retrieval-Augmented Generation) para ofrecer **chat clínico experto** y **diagnóstico inteligente**.

---

## 🌟 Características Principales

### 💬 Chat Clínico Experto
- **Chat inteligente** tipo ChatGPT con GPT-4o-mini de OpenAI
- **RAG (Retrieval-Augmented Generation)** con búsqueda semántica usando pgvector
- **Fuentes bibliográficas** citadas en cada respuesta del chat
- **Sugerencias contextuales** de preguntas médicas
- **Grabación de audio** para consultas por voz
- **Adjuntar imágenes y documentos** con análisis automático
- **Historial completo** de conversaciones

### 🔍 Diagnóstico Inteligente
- Evaluación **por pasos adaptativa** según género y síntomas
- Filtrado inteligente por **género y áreas problemáticas**
- **54+ síntomas médicos** catalogados y organizados
- **Análisis de urgencia** automático (leve/moderado/severo)
- **Recomendaciones personalizadas** basadas en diagnóstico
- Plan de tratamiento con ejercicios terapéuticos

### 🎨 Especialidades Médicas
- **MyPelvic**: Salud del suelo pélvico (colores turquesa/cyan)
- **MyColop**: Salud colorectal (colores azul)
- Sistema de temas **fácilmente extensible** para nuevas especialidades

### 🔒 Panel de Administración
- Acceso exclusivo para **super admin** (ingenieriaxigma@gmail.com)
- Gestión de **bases de conocimiento** por especialidad
- Subida de documentos en formato JSON con chunks y embeddings
- Base de conocimiento **compartida** para todos los usuarios
- **Aislamiento por especialidad**: MyPelvic y MyColop tienen bases separadas

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Frontend:**
- React 18.3 + TypeScript 5.6
- Tailwind CSS 4.0
- Vite (build tool)
- PWA (Progressive Web App)

**Backend:**
- Supabase Edge Functions (Deno + Hono)
- PostgreSQL con pgvector
- OpenAI API (GPT-4o-mini + text-embedding-3-small)
- Supabase Auth + Storage

**Infraestructura:**
- Arquitectura de 3 capas: Frontend → Server → Database
- RAG con búsqueda semántica (cosine similarity)
- Embeddings de 1536 dimensiones
- HNSW index para búsquedas rápidas

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ ClinicalChat │  │  Diagnosis   │  │ AdminPanel   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│              EDGE FUNCTIONS (Deno + Hono)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Chat API   │  │  RAG Service │  │ Admin API    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ OpenAI API   │  │ Embeddings   │  │ Auth/Storage │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│            SUPABASE (PostgreSQL + pgvector)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    chats     │  │   messages   │  │   profiles   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  documents   │  │document_chunks│ ← pgvector(1536)  │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
/
├── components/
│   ├── ClinicalChat.tsx          # 💬 Chat principal con RAG
│   ├── AdminPanel.tsx            # 🔒 Panel de administración
│   ├── LoginScreen.tsx           # 🔐 Autenticación
│   ├── SpecialtyHome.tsx         # 🏠 Pantalla principal
│   ├── DiagnosisStep*.tsx        # 🔍 Flujo de diagnóstico
│   ├── common/                   # 🧩 Componentes reutilizables
│   │   ├── GradientHeader.tsx
│   │   ├── GradientButton.tsx
│   │   ├── AudioRecorder.tsx
│   │   ├── LoadingFallback.tsx
│   │   └── ...
│   └── icons/                    # 🎨 Iconos personalizados
│
├── services/
│   └── api.ts                    # 🌐 API client (auth, chat, admin)
│
├── supabase/functions/server/
│   ├── index.tsx                 # 🚀 Servidor Hono principal
│   └── services/
│       ├── rag_service.ts        # 🔍 RAG y búsqueda semántica
│       ├── embeddings.ts         # 🧮 Generación de embeddings
│       ├── openai.ts             # 🤖 Integración OpenAI
│       ├── chats.ts              # 💬 Gestión de chats
│       ├── messages.ts           # 📝 Gestión de mensajes
│       ├── documents.ts          # 📚 Gestión de documentos
│       └── document_processor.ts # ⚙️ Procesamiento de bases de conocimiento
│
├── config/
│   ├── specialties.ts            # 🏥 Definición de especialidades
│   ├── theme.ts                  # 🎨 Temas por especialidad
│   ├── symptoms.ts               # 📋 54+ síntomas catalogados
│   ├── exercises.ts              # 💪 Ejercicios terapéuticos
│   └── diagnosisResults.ts       # 📊 Resultados de diagnóstico
│
├── hooks/
│   ├── useAuth.ts                # 🔐 Hook de autenticación
│   ├── useSpecialtyTheme.ts      # 🎨 Hook de temas
│   └── usePWA.ts                 # 📱 Hooks PWA
│
├── utils/
│   ├── navigation.ts             # 🧭 Lógica de navegación
│   ├── symptoms.ts               # 🩺 Análisis de síntomas
│   └── supabase/
│       ├── client.ts             # Cliente Supabase
│       └── info.tsx              # Configuración del proyecto
│
├── types/
│   └── index.ts                  # 📝 Tipos TypeScript centralizados
│
├── public/
│   ├── manifest.json             # 📱 Configuración PWA
│   ├── sw.js                     # 🔄 Service Worker
│   └── sql-create-match-function.sql  # 🗄️ Función SQL para RAG
│
├── docs/
│   ├── PGVECTOR_SETUP.md         # 📖 Setup de pgvector
│   └── RAG_MIGRATION_COMPLETE.md # 📖 Migración RAG
│
├── knowledge_base_pelvic.json    # 📚 Ejemplo base MyPelvic
├── knowledge_base_colop.json     # 📚 Ejemplo base MyColop
│
├── App.tsx                       # 🎯 App principal
├── AppWrapper.tsx                # 🎁 Wrapper con providers
└── README.md                     # 📘 Este archivo
```

---

## 🔑 Estándar de Nomenclatura

### Frontend (TypeScript/React)
- **Variables y funciones**: `camelCase`
  - Ejemplo: `selectedSpecialty`, `handleLogin`, `currentChatId`
- **Componentes React**: `PascalCase`
  - Ejemplo: `ClinicalChat`, `SpecialtyHome`, `AdminPanel`
- **Tipos e Interfaces**: `PascalCase`
  - Ejemplo: `Specialty`, `ChatMessage`, `PatientData`
- **Constantes**: `UPPER_SNAKE_CASE`
  - Ejemplo: `API_BASE_URL`, `MAX_RETRIES`
- **Archivos de componentes**: `PascalCase.tsx`
  - Ejemplo: `ClinicalChat.tsx`, `GradientButton.tsx`
- **Archivos de utilidades**: `camelCase.ts`
  - Ejemplo: `api.ts`, `navigation.ts`, `symptoms.ts`

### Backend (Supabase/Database)
- **Tablas**: `snake_case`
  - Ejemplo: `document_chunks`, `chat_messages`, `user_profiles`
- **Columnas**: `snake_case`
  - Ejemplo: `user_id`, `created_at`, `chunk_index`
- **Funciones RPC**: `snake_case`
  - Ejemplo: `match_document_chunks`, `get_user_stats`

---

## 🚀 Sistema RAG (Retrieval-Augmented Generation)

### ¿Cómo Funciona?

1. **Usuario hace una pregunta** en el chat
2. **Generación de embedding** de la pregunta (1536 dim)
3. **Búsqueda semántica** en `document_chunks` usando pgvector
4. **Filtrado por especialidad** (MyPelvic o MyColop)
5. **Top 3 chunks más relevantes** (cosine similarity > 0.3)
6. **Construcción del prompt** con contexto + pregunta
7. **GPT-4o-mini genera respuesta** con fuentes citadas
8. **Respuesta al usuario** con referencias bibliográficas

### Base de Datos

**Función SQL principal:**
```sql
match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5,
  filter_specialty text DEFAULT NULL
)
```

**Índice HNSW** para búsquedas ultra-rápidas:
```sql
CREATE INDEX document_chunks_embedding_idx 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);
```

### Aislamiento por Especialidad

✅ **MyPelvic y MyColop están 100% aislados:**
- Cada especialidad tiene su propia base de conocimiento
- La búsqueda RAG filtra por `specialty`
- Un chat en MyPelvic **SOLO** busca en documentos de MyPelvic
- Un chat en MyColop **SOLO** busca en documentos de MyColop

---

## 🔐 Autenticación y Permisos

### Usuarios Normales
- ✅ Acceso a Chat Experto
- ✅ Acceso a Diagnóstico Inteligente
- ✅ Ver perfil personal
- ❌ NO pueden subir documentos
- ❌ NO tienen acceso al panel admin

### Super Admin (ingenieriaxigma@gmail.com)
- ✅ Todos los permisos de usuario normal
- ✅ Acceso al Panel de Administración
- ✅ Subir bases de conocimiento por especialidad
- ✅ Ver estadísticas del sistema
- ✅ Gestión completa de documentos

### Base de Conocimiento Compartida
- Los documentos subidos por el super admin están **disponibles para TODOS los usuarios**
- Cada especialidad (MyPelvic/MyColop) tiene su base separada
- Los usuarios normales solo **consumen** la información, no la editan

---

## 📱 Progressive Web App (PWA)

✅ **Instalable** en iOS, Android y Desktop  
✅ **Funciona Offline** con Service Workers  
✅ **Rápida** con estrategia de caché optimizada  
✅ **Responsive** para todos los dispositivos  
✅ **Iconos** en todas las resoluciones (72-512px)

### Instalación

**En Móvil:**
1. Abre la app en el navegador
2. Espera el banner de instalación
3. Toca "Instalar"
4. La app aparecerá en tu home screen

**En Desktop:**
1. Abre en Chrome/Edge
2. Click en el ícono de instalación (barra URL)
3. Click "Instalar"
4. La app se abre en ventana propia

---

## 🎨 Sistema de Diseño

### Paleta de Colores

**MyPelvic (Turquesa/Cyan vibrante):**
```css
gradient: bg-gradient-to-br from-teal-500 to-cyan-600
lightBg: bg-teal-50
textPrimary: text-teal-600
textSecondary: text-teal-700
```

**MyColop (Azul profesional):**
```css
gradient: bg-gradient-to-br from-blue-500 to-blue-600
lightBg: bg-blue-50
textPrimary: text-blue-600
textSecondary: text-blue-700
```

### Componentes Reutilizables
- `GradientHeader` - Header con gradiente por especialidad
- `GradientButton` - Botón con gradiente animado
- `BackButton` - Botón de retroceso estilizado
- `AudioRecorder` - Grabador de audio con animación
- `SymptomSelector` - Selector de síntomas multi-selección
- `LoadingFallback` - Pantalla de carga con spinner

---

## 🔧 Instalación y Desarrollo

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- API Key de OpenAI

### Variables de Entorno Requeridas

Las siguientes variables **ya están configuradas** en Supabase:
- `SUPABASE_URL` - URL del proyecto Supabase
- `SUPABASE_ANON_KEY` - Clave pública anónima
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio (admin)
- `SUPABASE_DB_URL` - URL de la base de datos
- `OPENAI_API_KEY` - API key de OpenAI

### Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Tests
npm run test

# Linting
npm run lint
```

### Desplegar Edge Functions

```bash
# Usando el script de despliegue
./deploy-edge-function.sh

# O manualmente con Supabase CLI
supabase functions deploy make-server-baa51d6b
```

---

## 🗄️ Setup de Base de Datos

### 1. Crear Tablas

Las tablas principales ya están creadas:
- `profiles` - Perfiles de usuario
- `chats` - Conversaciones de chat
- `chat_messages` - Mensajes individuales
- `documents` - Metadatos de documentos
- `document_chunks` - Chunks con embeddings (pgvector)

### 2. Instalar pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Crear Función RPC

El archivo `/public/sql-create-match-function.sql` contiene la función `match_document_chunks` necesaria para RAG.

Ejecutar en la consola SQL de Supabase.

---

## 📚 Gestión de Bases de Conocimiento

### Formato del JSON

Las bases de conocimiento deben seguir este formato:

```json
{
  "metadata": {
    "version": "1.0",
    "updated_at": "2024-12-13",
    "description": "Base de conocimiento de piso pélvico",
    "sources": [
      {
        "title": "Nombre del artículo/libro",
        "authors": ["Autor 1", "Autor 2"],
        "year": 2024,
        "journal": "Revista Médica",
        "doi": "10.xxxx/xxxxx",
        "url": "https://..."
      }
    ]
  },
  "chunks": [
    {
      "id": "chunk-001",
      "content": "Texto del contenido médico aquí...",
      "metadata": {
        "source_index": 0,
        "page": 1,
        "section": "Introducción"
      }
    }
  ]
}
```

### Subir Base de Conocimiento

1. Login como super admin (ingenieriaxigma@gmail.com)
2. Click en el ícono de perfil → Panel de Administración
3. Selecciona la especialidad (MyPelvic o MyColop)
4. Sube el archivo JSON
5. El sistema automáticamente:
   - Genera embeddings para cada chunk
   - Guarda en la base de datos con filtro de especialidad
   - Hace disponible para RAG inmediatamente

---

## 🎯 Flujos de Usuario

### 1. Login → Chat Experto

```
LoginScreen 
  → SpecialtySelection 
  → SpecialtyHome 
  → ClinicalChat
    ├── Escribir pregunta
    ├── O grabar audio
    ├── O adjuntar imagen/PDF
    └── Recibir respuesta con fuentes
```

### 2. Login → Diagnóstico

```
LoginScreen 
  → SpecialtySelection 
  → SpecialtyHome 
  → DiagnosisStep1 (Datos básicos)
    ├── Género
    ├── Edad
    └── Áreas problemáticas
  → DiagnosisStep2 (Síntomas generales)
  → DiagnosisStep2-[Área] (Síntomas específicos)
  → DiagnosisAnalysis (Análisis con IA)
  → DiagnosisStep3 (Resultados)
  → TreatmentPlan (Plan personalizado)
  → ExerciseDetail (Ejercicios)
```

### 3. Login → Admin (Solo Super Admin)

```
LoginScreen 
  → SpecialtySelection 
  → SpecialtyHome 
  → ProfileScreen 
  → AdminPanel
    ├── Ver estadísticas
    ├── Seleccionar especialidad
    ├── Subir base de conocimiento
    └── Ver documentos existentes
```

---

## 📊 Métricas y Optimizaciones

### Performance
- ✅ Bundle inicial: ~270 KB (con lazy loading)
- ✅ First Contentful Paint: < 1s
- ✅ Time to Interactive: < 2s
- ✅ Lighthouse Score: 95+

### Optimizaciones Implementadas
1. **Lazy Loading** - Componentes cargados bajo demanda
2. **React.memo** - Evita re-renders innecesarios
3. **Context API** - Estado global sin prop drilling
4. **Service Workers** - Caché inteligente para PWA
5. **Tailwind CSS** - Purge automático de estilos no usados
6. **pgvector + HNSW** - Búsquedas vectoriales ultra-rápidas

### RAG Performance
- **Búsqueda semántica**: < 100ms (con HNSW index)
- **Generación embedding**: ~200ms
- **Respuesta OpenAI**: 2-5s
- **Total time-to-response**: 3-6s

---

## 🧪 Testing

Tests unitarios con Vitest:

```bash
npm run test              # Ejecutar todos
npm run test:watch        # Modo watch
npm run test:coverage     # Reporte de cobertura
```

**Tests implementados:**
- ✅ Utilidades de navegación
- ✅ Cálculo de urgencia de síntomas
- ✅ Sistema de temas
- ✅ Generación de ejercicios

---

## 🗺️ Roadmap

### ✅ Completado
- [x] Login y autenticación con Supabase
- [x] Chat clínico con GPT-4o-mini
- [x] Sistema RAG con pgvector
- [x] Fuentes bibliográficas en respuestas
- [x] Panel de administración
- [x] Diagnóstico inteligente paso a paso
- [x] Plan de tratamiento personalizado
- [x] PWA instalable
- [x] Aislamiento por especialidad
- [x] Adjuntar imágenes y documentos

### 🚧 Próximo (Fase 4)
- [ ] Notificaciones push
- [ ] Recordatorios de ejercicios
- [ ] Exportar PDF de diagnóstico
- [ ] Historial de diagnósticos
- [ ] Dashboard de progreso
- [ ] OAuth (Google, Apple)

### 🔮 Futuro (Fase 5)
- [ ] Más especialidades médicas
- [ ] Telemedicina
- [ ] Integración con wearables
- [ ] Marketplace de especialistas
- [ ] Planes premium
- [ ] Análisis de imágenes médicas con GPT-4 Vision

---

## 📖 Documentación Adicional

- **[/docs/PGVECTOR_SETUP.md](/docs/PGVECTOR_SETUP.md)** - Configuración de pgvector
- **[/docs/RAG_MIGRATION_COMPLETE.md](/docs/RAG_MIGRATION_COMPLETE.md)** - Migración a RAG
- **[/supabase/functions/server/ARCHITECTURE.md](/supabase/functions/server/ARCHITECTURE.md)** - Arquitectura del servidor
- **[/guidelines/Guidelines.md](/guidelines/Guidelines.md)** - Guías de desarrollo
- **[Attributions.md](/Attributions.md)** - Atribuciones y licencias

---

## 🤝 Contribuir

Este es un proyecto privado. Para contribuir:

1. Contacta al equipo de desarrollo
2. Sigue el estándar de nomenclatura (ver arriba)
3. Escribe tests para nuevas funcionalidades
4. Documenta cambios importantes
5. Solicita code review antes de merge

---

## 📝 Licencia

Este proyecto es **privado y confidencial**. Todos los derechos reservados.

---

## 👥 Equipo

Desarrollado con ❤️ por el equipo de **My Health Platform**

---

## 📞 Soporte

Para preguntas o soporte técnico, contacta a: **ingenieriaxigma@gmail.com**

---

## ⚡ Quick Start

```bash
# 1. Clonar repositorio
git clone [repo-url]
cd my-health-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ya están en Supabase)

# 4. Ejecutar en desarrollo
npm run dev

# 5. ¡Listo! 🎉
# Abre http://localhost:5173
```

---

**¡Tu plataforma de salud digital con IA está lista!** 🚀🏥💚

**Última actualización:** 13 de diciembre de 2024
