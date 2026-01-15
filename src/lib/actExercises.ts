// ═══════════════════════════════════════════════════════════
// ACT EXERCISES LIBRARY - Expanded Collection
// ═══════════════════════════════════════════════════════════

import { ProfileCategory } from './actData';

export interface ACTExercise {
  id: string;
  name: string;
  emoji: string;
  duration: string;
  category: 'defusion' | 'acceptance' | 'present' | 'self' | 'values' | 'action';
  profiles: ProfileCategory[];
  description: string;
  steps: string[];
  benefit: string;
}

export const actExercises: ACTExercise[] = [
  // ═══ DEFUSIÓN COGNITIVA ═══
  {
    id: 'leaves-stream',
    name: 'Hojas en el Río',
    emoji: '🍂',
    duration: '5-10 min',
    category: 'defusion',
    profiles: ['A', 'D'],
    description: 'Visualiza tus pensamientos como hojas flotando en un río, observándolos pasar sin aferrarte.',
    steps: [
      'Cierra los ojos y visualiza un río tranquilo',
      'Cuando aparezca un pensamiento, ponlo en una hoja',
      'Observa la hoja flotar río abajo',
      'Si te enganchas, nota que pasó y vuelve al río',
      'Continúa 5-10 minutos'
    ],
    benefit: 'Reduce la fusión con pensamientos negativos'
  },
  {
    id: 'silly-voice',
    name: 'Voz del Crítico Interno',
    emoji: '🎭',
    duration: '2-3 min',
    category: 'defusion',
    profiles: ['A'],
    description: 'Repite el pensamiento negativo con una voz graciosa para quitarle poder.',
    steps: [
      'Identifica el pensamiento autocrítico',
      'Repítelo con voz de dibujo animado',
      'Prueba con voz muy lenta o muy rápida',
      'Nota cómo cambia tu relación con él',
      'El pensamiento sigue ahí, pero pesa menos'
    ],
    benefit: 'Desactiva el poder del pensamiento crítico'
  },
  {
    id: 'thought-labeling',
    name: 'Etiquetado de Pensamientos',
    emoji: '🏷️',
    duration: '1-2 min',
    category: 'defusion',
    profiles: ['A', 'B'],
    description: 'Añade "Estoy teniendo el pensamiento de que..." antes de cada pensamiento difícil.',
    steps: [
      'Cuando notes un pensamiento doloroso, pausa',
      'Di: "Estoy notando que tengo el pensamiento de que..."',
      'Completa con tu pensamiento original',
      'Nota la distancia que se crea',
      'Repite con otros pensamientos'
    ],
    benefit: 'Crea distancia con el contenido mental'
  },
  {
    id: 'hands-metaphor',
    name: 'Metáfora de las Manos',
    emoji: '🙌',
    duration: '3 min',
    category: 'defusion',
    profiles: ['A', 'C'],
    description: 'Usa tus manos para representar cómo te fusionas o defusionas con pensamientos.',
    steps: [
      'Escribe un pensamiento difícil en papel imaginario en tus manos',
      'Lleva las manos a tu cara cubriendo tus ojos (fusión)',
      'Nota cómo se reduce tu campo de visión',
      'Lentamente baja las manos manteniendo el pensamiento',
      'Observa cuánto más ves cuando hay distancia'
    ],
    benefit: 'Visualización física de la defusión'
  },

  // ═══ ACEPTACIÓN ═══
  {
    id: 'rain-practice',
    name: 'Práctica RAIN',
    emoji: '🌧️',
    duration: '10-15 min',
    category: 'acceptance',
    profiles: ['B', 'C'],
    description: 'Reconocer, Aceptar, Investigar, Nutrir - un proceso de aceptación emocional.',
    steps: [
      'R - Reconoce qué está pasando (emoción, sensación)',
      'A - Acepta la experiencia tal como es',
      'I - Investiga con curiosidad: ¿dónde lo siento?',
      'N - Nutre con autocompasión: ¿qué necesito?',
      'Permanece unos momentos en ese espacio'
    ],
    benefit: 'Proceso completo de aceptación emocional'
  },
  {
    id: 'emotion-surfing',
    name: 'Surfear la Ola Emocional',
    emoji: '🌊',
    duration: '5-10 min',
    category: 'acceptance',
    profiles: ['B'],
    description: 'Observa cómo las emociones suben y bajan como olas, sin resistir.',
    steps: [
      'Cuando llegue una emoción intensa, imagina que es una ola',
      'No intentes detenerla ni huir de ella',
      'Siente cómo sube en intensidad (la cresta)',
      'Nota cómo naturalmente comienza a bajar',
      'Las olas siempre pasan; tú sigues aquí'
    ],
    benefit: 'Desarrolla tolerancia emocional'
  },
  {
    id: 'expansion',
    name: 'Expansión y Espacio',
    emoji: '💫',
    duration: '5-8 min',
    category: 'acceptance',
    profiles: ['B', 'C'],
    description: 'Crea espacio interno para las emociones difíciles en lugar de contraerte.',
    steps: [
      'Localiza la sensación difícil en tu cuerpo',
      'Respira hacia esa zona como si le dieras espacio',
      'Imagina que el espacio alrededor se expande',
      'Permite que la sensación esté sin luchar',
      'Nota cómo cambia al darle permiso de estar'
    ],
    benefit: 'Reduce la resistencia a experiencias difíciles'
  },
  {
    id: 'willing-hands',
    name: 'Manos Dispuestas',
    emoji: '🤲',
    duration: '2-3 min',
    category: 'acceptance',
    profiles: ['B', 'C'],
    description: 'Postura física de apertura y disposición ante lo difícil.',
    steps: [
      'Siéntate cómodamente y cierra los ojos',
      'Gira tus palmas hacia arriba sobre tus rodillas',
      'Nota la sensación de apertura en tu cuerpo',
      'Repite: "Estoy dispuesto/a a sentir esto"',
      'Mantén la postura mientras respiras suavemente'
    ],
    benefit: 'Cultiva disposición física y mental'
  },

  // ═══ MOMENTO PRESENTE ═══
  {
    id: 'five-senses',
    name: '5-4-3-2-1 Sensorial',
    emoji: '👁️',
    duration: '3-5 min',
    category: 'present',
    profiles: ['A', 'C', 'D'],
    description: 'Ancla tu atención al presente usando los cinco sentidos.',
    steps: [
      '5 cosas que puedes VER ahora mismo',
      '4 cosas que puedes TOCAR o sentir',
      '3 cosas que puedes OÍR',
      '2 cosas que puedes OLER',
      '1 cosa que puedes SABOREAR'
    ],
    benefit: 'Regreso rápido al momento presente'
  },
  {
    id: 'body-scan',
    name: 'Escaneo Corporal Consciente',
    emoji: '🧘',
    duration: '10-20 min',
    category: 'present',
    profiles: ['C'],
    description: 'Recorre tu cuerpo con atención, notando sensaciones sin juzgar.',
    steps: [
      'Acuéstate o siéntate cómodamente',
      'Comienza por los pies: nota cualquier sensación',
      'Sube lentamente por piernas, torso, brazos, cabeza',
      'No intentes cambiar nada, solo observa',
      'Termina con 3 respiraciones completas'
    ],
    benefit: 'Reconexión con señales corporales'
  },
  {
    id: 'mindful-breath',
    name: 'Respiración Ancla',
    emoji: '🌬️',
    duration: '5 min',
    category: 'present',
    profiles: ['A', 'B', 'C', 'D'],
    description: 'Usa la respiración como ancla al presente cuando la mente viaja.',
    steps: [
      'Inhala contando hasta 4',
      'Sostén contando hasta 4',
      'Exhala contando hasta 6',
      'Cuando la mente se vaya, vuelve a la cuenta',
      'Repite 5-10 ciclos'
    ],
    benefit: 'Calma el sistema nervioso y centra'
  },
  {
    id: 'grounding-feet',
    name: 'Enraizamiento',
    emoji: '🌳',
    duration: '2-3 min',
    category: 'present',
    profiles: ['C', 'B'],
    description: 'Conecta con la tierra a través de los pies para anclarte.',
    steps: [
      'De pie o sentado, siente tus pies en el suelo',
      'Presiona ligeramente contra el piso',
      'Imagina raíces creciendo desde tus pies',
      'Siente la solidez de la tierra sosteniéndote',
      'Respira esa estabilidad hacia arriba'
    ],
    benefit: 'Estabilización rápida ante ansiedad'
  },

  // ═══ YO COMO CONTEXTO ═══
  {
    id: 'sky-weather',
    name: 'El Cielo y el Clima',
    emoji: '⛅',
    duration: '5 min',
    category: 'self',
    profiles: ['B', 'D'],
    description: 'Tú eres el cielo; tus emociones son el clima que pasa.',
    steps: [
      'Imagina que eres el cielo, vasto y espacioso',
      'Las emociones y pensamientos son nubes que pasan',
      'A veces hay tormenta, a veces sol',
      'Pero el cielo siempre permanece intacto',
      'Descansa en esa espaciosidad que eres'
    ],
    benefit: 'Perspectiva más amplia del yo'
  },
  {
    id: 'observer-self',
    name: 'El Yo Observador',
    emoji: '👁️‍🗨️',
    duration: '5-10 min',
    category: 'self',
    profiles: ['A', 'D'],
    description: 'Conecta con la parte de ti que observa todas las experiencias.',
    steps: [
      'Nota tus pensamientos actuales sin engancharte',
      'Pregunta: ¿Quién es el que nota estos pensamientos?',
      'Nota tus emociones como eventos que pasan',
      'Pregunta: ¿Quién es el que observa estas emociones?',
      'Descansa en esa presencia observadora'
    ],
    benefit: 'Desidentificación del contenido mental'
  },
  {
    id: 'chess-board',
    name: 'Metáfora del Tablero',
    emoji: '♟️',
    duration: '5 min',
    category: 'self',
    profiles: ['A', 'B'],
    description: 'Tú eres el tablero, no las piezas en batalla.',
    steps: [
      'Imagina un tablero de ajedrez',
      'Las piezas blancas son pensamientos "buenos"',
      'Las piezas negras son pensamientos "malos"',
      'Nota: tú no eres las piezas, eres el tablero',
      'El tablero sostiene todo sin tomar partido'
    ],
    benefit: 'Perspectiva neutral ante la lucha interna'
  },

  // ═══ VALORES ═══
  {
    id: 'values-compass',
    name: 'Brújula de Valores',
    emoji: '🧭',
    duration: '15-20 min',
    category: 'values',
    profiles: ['D', 'A'],
    description: 'Identifica y clarifica qué es realmente importante para ti.',
    steps: [
      'Lista 5 áreas de vida importantes (familia, trabajo, salud...)',
      'Para cada una, pregunta: ¿Qué tipo de persona quiero ser aquí?',
      'Identifica 3-5 valores centrales que emergen',
      'Ordénalos por importancia actual',
      'Elige uno para cultivar esta semana'
    ],
    benefit: 'Claridad sobre dirección vital'
  },
  {
    id: 'epitaph-exercise',
    name: 'El Epitafio',
    emoji: '🪦',
    duration: '10-15 min',
    category: 'values',
    profiles: ['D'],
    description: 'Reflexiona sobre cómo quieres ser recordado.',
    steps: [
      'Imagina el final de tu vida',
      'Escribe qué te gustaría que dijeran de ti',
      '¿Qué cualidades querías encarnar?',
      '¿Qué impacto querías tener?',
      'Compara con cómo estás viviendo ahora'
    ],
    benefit: 'Perspectiva profunda sobre lo que importa'
  },
  {
    id: 'sweet-spot',
    name: 'Punto Dulce de Valores',
    emoji: '🎯',
    duration: '10 min',
    category: 'values',
    profiles: ['A', 'D'],
    description: 'Encuentra la intersección entre tus valores y acciones diarias.',
    steps: [
      'Elige un valor importante (ej: conexión, creatividad)',
      'Lista 5 pequeñas acciones que lo expresan',
      'Identifica cuáles ya haces, cuáles no',
      'Elige una acción nueva para esta semana',
      'Programa un momento específico para hacerla'
    ],
    benefit: 'Traducir valores en acciones concretas'
  },

  // ═══ ACCIÓN COMPROMETIDA ═══
  {
    id: 'values-walk',
    name: 'Caminata de Valores',
    emoji: '🚶',
    duration: '15-30 min',
    category: 'action',
    profiles: ['C', 'D'],
    description: 'Una caminata consciente conectando con tus valores.',
    steps: [
      'Elige un valor para contemplar (ej: gratitud)',
      'Sal a caminar sin destino fijo',
      'Con cada paso, nota algo relacionado con ese valor',
      'Deja que el movimiento profundice la reflexión',
      'Al volver, anota un insight que tuviste'
    ],
    benefit: 'Integra cuerpo, mente y valores'
  },
  {
    id: 'micro-commitment',
    name: 'Micro-Compromiso Diario',
    emoji: '✨',
    duration: '5 min',
    category: 'action',
    profiles: ['A', 'B', 'C', 'D'],
    description: 'Un pequeño paso diario alineado con tus valores.',
    steps: [
      'Cada mañana, elige UN valor para honrar hoy',
      'Define UNA acción pequeña que lo exprese',
      'Hazla antes de que pase el día',
      'Por la noche, reflexiona: ¿cómo te sentiste?',
      'Celebra el paso, sin importar el resultado'
    ],
    benefit: 'Construye momentum hacia una vida valorada'
  },
  {
    id: 'opposite-action',
    name: 'Acción Opuesta',
    emoji: '🔄',
    duration: '5-10 min',
    category: 'action',
    profiles: ['B', 'C'],
    description: 'Cuando la emoción te empuja a evitar, haz lo opuesto con intención.',
    steps: [
      'Nota la urgencia de evitar (no ir, no decir, no hacer)',
      'Pregunta: ¿Esta evitación me acerca a mis valores?',
      'Si no, identifica la acción opuesta pequeña',
      'Hazla con disposición, no con fuerza',
      'Nota cómo te sientes después'
    ],
    benefit: 'Rompe patrones de evitación'
  },
  {
    id: 'fear-inventory',
    name: 'Inventario de Miedos',
    emoji: '📋',
    duration: '15 min',
    category: 'action',
    profiles: ['B', 'D'],
    description: 'Lista tus miedos y evalúa cuáles te alejan de tus valores.',
    steps: [
      'Lista 5-10 miedos que guían tus decisiones',
      'Para cada uno: ¿Qué evitas por este miedo?',
      '¿Esa evitación te acerca o aleja de tus valores?',
      'Elige un miedo pequeño para enfrentar esta semana',
      'Planea un paso mínimo hacia lo temido'
    ],
    benefit: 'Claridad sobre barreras internas'
  }
];

export function getExercisesForProfile(profile: ProfileCategory): ACTExercise[] {
  return actExercises.filter(ex => ex.profiles.includes(profile));
}

export function getExercisesByCategory(category: ACTExercise['category']): ACTExercise[] {
  return actExercises.filter(ex => ex.category === category);
}

export const exerciseCategories = {
  defusion: { name: 'Defusión Cognitiva', emoji: '🧠', color: 'from-violet-500/20 to-purple-500/20' },
  acceptance: { name: 'Aceptación', emoji: '❤️', color: 'from-rose-500/20 to-pink-500/20' },
  present: { name: 'Momento Presente', emoji: '🌿', color: 'from-emerald-500/20 to-teal-500/20' },
  self: { name: 'Yo como Contexto', emoji: '👁️', color: 'from-cyan-500/20 to-blue-500/20' },
  values: { name: 'Valores', emoji: '🧭', color: 'from-amber-500/20 to-orange-500/20' },
  action: { name: 'Acción Comprometida', emoji: '🚀', color: 'from-red-500/20 to-rose-500/20' }
};
