import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  type: 'session' | 'journal' | 'full';
  data: {
    sessions?: unknown[];
    journalEntries?: unknown[];
    goals?: unknown[];
    streaks?: unknown[];
    profile?: unknown;
    actProfile?: unknown;
    diagnosis?: unknown;
    dialogue?: unknown[];
    finalIntensity?: number;
  };
  format: 'pdf' | 'json';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ═══ JWT AUTHENTICATION ═══
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Invalid JWT token:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log('Authenticated user for export:', userId);
    // ═══ END AUTHENTICATION ═══

    const { type, data, format } = await req.json() as ExportRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (format === 'json') {
      // Return raw JSON backup
      return new Response(JSON.stringify({
        exportDate: new Date().toISOString(),
        type,
        data
      }, null, 2), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="via-serenis-backup-${new Date().toISOString().split('T')[0]}.json"`
        },
      });
    }

    // Generate professional report using AI
    let prompt = '';

    if (type === 'session' && data.actProfile && data.diagnosis && data.dialogue) {
      prompt = `Genera un informe terapéutico profesional en formato Markdown para un profesional de salud mental.

## Datos de la Sesión:

### Perfil ACT del Paciente:
${JSON.stringify(data.actProfile, null, 2)}

### Diagnóstico/Creencia Central:
${JSON.stringify(data.diagnosis, null, 2)}

### Diálogo Socrático Realizado:
${JSON.stringify(data.dialogue, null, 2)}

### Intensidad Emocional Final: ${data.finalIntensity}/10

## Instrucciones:
1. Resumen ejecutivo del caso (2-3 párrafos)
2. Análisis del perfil ACT con recomendaciones específicas
3. Patrones identificados en las respuestas del paciente
4. Evolución durante la sesión (narrativa terapéutica)
5. Insights clave y áreas de trabajo sugeridas
6. Recomendaciones para seguimiento
7. Ejercicios ACT recomendados basados en el perfil

Usa un tono profesional y clínico, pero accesible. Incluye secciones con headers claros.`;
    } else if (type === 'journal' && data.journalEntries) {
      prompt = `Genera un análisis profesional del diario emocional en formato Markdown.

## Entradas del Diario:
${JSON.stringify(data.journalEntries, null, 2)}

## Instrucciones:
1. Resumen general del estado emocional
2. Patrones identificados (emociones recurrentes, triggers, tendencias)
3. Análisis de correlaciones (energía, sueño, estado de ánimo)
4. Momentos de mayor y menor bienestar
5. Recomendaciones basadas en los patrones observados
6. Gráfico conceptual de evolución (describir la tendencia)

Usa un tono profesional pero accesible.`;
    } else if (type === 'full') {
      prompt = `Genera un informe completo de progreso terapéutico en formato Markdown.

## Datos Completos:

### Perfil del Usuario:
${JSON.stringify(data.profile, null, 2)}

### Sesiones Completadas:
${JSON.stringify(data.sessions, null, 2)}

### Diario Emocional:
${JSON.stringify(data.journalEntries, null, 2)}

### Metas y Objetivos:
${JSON.stringify(data.goals, null, 2)}

### Rachas/Constancia:
${JSON.stringify(data.streaks, null, 2)}

## Instrucciones:
1. Resumen ejecutivo del progreso general
2. Análisis de patrones en sesiones
3. Evolución emocional según el diario
4. Logro de metas y constancia
5. Fortalezas identificadas
6. Áreas de oportunidad
7. Recomendaciones de seguimiento
8. Plan sugerido para las próximas semanas

Este informe es para compartir con un profesional de salud mental.`;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid export type or missing data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: "Eres un psicólogo clínico especializado en ACT (Terapia de Aceptación y Compromiso). Generas informes profesionales, claros y útiles para profesionales de salud mental. Escribe en español." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de uso excedido. Intenta más tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Se requiere agregar créditos." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Error generando el informe" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const report = aiData.choices?.[0]?.message?.content || 'No se pudo generar el informe';

    return new Response(JSON.stringify({ 
      report,
      generatedAt: new Date().toISOString(),
      type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
