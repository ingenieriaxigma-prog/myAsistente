#!/bin/bash

# 🚀 DEPLOYMENT SCRIPT FOR EDGE FUNCTION
# Este script despliega la Edge Function a Supabase

echo "================================================"
echo "🚀 MY HEALTH APP - EDGE FUNCTION DEPLOYMENT"
echo "================================================"
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -d "supabase/functions/server" ]; then
  echo "❌ Error: No se encontró la carpeta supabase/functions/server"
  echo "   Por favor ejecuta este script desde la raíz del proyecto"
  exit 1
fi

echo "✅ Carpeta supabase/functions/server encontrada"
echo ""

# Verificar que Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI no está instalado"
  echo ""
  echo "Para instalarlo:"
  echo ""
  echo "  macOS:"
  echo "  brew install supabase/tap/supabase"
  echo ""
  echo "  Windows (PowerShell como admin):"
  echo "  scoop install supabase"
  echo ""
  echo "  npm (cualquier OS):"
  echo "  npm install -g supabase"
  echo ""
  exit 1
fi

echo "✅ Supabase CLI instalado"
echo ""

# Login a Supabase (si no está autenticado)
echo "🔐 Verificando autenticación..."
if ! supabase projects list &> /dev/null; then
  echo "⚠️  No estás autenticado. Iniciando login..."
  supabase login
else
  echo "✅ Ya estás autenticado"
fi
echo ""

# Link al proyecto (si no está linkeado)
echo "🔗 Verificando link al proyecto..."
if [ ! -f ".git/config" ] || ! grep -q "myasistente" supabase/.temp/project-ref 2>/dev/null; then
  echo "⚠️  Proyecto no linkeado. Linkeando a myasistente..."
  supabase link --project-ref myasistente
else
  echo "✅ Proyecto ya linkeado"
fi
echo ""

# Deploy la Edge Function
echo "🚀 Desplegando Edge Function..."
echo ""
supabase functions deploy make-server-baa51d6b

if [ $? -eq 0 ]; then
  echo ""
  echo "================================================"
  echo "✅ DEPLOYMENT EXITOSO"
  echo "================================================"
  echo ""
  echo "📊 Verifica los logs en:"
  echo "   https://supabase.com/dashboard/project/myasistente/functions/make-server-baa51d6b/logs"
  echo ""
  echo "Deberías ver:"
  echo "  🚀 Server starting..."
  echo "  💾 KV Store: DISABLED (using SQL only)"
  echo "  ✅ Server ready! Version: 2.0.0"
  echo ""
  echo "🧪 Prueba en la app:"
  echo "  1. Crea un nuevo chat"
  echo "  2. Envía un mensaje"
  echo "  3. Verifica en Supabase → Table Editor → chats"
  echo "  4. Verifica en Supabase → Table Editor → messages"
  echo "  5. Confirma que kv_store_baa51d6b NO tiene nuevos registros"
  echo ""
else
  echo ""
  echo "================================================"
  echo "❌ DEPLOYMENT FALLÓ"
  echo "================================================"
  echo ""
  echo "Por favor revisa el error arriba y contacta para ayuda."
  echo ""
fi
