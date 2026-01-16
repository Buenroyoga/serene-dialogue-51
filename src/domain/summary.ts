// ═══════════════════════════════════════════════════════════
// SUMMARY GENERATION - Dual mode summary creation
// ═══════════════════════════════════════════════════════════

import { Session, SummaryMode, ProfileResult, DiagnosisData, DialogueEntry } from './types';
import { actProfiles, socraticRitual } from '@/lib/actData';
import { getExercisesForProfile } from '@/lib/actExercises';

interface SummaryData {
  profile: ProfileResult;
  diagnosis: DiagnosisData;
  dialogue: DialogueEntry[];
  initialIntensity: number;
  finalIntensity: number;
}

/**
 * Generates a summary using ONLY the user's own words
 * No inferences, no additions, no interpretations
 */
export function generateTextualSummary(data: SummaryData): string {
  const { profile, diagnosis, dialogue, initialIntensity, finalIntensity } = data;
  const profileData = actProfiles[profile.profile];
  const intensityDrop = initialIntensity - finalIntensity;
  const date = new Date().toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  let summary = `# Documento de Transformación
*Registro textual del ritual socrático*
*${date}*

---

## Perfil ACT
**${profileData.emoji} ${profileData.name}**

---

## Creencia Trabajada
> "${diagnosis.coreBelief}"

**Intensidad inicial:** ${initialIntensity}/10
**Intensidad final:** ${finalIntensity}/10
${intensityDrop > 0 ? `**Reducción:** ${intensityDrop} puntos` : ''}

---

## Contexto Emocional
**Emociones identificadas:** ${diagnosis.emotionalHistory.join(', ')}
**Disparadores:** ${diagnosis.triggers.join(', ')}
${diagnosis.origin ? `**Origen:** ${diagnosis.origin}` : ''}

---

## Diálogo Socrático - Mis Palabras

`;

  dialogue.forEach(entry => {
    const phase = socraticRitual.find(p => p.id === entry.phaseId);
    summary += `### ${phase?.emoji || '•'} ${entry.phaseName}
**Pregunta:** ${entry.question}

**Mi respuesta:**
> ${entry.answer}

---

`;
  });

  summary += `## Práctica ACT Recomendada
${profileData.actMicro}

---

*Este documento contiene exclusivamente tus propias palabras sin interpretaciones añadidas.*
*Generado el ${date}*
`;

  return summary;
}

/**
 * Prepares structured data for AI summary generation
 * Used when calling the edge function
 */
export function prepareSummaryRequest(session: Session, finalIntensity: number) {
  if (!session.actProfile || !session.diagnosis) {
    throw new Error('Session incomplete for summary');
  }

  const profileData = actProfiles[session.actProfile.profile];
  const exercises = getExercisesForProfile(session.actProfile.profile).slice(0, 3);

  return {
    coreBelief: session.diagnosis.coreBelief,
    profile: session.actProfile.profile,
    profileName: profileData.name,
    emotions: session.diagnosis.emotionalHistory,
    triggers: session.diagnosis.triggers,
    origin: session.diagnosis.origin,
    initialIntensity: session.diagnosis.intensity,
    finalIntensity,
    dialogueEntries: session.dialogue.map(d => ({
      phaseId: d.phaseId,
      phaseName: d.phaseName,
      question: d.question,
      answer: d.answer,
    })),
    actMicro: profileData.actMicro,
    recommendedExercises: exercises.map(e => ({
      name: e.name,
      emoji: e.emoji,
      duration: e.duration,
    })),
  };
}

/**
 * Generates the closure data structure for RitualComplete
 */
