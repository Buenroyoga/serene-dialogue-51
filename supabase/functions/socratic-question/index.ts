import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  phaseId: string;
  phaseName: string;
  phaseInstruction: string;
  coreBelief: string;
  profile: string;
  profileName: string;
  emotions: string[];
  triggers: string[];
  origin: string;
  intensity: number;
  previousAnswers: { phaseId: string; question: string; answer: string }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: RequestBody = await req.json();
    console.log('Generating adaptive question for phase:', body.phaseId);

    const {
      phaseId,
      phaseName,
      phaseInstruction,
      coreBelief,
      profile,
      profileName,
      emotions,
      triggers,
      origin,
      intensity,
      previousAnswers
    } = body;

    // Build context from previous answers
    const previousContext = previousAnswers.length > 0
      ? `\n\nRespuestas previas del usuario:\n${previousAnswers.map(a => 
          `- Fase "${a.phaseId}": Pregunta: "${a.question}" → Respuesta: "${a.answer}"`
        ).join('\n')}`
      : '';

    const systemPrompt = `Eres un terapeuta ACT (Terapia de Aceptación y Compromiso) experto en el método socrático de Via Serenis. 
Tu rol es generar UNA pregunta socrática profunda, personalizada y transformadora.

PERFIL DEL USUARIO:
- Perfil ACT: ${profile} (${profileName})
- Creencia nuclear: "${coreBelief}"
- Emociones asociadas: ${emotions.join(', ') || 'no especificadas'}
- Disparadores: ${triggers.join(', ') || 'no especificados'}
- Origen: ${origin || 'no especificado'}
- Intensidad actual: ${intensity}/10

FASE ACTUAL: ${phaseName}
INSTRUCCIÓN DE FASE: ${phaseInstruction}
${previousContext}

GUÍAS DE TONO SEGÚN PERFIL:
- Perfil A (Cognitivo): Usa lenguaje analítico, preciso, lógico. Invita a observar los pensamientos.
- Perfil B (Emocional): Usa lenguaje empático, cálido, compasivo. Invita a sentir sin evitar.
- Perfil C (Somático): Usa lenguaje corporal, sensorial, presente. Invita a notar sensaciones físicas.
- Perfil D (Narrativo): Usa lenguaje reflexivo, narrativo, significativo. Invita a cuestionar historias.

REQUISITOS:
1. La pregunta debe ser en español
2. Debe incorporar la creencia nuclear del usuario textualmente entre comillas
3. Debe adaptarse al tono del perfil ACT
4. Debe seguir la intención específica de la fase actual
5. Si hay respuestas previas, construye sobre ellas para profundizar
6. Evita preguntas cerradas (sí/no)
7. Máximo 2-3 oraciones
8. Debe invitar a la introspección y autoobservación`;

    const userPrompt = `Genera una pregunta socrática para la fase "${phaseName}" (${phaseInstruction}).

Creencia a trabajar: "${coreBelief}"
Perfil: ${profileName}

Responde SOLO con la pregunta, sin explicaciones adicionales.`;

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
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          useStatic: true 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.',
          useStatic: true 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const question = data.choices?.[0]?.message?.content?.trim();

    if (!question) {
      console.error('No question generated from AI');
      return new Response(JSON.stringify({ 
        error: 'No question generated',
        useStatic: true 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generated question:', question);

    return new Response(JSON.stringify({ question }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in socratic-question function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      useStatic: true 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});