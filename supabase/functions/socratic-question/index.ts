import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('Authenticated user:', userId);
    // ═══ END AUTHENTICATION ═══

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

    // Build rich context from previous answers
    const previousContext = previousAnswers.length > 0
      ? `\n\nCONTEXTO ACUMULADO DEL DIÁLOGO:
${previousAnswers.map((a, i) => 
`Fase ${i + 1} - "${a.phaseId}":
  Pregunta: "${a.question}"
  Respuesta del usuario: "${a.answer}"
  ---`
).join('\n')}

ANÁLISIS DE RESPUESTAS PREVIAS:
- Palabras clave emocionales detectadas: Analiza las respuestas anteriores para identificar emociones recurrentes
- Resistencias observadas: Nota si el usuario evita ciertos temas o profundiza en otros
- Insights emergentes: Qué comprensiones ha mostrado el usuario hasta ahora
- Nivel de apertura: ¿Está siendo superficial o profundo en sus respuestas?`
      : '';

    const systemPrompt = `Eres un terapeuta ACT (Terapia de Aceptación y Compromiso) experto en el método socrático de Via Serenis. 
Tu rol es generar UNA pregunta socrática profunda, personalizada y transformadora que se CONSTRUYA sobre las respuestas anteriores del usuario.

═══════════════════════════════════════════════════════════
PERFIL DEL USUARIO
═══════════════════════════════════════════════════════════
- Perfil ACT: ${profile} (${profileName})
- Creencia nuclear: "${coreBelief}"
- Emociones asociadas: ${emotions.join(', ') || 'no especificadas'}
- Disparadores: ${triggers.join(', ') || 'no especificados'}
- Origen: ${origin || 'no especificado'}
- Intensidad actual: ${intensity}/10

═══════════════════════════════════════════════════════════
FASE ACTUAL: ${phaseName}
═══════════════════════════════════════════════════════════
INSTRUCCIÓN: ${phaseInstruction}
${previousContext}

═══════════════════════════════════════════════════════════
GUÍAS DE TONO SEGÚN PERFIL ACT
═══════════════════════════════════════════════════════════
- Perfil A (Cognitivo): Usa lenguaje analítico, preciso, lógico. Invita a observar los pensamientos como eventos mentales, no como hechos. Usa metáforas cognitivas.
- Perfil B (Emocional): Usa lenguaje empático, cálido, compasivo. Invita a sentir sin evitar, a acoger las emociones. Valida antes de indagar.
- Perfil C (Somático): Usa lenguaje corporal, sensorial, presente. Invita a notar sensaciones físicas específicas (tensión, presión, temperatura). Ancla en el cuerpo.
- Perfil D (Narrativo): Usa lenguaje reflexivo, narrativo, significativo. Invita a cuestionar historias y roles. Explora el origen de las narrativas.

═══════════════════════════════════════════════════════════
TÉCNICAS AVANZADAS PARA PREGUNTAS ADAPTATIVAS
═══════════════════════════════════════════════════════════
1. BUILDING: Si el usuario reveló algo importante en respuestas previas, CONSTRUYE sobre eso
2. DEEPENING: Si el usuario fue superficial, invita a profundizar sin juzgar
3. CONNECTING: Conecta elementos de diferentes respuestas para revelar patrones
4. CHALLENGING (gentil): Si el usuario está muy identificado con la creencia, ofrece perspectiva
5. GROUNDING: Si el usuario está muy abstracto, ancla en experiencia concreta
6. EXPANDING: Si el usuario está muy cerrado, abre nuevas perspectivas

═══════════════════════════════════════════════════════════
REQUISITOS DE LA PREGUNTA
═══════════════════════════════════════════════════════════
1. En español, máximo 2-3 oraciones
2. Incorpora la creencia nuclear textualmente entre comillas
3. Adapta al tono del perfil ACT
4. Sigue la intención específica de la fase actual
5. Si hay respuestas previas, CONSTRUYE sobre ellas usando alguna técnica avanzada
6. Evita preguntas cerradas (sí/no)
7. Invita a la introspección y autoobservación
8. NO repitas preguntas similares a las anteriores
9. Sé específico: usa detalles de las respuestas del usuario
10. Busca el "edge" - ese punto donde el usuario puede expandir su consciencia`;

    const userPrompt = `Genera una pregunta socrática ÚNICA y ADAPTATIVA para la fase "${phaseName}" (${phaseInstruction}).

Creencia a trabajar: "${coreBelief}"
Perfil: ${profileName}
${previousAnswers.length > 0 ? `
IMPORTANTE: El usuario ya ha respondido ${previousAnswers.length} fase(s). 
Su última respuesta fue: "${previousAnswers[previousAnswers.length - 1]?.answer}"

Genera una pregunta que:
- Se construya sobre lo que el usuario acaba de revelar
- Profundice en los insights emergentes
- NO repita conceptos ya explorados
- Mueva al usuario hacia una nueva comprensión` : 'Esta es la primera fase del diálogo.'}

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
        temperature: 0.8,
        max_tokens: 400
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

    console.log('Generated adaptive question:', question);

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
