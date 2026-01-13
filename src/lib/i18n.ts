type TranslationValue = string | ((params?: Record<string, string | number>) => string);
type TranslationMap = Record<string, TranslationValue>;

const translations: Record<'es', TranslationMap> = {
  es: {
    'dialogue.title': 'Diálogo Socrático',
    'dialogue.phaseCounter': ({ current, total }) => `Fase ${current} de ${total}`,
    'dialogue.completeTitle': 'Ritual completado',
    'dialogue.completeBody':
      'Has recorrido las 6 fases del diálogo. Puedes cerrar esta sesión o revisarla en el historial.',
    'dialogue.completeCta': 'Guardar y cerrar sesión',
    'dialogue.previousAnswers': 'Tus respuestas anteriores',
    'dialogue.answerPlaceholder': 'Escribe tu respuesta con honestidad...',
    'dialogue.answerHint': 'Deja que tu respuesta fluya. No necesitas que sea perfecta.',
    'dialogue.saveAndContinue': 'Guardar respuesta y continuar',
    'dialogue.back': 'Volver',
    'dialogue.phase.observe': ({ belief, focus }) =>
      `Cuando aparece la creencia "${belief}", ¿qué notas primero en tu ${focus}?`,
    'dialogue.phase.evidence': '¿Qué hechos reales sostienen esta creencia? ¿Cuáles la ponen en duda?',
    'dialogue.phase.impact': '¿Cómo afecta esta creencia a tus relaciones, decisiones y bienestar?',
    'dialogue.phase.values':
      'Si te guiaras por tus valores, ¿qué acción pequeña elegirías hoy, aunque la creencia siga ahí?',
    'dialogue.phase.reframe': '¿Qué versión más compasiva y realista podrías decirte sobre esta creencia?',
    'dialogue.phase.commitment':
      '¿Qué compromiso concreto puedes asumir para avanzar, incluso con la incomodidad presente?',

    'history.title': 'Historial de sesiones',
    'history.subtitle': 'Revisa los rituales que ya completaste.',
    'history.back': 'Volver',
    'history.clear': 'Limpiar historial',
    'history.empty': 'Aún no tienes sesiones completas. Termina un diálogo para que aparezca aquí.',
    'history.count': ({ count }) =>
      `${count} sesión${count === 1 ? '' : 'es'} guardada${count === 1 ? '' : 's'}`,
    'history.profileLabel': 'Perfil',
    'history.pureLabel': 'Puro',
    'history.beliefLabel': 'Creencia',
    'history.phaseCount': ({ count }) =>
      `${count} fase${count === 1 ? '' : 's'} completada${count === 1 ? '' : 's'}`,

    'diagnosis.beliefHint': 'Usa al menos 10 caracteres para describir tu creencia con claridad.',
    'diagnosis.emotionsHint': 'Selecciona al menos una emoción para continuar.',
    'diagnosis.triggersHint': 'Selecciona al menos un disparador para continuar.',
    'diagnosis.customEmotion': 'Otra emoción...',
    'diagnosis.customTrigger': 'Otro disparador...'
  }
};

const defaultLocale: keyof typeof translations = 'es';

export function t(key: keyof typeof translations.es, params?: Record<string, string | number>) {
  const entry = translations[defaultLocale][key];
  if (typeof entry === 'function') {
    return entry(params);
  }
  return entry ?? key;
}
