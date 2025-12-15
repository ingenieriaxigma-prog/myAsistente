# 🚀 DEPLOYMENT SCRIPT FOR EDGE FUNCTION (PowerShell)
# Este script despliega la Edge Function a Supabase

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 MY HEALTH APP - EDGE FUNCTION DEPLOYMENT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "supabase/functions/server")) {
  Write-Host "❌ Error: No se encontró la carpeta supabase/functions/server" -ForegroundColor Red
  Write-Host "   Por favor ejecuta este script desde la raíz del proyecto" -ForegroundColor Yellow
  exit 1
}

Write-Host "✅ Carpeta supabase/functions/server encontrada" -ForegroundColor Green
Write-Host ""

# Verificar que Supabase CLI está instalado
try {
  $null = Get-Command supabase -ErrorAction Stop
  Write-Host "✅ Supabase CLI instalado" -ForegroundColor Green
} catch {
  Write-Host "❌ Supabase CLI no está instalado" -ForegroundColor Red
  Write-Host ""
  Write-Host "Para instalarlo:" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "  Windows (PowerShell como admin):" -ForegroundColor Cyan
  Write-Host "  scoop install supabase" -ForegroundColor White
  Write-Host ""
  Write-Host "  O con npm (cualquier OS):" -ForegroundColor Cyan
  Write-Host "  npm install -g supabase" -ForegroundColor White
  Write-Host ""
  exit 1
}
Write-Host ""

# Login a Supabase (si no está autenticado)
Write-Host "🔐 Verificando autenticación..." -ForegroundColor Cyan
try {
  supabase projects list 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No estás autenticado. Iniciando login..." -ForegroundColor Yellow
    supabase login
  } else {
    Write-Host "✅ Ya estás autenticado" -ForegroundColor Green
  }
} catch {
  Write-Host "⚠️  Error verificando autenticación. Iniciando login..." -ForegroundColor Yellow
  supabase login
}
Write-Host ""

# Link al proyecto
Write-Host "🔗 Linkeando al proyecto myasistente..." -ForegroundColor Cyan
supabase link --project-ref myasistente
Write-Host ""

# Deploy la Edge Function
Write-Host "🚀 Desplegando Edge Function..." -ForegroundColor Cyan
Write-Host ""
supabase functions deploy make-server-baa51d6b

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "================================================" -ForegroundColor Green
  Write-Host "✅ DEPLOYMENT EXITOSO" -ForegroundColor Green
  Write-Host "================================================" -ForegroundColor Green
  Write-Host ""
  Write-Host "📊 Verifica los logs en:" -ForegroundColor Cyan
  Write-Host "   https://supabase.com/dashboard/project/myasistente/functions/make-server-baa51d6b/logs" -ForegroundColor White
  Write-Host ""
  Write-Host "Deberías ver:" -ForegroundColor Yellow
  Write-Host "  🚀 Server starting..." -ForegroundColor White
  Write-Host "  💾 KV Store: DISABLED (using SQL only)" -ForegroundColor White
  Write-Host "  ✅ Server ready! Version: 2.0.0" -ForegroundColor White
  Write-Host ""
  Write-Host "🧪 Prueba en la app:" -ForegroundColor Cyan
  Write-Host "  1. Crea un nuevo chat" -ForegroundColor White
  Write-Host "  2. Envía un mensaje" -ForegroundColor White
  Write-Host "  3. Verifica en Supabase → Table Editor → chats" -ForegroundColor White
  Write-Host "  4. Verifica en Supabase → Table Editor → messages" -ForegroundColor White
  Write-Host "  5. Confirma que kv_store_baa51d6b NO tiene nuevos registros" -ForegroundColor White
  Write-Host ""
} else {
  Write-Host ""
  Write-Host "================================================" -ForegroundColor Red
  Write-Host "❌ DEPLOYMENT FALLÓ" -ForegroundColor Red
  Write-Host "================================================" -ForegroundColor Red
  Write-Host ""
  Write-Host "Por favor revisa el error arriba y contacta para ayuda." -ForegroundColor Yellow
  Write-Host ""
}
