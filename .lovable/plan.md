
# Plan de Corrección: Autenticación en Edge Functions

## Resumen

Las 4 Edge Functions usan `supabaseClient.auth.getClaims(token)` que es un método inestable. Cambiaremos a `supabase.auth.getUser(token)` que es el método estándar y documentado.

## Cambios a Realizar

### 1. socratic-question/index.ts (líneas 46-58)

**Antes:**
```typescript
const token = authHeader.replace('Bearer ', '');
const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

if (claimsError || !claimsData?.claims) {
  console.error('Invalid JWT token:', claimsError);
  return new Response(...);
}

const userId = claimsData.claims.sub;
```

**Después:**
```typescript
const token = authHeader.replace('Bearer ', '');
const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

if (authError || !user) {
  console.error('Invalid JWT token:', authError);
  return new Response(...);
}

const userId = user.id;
```

### 2. generate-summary/index.ts (líneas 53-65)

Mismo patrón de cambio.

### 3. export-data/index.ts (líneas 46-58)

Mismo patrón de cambio.

### 4. analyze-patterns/index.ts (líneas 48-60)

Mismo patrón de cambio.

## Archivos Afectados

| Archivo | Líneas | Cambio |
|---------|--------|--------|
| supabase/functions/socratic-question/index.ts | 46-58 | getClaims → getUser |
| supabase/functions/generate-summary/index.ts | 53-65 | getClaims → getUser |
| supabase/functions/export-data/index.ts | 46-58 | getClaims → getUser |
| supabase/functions/analyze-patterns/index.ts | 48-60 | getClaims → getUser |

## Post-Implementación

1. Desplegar las 4 Edge Functions automáticamente
2. Las funciones de IA (preguntas socráticas, resúmenes, exportación, análisis) funcionarán correctamente para usuarios autenticados