export function generateClosureData(session: Session, finalIntensity: number) {
  if (!session.actProfile || !session.diagnosis) {
    return null;
  }

  const profileData = actProfiles[session.actProfile.profile];
  const intensityDrop = session.diagnosis.intensity - finalIntensity;
  const percentDrop = Math.round((intensityDrop / session.diagnosis.intensity) * 100);

  // Extract key insights from dialogue
  const keyInsights = extractKeyInsights(session.dialogue);
  
  // Identify underlying value (from last phase answers typically)
  const underlyingValue = extractUnderlyingValue(session.dialogue);
  
  // Generate if-then plan
  const ifThenPlan = generateIfThenPlan(session.diagnosis, profileData);

  return {
    transformation: getTransformationLevel(percentDrop),
    intensityDrop,
    percentDrop,
    keyInsights,
    underlyingValue,
    ifThenPlan,
    actPractice: profileData.actMicro,
    recommendedExercises: getExercisesForProfile(session.actProfile.profile).slice(0, 3),
    actionCommitment: generateActionCommitment(underlyingValue, session.diagnosis),
  };
}

function getTransformationLevel(percentDrop: number) {
  if (percentDrop >= 70) {
    return {
      level: 'profound',
      emoji: '🌟',
      title: 'Transformación Profunda',
      message: 'Has logrado una liberación significativa.',
    };
  } else if (percentDrop >= 40) {
    return {
      level: 'notable',
      emoji: '✨',
      title: 'Cambio Notable',
      message: 'La creencia ha perdido fuerza.',
    };
  } else if (percentDrop > 0) {
    return {
      level: 'seed',
      emoji: '🌱',
      title: 'Semilla de Cambio',
      message: 'Has comenzado el proceso.',
    };
  }
  return {
    level: 'process',
    emoji: '💎',
    title: 'Proceso en Curso',
    message: 'La consciencia es el primer paso.',
  };
}

function extractKeyInsights(dialogue: DialogueEntry[]): string[] {
  // Extract meaningful phrases from user answers
  const insights: string[] = [];
  
  dialogue.forEach(entry => {
    const answer = entry.answer.trim();
    if (answer.length > 20 && answer.length < 200) {
      // Get first sentence or meaningful chunk
      const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences[0]) {
        insights.push(sentences[0].trim());
      }
    }
  });
  
  return insights.slice(0, 3);
}

function extractUnderlyingValue(dialogue: DialogueEntry[]): string {
  // Look for value-related content in later phases
  const laterPhases = dialogue.slice(-3);
  
  for (const entry of laterPhases) {
    const answer = entry.answer.toLowerCase();
    
    // Common value indicators
    const valueIndicators = [
      'importante para mí',
      'valoro',
      'quiero ser',
      'me gustaría',
      'aspiro a',
      'sueño con',
      'deseo',
    ];
    
    for (const indicator of valueIndicators) {
      if (answer.includes(indicator)) {
        const sentences = entry.answer.split(/[.!?]+/);
        const relevant = sentences.find(s => s.toLowerCase().includes(indicator));
        if (relevant) {
          return relevant.trim();
        }
      }
    }
  }
  
  return 'Vivir con mayor presencia y autoaceptación';
}

function generateIfThenPlan(diagnosis: DiagnosisData, profile: { name: string; actMicro: string }) {
  const trigger = diagnosis.triggers[0] || 'momentos difíciles';
  const emotion = diagnosis.emotionalHistory[0] || 'malestar';
  
  return {
    trigger: `Cuando aparezca "${diagnosis.coreBelief}" en situaciones de ${trigger}`,
    response: `Usar la técnica ${profile.name}: ${profile.actMicro}`,
    fallback: `Si la ${emotion} persiste, practicar 3 respiraciones conscientes y recordar: "Este pensamiento no soy yo"`,
  };
}

function generateActionCommitment(value: string, diagnosis: DiagnosisData) {
  return {
    timeframe: '24-48 horas',
    action: `Una pequeña acción alineada con: ${value}`,
    reminder: `Cuando aparezca "${diagnosis.coreBelief}", pausar y preguntarme: ¿Qué haría la versión de mí que ya no cree esto?`,
  };
}
