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

// ═══════════════════════════════════════════════════════════
// SOCRATIC RITUAL - 6 PHASES
// ═══════════════════════════════════════════════════════════

export interface RitualPhase {
  id: string;
  name: string;
  emoji: string;
  instruction: string;
  getQuestion: (context: RitualContext) => string;
}

export interface RitualContext {
  coreBelief: string;
  profile: ProfileCategory;
  emotions: string[];
  triggers: string[];
  origin: string;
  intensity: number;
  subcategory: string;
  previousAnswers: string[];
}

export const socraticRitual: RitualPhase[] = [
  {
    id: 'certeza',
    name: 'Verificación de Certeza',
    emoji: '🔍',
    instruction: 'Examina la solidez de la creencia',
    getQuestion: (ctx) => {
      const trigger = ctx.triggers[0] || 'momentos difíciles';
      switch (ctx.profile) {
        case 'A':
          return `¿Es absolutamente cierto que "${ctx.coreBelief}"? ¿Puedes estar 100% seguro/a de que es verdad, incluso en situaciones como ${trigger}?`;
        case 'B':
          return `Cuando sientes que "${ctx.coreBelief}", ¿esa emoción te está mostrando una verdad absoluta o solo una reacción ante ${trigger}?`;
        case 'C':
          return `Tu cuerpo siente que "${ctx.coreBelief}". Pero ¿esa sensación física prueba que es cierto, o solo que tu cuerpo reacciona ante ${trigger}?`;
        case 'D':
          return `La historia de "${ctx.coreBelief}" que vienes cargando${ctx.origin ? ' desde ' + ctx.origin : ''}... ¿es una verdad inmutable o una narrativa que puedes cuestionar?`;
      }
    }
  },
  {
    id: 'reaccion',
    name: 'Impacto y Reacción',
    emoji: '⚡',
    instruction: 'Observa cómo te afecta creerla',
    getQuestion: (ctx) => {
      const emotionsStr = ctx.emotions.slice(0, 3).join(', ') || 'emociones intensas';
      const trigger = ctx.triggers[1] || ctx.triggers[0] || 'momentos difíciles';
      switch (ctx.profile) {
        case 'A':
          return `Cuando tu mente se fusiona con "${ctx.coreBelief}", ¿cómo reacciona tu sistema nervioso? ¿Qué pensamientos automáticos se disparan? ¿Reconoces emociones como ${emotionsStr}?`;
        case 'B':
          return `¿Qué le pasa a tu corazón cuando crees que "${ctx.coreBelief}"? Con esa intensidad de ${ctx.intensity}/10, observa cómo se manifiestan específicamente estas emociones: ${emotionsStr}. ¿Cuál de ellas es más fuerte ahora mismo?`;
        case 'C':
          return `¿Dónde vive "${ctx.coreBelief}" en tu cuerpo ahora mismo? Cuando aparecen estas emociones —${emotionsStr}— ¿qué tensión, dolor o sensación específica las acompaña?`;
        case 'D':
          return `Cuando la historia "${ctx.coreBelief}" toma el control en momentos como ${trigger}, ¿cómo cambia tu forma de actuar, de relacionarte, de estar en el mundo? ¿Qué papel interpretas cuando estas emociones (${emotionsStr}) te gobiernan?`;
      }
    }
  },
  {
    id: 'sin_historia',
    name: 'Yo Sin la Historia',
    emoji: '🕊️',
    instruction: 'Imagina existir sin esta creencia',
    getQuestion: (ctx) => {
      const emotionsStr = ctx.emotions.slice(0, 3).join(', ') || 'esas emociones';
      const trigger = ctx.triggers[0] || 'esos momentos';
      switch (ctx.profile) {
        case 'A':
          return `Imagina por un momento que el pensamiento "${ctx.coreBelief}" desaparece completamente. ¿Quién serías tú sin esta idea en tu mente, especialmente en situaciones como ${trigger}?`;
        case 'B':
          return `Si pudieras soltar completamente "${ctx.coreBelief}" y la carga emocional de ${emotionsStr}, ¿cómo te sentirías? ¿Qué espacio se abriría en tu interior?`;
        case 'C':
          return `¿Cómo respiraría tu cuerpo si "${ctx.coreBelief}" no viviera en él? Sin esta tensión, ¿qué sensación física te imaginas sintiendo?`;
        case 'D':
          return `Si esta narrativa de "${ctx.coreBelief}" que aprendiste${ctx.origin ? ' de ' + ctx.origin : ''} nunca hubiera sido tuya, ¿qué historia sobre ti mismo/a contarías hoy? ¿De quién era originalmente esta historia?`;
      }
    }
  },
  {
    id: 'opuesto',
    name: 'El Giro (Turnaround)',
    emoji: '🔄',
    instruction: 'Explora la verdad opuesta o alternativa',
    getQuestion: (ctx) => {
      const emotionsStr = ctx.emotions.slice(0, 3).join(', ') || 'esas emociones';
      switch (ctx.profile) {
        case 'A':
          return `¿Podrías encontrar 3 ejemplos reales donde lo opuesto a "${ctx.coreBelief}" ha sido verdad en tu vida? ¿Momentos donde la evidencia muestra algo diferente?`;
        case 'B':
          return `¿Y si en lugar de "${ctx.coreBelief}", la verdad fuera algo más compasivo? En vez de sentir ${emotionsStr}, ¿qué emoción nutritiva podría aparecer si creyeras algo distinto sobre ti?`;
        case 'C':
          return `Tu cuerpo ha aprendido a sentir "${ctx.coreBelief}". Pero ¿ha habido momentos donde tu cuerpo se sintió liviano, capaz, suficiente? ¿Qué sensación opuesta conoce tu cuerpo?`;
        case 'D':
          return `¿Qué pasaría si reescribieras "${ctx.coreBelief}" desde la verdad más profunda de quien eres? Si no fueras el personaje de esta historia, ¿cuál sería tu nueva narrativa?`;
      }
    }
  },
  {
    id: 'testigo',
    name: 'Conciencia Testigo',
    emoji: '👁️',
    instruction: 'Desidentificación: observa sin ser',
    getQuestion: (ctx) => {
      const emotionsStr = ctx.emotions.slice(0, 3).join(', ') || 'esas emociones';
      switch (ctx.profile) {
        case 'A':
          return `Ahora da un paso atrás. Nota que hay una parte de ti que puede OBSERVAR el pensamiento "${ctx.coreBelief}". Si puedes verlo, ¿significa que TÚ no eres ese pensamiento? ¿Quién es el que observa?`;
        case 'B':
          return `Hay una parte de ti que puede sentir ${emotionsStr} y la creencia "${ctx.coreBelief}", pero que NO ES ninguna de esas emociones ni esa creencia. Esa presencia que observa desde el silencio... ¿cómo se siente? ¿Qué nota desde ahí?`;
        case 'C':
          return `Respira profundo. Nota que tu cuerpo siente la tensión de "${ctx.coreBelief}", pero hay una conciencia más amplia que observa esa sensación sin identificarse con ella. Desde ese testigo interior, ¿qué ves?`;
        case 'D':
          return `La historia "${ctx.coreBelief}" ha estado ahí mucho tiempo. Pero nota: hay una parte de ti que existe ANTES de la historia, más allá de la historia, antes del personaje. ¿Quién eres tú sin el guion? ¿Qué queda cuando sueltas el papel que has interpretado?`;
      }
    }
  },
  {
    id: 'felt_shift',
    name: 'Cambio Sentido Corporal',
    emoji: '✨',
    instruction: 'Registra el cambio en tu cuerpo',
    getQuestion: (ctx) => {
      return `Empezaste con "${ctx.coreBelief}" a una intensidad de ${ctx.intensity}/10. Ahora, después de este diálogo, escanea tu cuerpo: ¿Qué ha cambiado? ¿Dónde sientes más espacio, ligereza o apertura? ¿Cuál es la intensidad ahora?`;
    }
  }
];
