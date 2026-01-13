// ACT Profile Questions (24 questions across 4 categories)
export const actProfileQuestions = [
  { id: 1, category: 'A', text: 'Los pensamientos negativos se sienten como órdenes' },
  { id: 2, category: 'A', text: 'Me cuesta diferenciar entre lo que pienso y lo que ocurre' },
  { id: 3, category: 'A', text: 'Mi mente se vuelve rígida cuando no controlo algo' },
  { id: 4, category: 'A', text: 'Necesito tener todo claro u ordenado' },
  { id: 5, category: 'A', text: 'Soy autoexigente incluso cansado/a' },
  { id: 6, category: 'A', text: 'Me cuesta dejar pasar un pensamiento sin analizarlo' },
  { id: 7, category: 'B', text: 'Evito emociones intensas' },
  { id: 8, category: 'B', text: 'Hay sentimientos que vuelven porque no sé sostenerlos' },
  { id: 9, category: 'B', text: 'Mis emociones se acumulan hasta sobrepasarme' },
  { id: 10, category: 'B', text: 'Intento controlar lo que siento cuando algo duele' },
  { id: 11, category: 'B', text: 'A veces siento emociones sin saber por qué' },
  { id: 12, category: 'B', text: 'Evito situaciones donde podría sentir demasiado' },
  { id: 13, category: 'C', text: 'Identifico mi peso por tensiones recurrentes' },
  { id: 14, category: 'C', text: 'Me incomoda sostener sensaciones físicas intensas' },
  { id: 15, category: 'C', text: 'Noto emociones primero en el cuerpo' },
  { id: 16, category: 'C', text: 'El cuerpo se tensa incluso cuando la mente está calmada' },
  { id: 17, category: 'C', text: 'Siento nudos o densidades difíciles de describir' },
  { id: 18, category: 'C', text: 'Ignoro señales corporales hasta que es tarde' },
  { id: 19, category: 'D', text: 'Historias del pasado influyen en mi presente' },
  { id: 20, category: 'D', text: 'Me cuesta soltar expectativas' },
  { id: 21, category: 'D', text: 'A veces vivo según un rumbo no elegido' },
  { id: 22, category: 'D', text: 'Vuelvo mentalmente a escenas del pasado' },
  { id: 23, category: 'D', text: 'Dependo de resultados externos para sentirme bien' },
  { id: 24, category: 'D', text: 'Me siento atrapado/a en una historia sobre mí' }
];

export type ProfileCategory = 'A' | 'B' | 'C' | 'D';

export interface ACTProfile {
  name: string;
  emoji: string;
  description: string;
  actMicro: string;
  tone: string;
  toneAdjectives: string[];
  fullDescription: string;
}

export const actProfiles: Record<ProfileCategory, ACTProfile> = {
  A: {
    name: 'Cognitivo',
    emoji: '🧠',
    description: 'Rigidez mental, fusión con pensamientos',
    actMicro: 'Defusión: "Estoy teniendo el pensamiento de que..."',
    tone: 'analítico y estructurado',
    toneAdjectives: ['preciso', 'claro', 'lógico', 'ordenado'],
    fullDescription: 'Tu mente tiende a fusionarse con los pensamientos, tomándolos como verdades absolutas. La rigidez mental y la necesidad de control son características predominantes.'
  },
  B: {
    name: 'Emocional',
    emoji: '❤️',
    description: 'Emociones atrapadas, evitación afectiva',
    actMicro: 'RAIN breve: Reconozco → Acepto → Siento → Suavizo',
    tone: 'empático y sensible',
    toneAdjectives: ['compasivo', 'cálido', 'acogedor', 'suave'],
    fullDescription: 'Las emociones intensas tienden a acumularse porque hay dificultad para sostenerlas. La evitación emocional es un patrón recurrente.'
  },
  C: {
    name: 'Somático',
    emoji: '💪',
    description: 'El cuerpo guarda tensión y peso',
    actMicro: 'Presencia corporal: Mano en zona tensa + respiración 4s/6s',
    tone: 'corporal y sensorial',
    toneAdjectives: ['visceral', 'físico', 'tangible', 'presente'],
    fullDescription: 'Tu cuerpo almacena las tensiones y emociones. Las señales físicas son el primer indicador de malestar o estrés.'
  },
  D: {
    name: 'Narrativo',
    emoji: '📖',
    description: 'Historias del pasado gobiernan el presente',
    actMicro: 'Valores: "La historia que me cuento es... y hoy elijo avanzar"',
    tone: 'narrativo y reflexivo',
    toneAdjectives: ['profundo', 'introspectivo', 'contemplativo', 'significativo'],
    fullDescription: 'Las narrativas del pasado y las expectativas futuras condicionan tu experiencia presente. Vives según guiones no siempre elegidos.'
  }
};

export interface MixedProfile {
  name: string;
  description: string;
  emoji: string;
}

export const mixedProfiles: Record<string, MixedProfile> = {
  'AB': { name: 'Tormenta Interna', description: 'Pensamiento rígido + emoción intensa', emoji: '🌪️' },
  'AC': { name: 'Tensión Encarnada', description: 'Mente rígida + cuerpo contraído', emoji: '⚡' },
  'AD': { name: 'Arquitecto Atrapado', description: 'Historias rígidas + pensamientos literales', emoji: '🏗️' },
  'BC': { name: 'Cuerpo que Llora', description: 'Emoción densa + nudo corporal', emoji: '🌊' },
  'BD': { name: 'Herida que Narra', description: 'Emoción fuerte + historia antigua', emoji: '📜' },
  'CD': { name: 'Cuerpo que Recuerda', description: 'Tensión crónica + guion del pasado', emoji: '🎭' }
};

export interface ProfileScores {
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface ProfileResult {
  profile: ProfileCategory;
  scores: ProfileScores;
  secondaryProfile?: ProfileCategory;
  mixedProfile?: MixedProfile;
}

export function calculateProfile(answers: Record<number, number>): ProfileResult {
  const scores: ProfileScores = { A: 0, B: 0, C: 0, D: 0 };
  
  actProfileQuestions.forEach(q => {
    const answer = answers[q.id] || 0;
    scores[q.category as ProfileCategory] += answer;
  });

  // Find primary and secondary profiles
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const primary = sorted[0][0] as ProfileCategory;
  const secondary = sorted[1][0] as ProfileCategory;

  // Check for mixed profile (if scores are close)
  const primaryScore = sorted[0][1];
  const secondaryScore = sorted[1][1];
  const isMixed = secondaryScore >= primaryScore * 0.85;

  const mixedKey = [primary, secondary].sort().join('');
  const mixedProfile = isMixed ? mixedProfiles[mixedKey] : undefined;

  return {
    profile: primary,
    scores,
    secondaryProfile: isMixed ? secondary : undefined,
    mixedProfile
  };
}
