import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  commitment?: string;
  mode?: 'basic' | 'premium';
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
    console.log('Authenticated user:', userId);
    // ═══ END AUTHENTICATION ═══

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: RequestBody = await req.json();
    console.log('Generating premium summary for:', body.coreBelief);

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
      actMicro,
      commitment,
      mode = 'premium'
    } = body;

    const intensityDrop = initialIntensity - finalIntensity;
    const percentDrop = Math.round((intensityDrop / initialIntensity) * 100);

    // Build dialogue transcript
    const dialogueTranscript = dialogueEntries.map(entry => 
      `### ${entry.phaseName}\n**Pregunta:** ${entry.question}\n\n**Tu respuesta:** ${entry.answer}`
    ).join('\n\n---\n\n');

    const systemPrompt = `Eres un terapeuta ACT (Terapia de Aceptación y Compromiso) experto creando documentos de reflexión personalizados.

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
${commitment ? `- Compromiso del usuario: ${commitment}` : ''}

DIÁLOGO COMPLETO:
${dialogueTranscript}

TU TAREA:
Genera un JSON con la siguiente estructura exacta (responde SOLO con JSON válido, sin markdown):

{
  "findings": [
    "Hallazgo 1 basado en las respuestas del usuario (máximo 100 caracteres)",
    "Hallazgo 2 con insight significativo",
    "Hallazgo 3 con patrón o revelación"
  ],
  "underlyingValue": "El valor subyacente que parece importarle al usuario (ej: Conexión, Seguridad, Autenticidad)",
  "ifThenPlan": [
    {
      "trigger": "Cuando [disparador específico basado en los triggers del usuario]",
      "response": "Aplicar [técnica ACT específica del perfil]"
    },
    {
      "trigger": "Cuando sienta [emoción relacionada]",
      "response": "Practicar [técnica de defusión o aceptación]"
    },
    {
      "trigger": "Cuando aparezca la creencia",
      "response": "Recordar [insight específico del diálogo]"
    }
  ],
  "keyInsight": "Una frase poderosa de máximo 150 caracteres que capture la esencia de la transformación",
  "nextStep": "Una acción concreta recomendada para las próximas 24 horas"
}

REQUISITOS:
- Los hallazgos deben ser ESPECÍFICOS basados en las respuestas reales del usuario
- El valor subyacente debe detectarse de las emociones y contexto
- Los planes si-entonces deben usar los disparadores reales del usuario
- Personaliza según el perfil ACT (${profileName})
- Mantén un tono cálido y compasivo
- SOLO responde con JSON válido, sin explicaciones adicionales`;

    const userPrompt = `Analiza el diálogo socrático y genera el JSON con hallazgos, valor subyacente y plan si-entonces personalizado.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          useTextual: true
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.',
          useTextual: true
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.error('No content generated from AI');
      throw new Error('No content generated');
    }

    console.log('AI response:', content);

    // Parse JSON response
    let parsedResponse;
    try {
      // Clean up potential markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return fallback response
      return new Response(JSON.stringify({
        findings: [
          `Al explorar "${coreBelief}", descubriste nuevas perspectivas`,
          `Las emociones de ${emotions.slice(0, 2).join(' y ')} revelaron patrones importantes`,
          `Lograste una reducción de ${intensityDrop} puntos en la intensidad`
        ],
        underlyingValue: detectValueFromEmotions(emotions),
        ifThenPlan: triggers.slice(0, 3).map(trigger => ({
          trigger: `Cuando ${trigger.toLowerCase()}`,
          response: actMicro
        })),
        keyInsight: `Has dado el primer paso hacia una relación diferente con tus pensamientos.`,
        nextStep: `Practica la técnica de defusión cuando notes que la creencia resurge.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Summary generated successfully');

    // Generate full document for export
    const fullDocument = generateFullDocument({
      coreBelief,
      profile,
      profileName,
      emotions,
      triggers,
      origin,
      initialIntensity,
      finalIntensity,
      intensityDrop,
      percentDrop,
      dialogueEntries,
      actMicro,
      commitment,
      findings: parsedResponse.findings,
      underlyingValue: parsedResponse.underlyingValue,
      ifThenPlan: parsedResponse.ifThenPlan,
      keyInsight: parsedResponse.keyInsight,
      nextStep: parsedResponse.nextStep
    });

    return new Response(JSON.stringify({
      ...parsedResponse,
      fullDocument
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      useTextual: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function detectValueFromEmotions(emotions: string[]): string {
  const lowerEmotions = emotions.map(e => e.toLowerCase());
  
  if (lowerEmotions.some(e => ['miedo', 'ansiedad', 'preocupación'].includes(e))) {
    return 'Seguridad y protección';
  }
  if (lowerEmotions.some(e => ['tristeza', 'soledad', 'vacío'].includes(e))) {
    return 'Conexión y pertenencia';
  }
  if (lowerEmotions.some(e => ['vergüenza', 'culpa', 'inadecuación'].includes(e))) {
    return 'Aceptación y valor propio';
  }
  if (lowerEmotions.some(e => ['frustración', 'impotencia', 'rabia'].includes(e))) {
    return 'Autonomía y control';
  }
  
  return 'Bienestar y paz interior';
}

function generateFullDocument(data: {
  coreBelief: string;
  profile: string;
  profileName: string;
  emotions: string[];
  triggers: string[];
  origin: string;
  initialIntensity: number;
  finalIntensity: number;
  intensityDrop: number;
  percentDrop: number;
  dialogueEntries: DialogueEntry[];
  actMicro: string;
  commitment?: string;
  findings: string[];
  underlyingValue: string;
  ifThenPlan: { trigger: string; response: string }[];
  keyInsight: string;
  nextStep: string;
}): string {
  const date = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
# ✨ Documento de Transformación Personal

**Fecha:** ${date}
**Perfil ACT:** ${data.profileName}

---

## 📍 La Creencia Trabajada

> "${data.coreBelief}"

### Métricas de Transformación

| Métrica | Valor |
|---------|-------|
| Intensidad inicial | ${data.initialIntensity}/10 |
| Intensidad final | ${data.finalIntensity}/10 |
| Reducción lograda | ${data.intensityDrop} puntos (${data.percentDrop}%) |

---

## 💭 Contexto Emocional

**Emociones asociadas:** ${data.emotions.join(', ') || 'No especificadas'}

**Disparadores identificados:** ${data.triggers.join(', ') || 'No especificados'}

**Origen de la creencia:** ${data.origin || 'No especificado'}

---

## 💡 Hallazgos Clave

${data.findings.map((f, i) => `${i + 1}. ${f}`).join('\n\n')}

---

## ❤️ Valor Subyacente

Lo que realmente te importa debajo de esta lucha:

**${data.underlyingValue}**

---

## 🛡️ Plan Si-Entonces (Prevención de Recaídas)

${data.ifThenPlan.map(p => `- **${p.trigger}** → ${p.response}`).join('\n\n')}

---

## 🎯 Insight Clave

> "${data.keyInsight}"

---

## ⚡ Próximo Paso Recomendado

${data.nextStep}

${data.commitment ? `
---

## 🎯 Tu Compromiso 24-48h

> ${data.commitment}
` : ''}

---

## 🧘 Tu Práctica ACT Diaria

${data.actMicro}

---

## 🌀 Diálogo Socrático Completo

${data.dialogueEntries.map(entry => `
### ${entry.phaseName}

**Pregunta:** ${entry.question}

**Tu respuesta:** ${entry.answer}
`).join('\n---\n')}

---

*Generado por Diálogo Socrático Interior*

*Este documento es para tu reflexión personal. Vuelve a él cuando necesites recordar tu camino.*
  `.trim();
}
