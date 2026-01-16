import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JournalEntry {
  id: string;
  mood_score: number;
  emotions: string[];
  triggers: string[];
  notes: string | null;
  energy_level: number | null;
  sleep_quality: number | null;
  created_at: string;
}

interface AnalysisRequest {
  journalEntries: JournalEntry[];
  sessions?: unknown[];
  streaks?: unknown[];
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
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Invalid JWT token:', claimsError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user for pattern analysis:', userId);
    // ═══ END AUTHENTICATION ═══

    const { journalEntries, sessions, streaks } = await req.json() as AnalysisRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!journalEntries || journalEntries.length < 3) {
      return new Response(JSON.stringify({ 
        error: 'Se necesitan al menos 3 entradas del diario para analizar patrones' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Analiza estos datos del diario emocional y genera insights personalizados.

## Entradas del Diario (últimas ${journalEntries.length}):
${JSON.stringify(journalEntries, null, 2)}

${sessions ? `## Sesiones Terapéuticas:
${JSON.stringify(sessions, null, 2)}` : ''}

${streaks ? `## Rachas de Actividad:
${JSON.stringify(streaks, null, 2)}` : ''}

## Genera un análisis en formato JSON con la siguiente estructura:

{
  "overallMood": {
    "average": number (1-10),
    "trend": "improving" | "declining" | "stable",
    "description": "descripción breve del estado general"
  },
  "patterns": [
    {
      "type": "emotion" | "trigger" | "correlation" | "time",
      "title": "título del patrón",
      "description": "descripción detallada",
      "frequency": "frecuencia observada",
      "severity": "low" | "medium" | "high"
    }
  ],
  "correlations": [
    {
      "factor1": "nombre del factor",
      "factor2": "nombre del factor",
      "relationship": "positiva" | "negativa",
      "strength": "débil" | "moderada" | "fuerte",
      "insight": "explicación"
    }
  ],
  "predictions": [
    {
      "type": "warning" | "opportunity",
      "message": "predicción o alerta",
      "confidence": "low" | "medium" | "high",
      "recommendation": "qué hacer al respecto"
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "category": "ejercicio" | "hábito" | "reflexión" | "profesional",
      "title": "título de la recomendación",
      "description": "descripción detallada",
      "actExercise": "nombre del ejercicio ACT recomendado si aplica"
    }
  ],
  "weeklyGoalSuggestions": [
    {
      "title": "título del objetivo",
      "description": "descripción",
      "targetCount": number,
      "reasoning": "por qué se sugiere este objetivo"
    }
  ]
}

IMPORTANTE: 
- Responde SOLO con el JSON, sin texto adicional
- Basa tus análisis en datos reales, no inventes patrones
- Si no hay suficientes datos para alguna sección, devuelve arrays vacíos
- Las predicciones deben basarse en tendencias observables
- Las recomendaciones deben ser específicas y accionables`;

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
            content: "Eres un analista de datos emocionales especializado en psicología y ACT. Analizas patrones en diarios emocionales y generas insights útiles. Responde SOLO en JSON válido." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de uso excedido" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Se requiere agregar créditos" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Error en el análisis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const analysisText = aiData.choices?.[0]?.message?.content || '{}';
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = analysisText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    }
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    try {
      const analysis = JSON.parse(cleanedText);
      return new Response(JSON.stringify({ 
        analysis,
        analyzedAt: new Date().toISOString(),
        entriesAnalyzed: journalEntries.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      console.error('Failed to parse AI response:', cleanedText);
      return new Response(JSON.stringify({ 
        error: "Error procesando el análisis",
        rawResponse: cleanedText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
