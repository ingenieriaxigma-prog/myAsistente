# Mejoras en Formularios de Diagnóstico - Filtrado por Género

## 📋 Resumen de Cambios

Se ha implementado un sistema inteligente de filtrado de síntomas basado en el género seleccionado por el usuario en el paso 1 del diagnóstico. Esto asegura que solo se muestren síntomas anatómicamente relevantes para cada paciente.

## 🎯 Problema Solucionado

**Antes**: Un usuario masculino podía seleccionar síntomas como "sequedad vaginal" o "sangrado post-coital", que son anatómicamente imposibles para su género.

**Ahora**: Los formularios filtran inteligentemente los síntomas según el género seleccionado, mostrando solo opciones relevantes.

## 🔧 Cambios Implementados

### 1. **Síntomas Sexuales Filtrados** (`/config/symptoms.ts`)

Se separaron los síntomas de disfunción sexual en tres categorías:

- **Síntomas Comunes** (todos los géneros):
  - Disminución del deseo sexual
  - Evitación de actividad sexual

- **Síntomas Femeninos** (mujeres y algunas personas trans):
  - Dolor durante la penetración
  - Dolor pélvico profundo
  - Espasmo muscular
  - Sequedad vaginal ✅ (ahora filtrado)
  - Dificultad para alcanzar el orgasmo
  - Sangrado post-coital ✅ (ahora filtrado)

- **Síntomas Masculinos** (hombres):
  - Disfunción eréctil
  - Eyaculación precoz/retardada
  - Dolor durante penetración anal
  - Orgasmo doloroso
  - Dificultad para alcanzar el orgasmo

**Función creada**: `getSexualSymptomsByGender(gender: Gender)`

### 2. **Síntomas Urinarios Filtrados** (`/config/symptoms.ts`)

Se separaron los síntomas urinarios en:

- **Síntomas Comunes** (todos los géneros):
  - Incontinencia de urgencia/esfuerzo
  - Frecuencia aumentada, nocturia, urgencia
  - Dolor al orinar
  - Sensación de vaciado incompleto
  - Sangre en orina

- **Síntomas Prostáticos** (hombres específicamente):
  - Chorro débil o interrumpido ✅ (ahora filtrado)
  - Goteo post-miccional prolongado ✅ (ahora filtrado)
  - Dificultad para iniciar micción ✅ (ahora filtrado)

**Función creada**: `getUrinarySymptomsByGender(gender: Gender)`

### 3. **Síntomas de Prolapso Mejorados** (`/config/symptoms.ts`)

Se generalizaron algunas descripciones para ser más inclusivas:

- "Bulto vaginal" → "Bulto o protrusión" (descripción más general)
- "Manchado vaginal" → "Manchado o sangrado en zona genital" (más inclusivo)

### 4. **Componentes Actualizados**

#### `DiagnosisStep2Sexual.tsx`
- Ahora recibe `gender` como prop
- Usa `getSexualSymptomsByGender()` para filtrar síntomas
- Los hombres ya NO ven opciones de sequedad vaginal

#### `DiagnosisStep2Urinary.tsx`
- Ahora recibe `gender` como prop
- Usa `getUrinarySymptomsByGender()` para filtrar síntomas
- Las mujeres ya NO ven síntomas prostáticos específicos

#### `App.tsx`
- Pasa `patientData.gender` a componentes de síntomas sexuales y urinarios
- Mantiene consistencia en el flujo de datos

## 📊 Lógica de Filtrado

### Para Género Masculino:
```typescript
- Síntomas Sexuales: Comunes + Masculinos
- Síntomas Urinarios: Comunes + Prostáticos
- NO ve: Sequedad vaginal, sangrado post-coital, síntomas de prolapso
```

### Para Género Femenino:
```typescript
- Síntomas Sexuales: Comunes + Femeninos
- Síntomas Urinarios: Comunes (sin prostáticos)
- SÍ ve: Síntomas de prolapso
```

### Para Género Transgénero:
```typescript
- Síntomas Sexuales: TODOS (respeta diversidad anatómica)
- Síntomas Urinarios: Comunes (sin prostáticos específicos)
- SÍ ve: Síntomas de prolapso y trans específicos
```

## ✅ Validación

### Casos de Prueba:
1. ✅ Usuario masculino → NO ve "sequedad vaginal"
2. ✅ Usuario masculino → SÍ ve síntomas prostáticos
3. ✅ Usuario femenino → NO ve síntomas prostáticos
4. ✅ Usuario femenino → SÍ ve síntomas de prolapso
5. ✅ Usuario trans → Ve espectro completo de síntomas

## 🎨 Beneficios

1. **Experiencia de Usuario Mejorada**: Formularios más limpios y relevantes
2. **Precisión Diagnóstica**: Datos más confiables al eliminar opciones imposibles
3. **Profesionalismo**: Demuestra comprensión médica adecuada
4. **Inclusividad**: Mantiene opciones amplias para personas trans

## 🔮 Mejoras Futuras Sugeridas

1. Considerar filtrado adicional por edad (ej: síntomas menopáusicos para +45 años)
2. Filtrado por problemAreas seleccionadas (ya se hace a nivel de navegación)
3. Agregar tooltips explicativos para términos médicos
4. Considerar progresión de síntomas (sintomás primarios → secundarios)

## 📝 Notas Técnicas

- Los cambios son **retrocompatibles**: las funciones antiguas siguen existiendo
- El filtrado se hace en **tiempo real** según la selección en Step 1
- Las personas trans tienen acceso a **todos los síntomas** por defecto para respetar diversidad anatómica
- Los síntomas colorectales permanecen **sin filtrar** ya que aplican a todos

---

**Fecha**: 14 de diciembre de 2025
**Estado**: ✅ Completado e Implementado
