import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DialogueEntry {
  phaseId: string;
  phaseName: string;
  question: string;
  answer: string;
}

interface RequestBody {
  coreBelief: string;
  profile: string;
  profileName: string;
  emotions: string[];
  triggers: string[];
  origin: string;
  initialIntensity: number;
  finalIntensity: number;
  dialogueEntries: DialogueEntry[];
  actMicro: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: RequestBody = await req.json();
    console.log('Generating summary document for:', body.coreBelief);

    const {
      coreBelief,
      profile,
      profileName,
      emotions,
      triggers,
      origin,
      initialIntensity,
      finalIntensity,
      dialogueEntries,
      actMicro
    } = body;

    const intensityDrop = initialIntensity - finalIntensity;
    const percentDrop = Math.round((intensityDrop / initialIntensity) * 100);

    // Build dialogue transcript
    const dialogueTranscript = dialogueEntries.map(entry => 
      `### ${entry.phaseName}\n**Pregunta:** ${entry.question}\n\n**Tu respuesta:** ${entry.answer}`
    ).join('\n\n---\n\n');

    const systemPrompt = `Eres un terapeuta ACT (Terapia de Aceptación y Compromiso) experto en crear documentos de reflexión personalizados.
Tu tarea es generar un documento de resumen completo y significativo del ritual socrático que el usuario acaba de completar.

INFORMACIÓN DEL USUARIO:
- Perfil ACT: ${profile} (${profileName})
- Creencia nuclear trabajada: "${coreBelief}"
- Emociones asociadas: ${emotions.join(', ') || 'no especificadas'}
- Disparadores: ${triggers.join(', ') || 'no especificados'}
- Origen de la creencia: ${origin || 'no especificado'}
- Intensidad inicial: ${initialIntensity}/10
- Intensidad final: ${finalIntensity}/10
- Reducción lograda: ${intensityDrop} puntos (${percentDrop}%)
- Técnica ACT recomendada: ${actMicro}

DIÁLOGO COMPLETO:
${dialogueTranscript}

ESTRUCTURA DEL DOCUMENTO:
1. **Título personalizado** - Un título poético y significativo para este ritual
2. **Resumen Ejecutivo** - 2-3 oraciones capturando la esencia del trabajo realizado
3. **Tu Creencia Nuclear** - La creencia trabajada con contexto de origen y emociones
4. **Insights Clave** - 3-5 revelaciones importantes extraídas del diálogo
5. **Patrones Observados** - Patrones recurrentes identificados en las respuestas
6. **Tu Transformación** - Descripción del cambio de intensidad y qué significa
7. **Práctica Recomendada** - Ejercicios ACT específicos para continuar el trabajo
8. **Reflexión de Cierre** - Una reflexión poética y esperanzadora

REQUISITOS:
- Escribe en español
- Usa un tono cálido, compasivo pero profesional
- Referencia directamente las respuestas del usuario cuando sea relevante
- Personaliza según el perfil ACT (${profileName})
- Incluye citas textuales de las respuestas más significativas
- Formato: Markdown limpio y bien estructurado
- Longitud: aproximadamente 800-1200 palabras`;

    const userPrompt = `Genera el documento de resumen para este ritual socrático. Hazlo profundo, personalizado y útil para que el usuario pueda volver a él cuando lo necesite.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      console.error('No summary generated from AI');
      throw new Error('No summary generated');
    }

    console.log('Summary generated successfully');

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
