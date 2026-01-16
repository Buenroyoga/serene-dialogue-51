// ═══════════════════════════════════════════════════════════
// CRISIS DETECTION - Safety protocols
// ═══════════════════════════════════════════════════════════

import { CrisisIndicators, ACTMetrics } from './types';

export interface CrisisCheckResult {
  isCrisis: boolean;
  reason?: 'keywords' | 'high_intensity' | 'sustained_high';
  matchedKeywords?: string[];
  suggestion?: string;
}

/**
 * Checks user input for crisis indicators
 * Does NOT block - only detects and suggests
 */
export function detectCrisis(
  text: string,
  currentMetrics?: ACTMetrics,
  metricsHistory?: ACTMetrics[]
): CrisisCheckResult {
  const lowerText = text.toLowerCase();
  
  // Check for crisis keywords
  const matchedKeywords = CrisisIndicators.KEYWORDS.filter(kw => 
    lowerText.includes(kw.toLowerCase())
  );
  
  if (matchedKeywords.length > 0) {
    return {
      isCrisis: true,
      reason: 'keywords',
      matchedKeywords,
      suggestion: 'Parece que estás pasando por un momento muy difícil. ¿Te gustaría ver recursos de apoyo?'
    };
  }
  
  // Check for very high intensity
  if (currentMetrics && currentMetrics.intensity >= CrisisIndicators.INTENSITY_THRESHOLD) {
    return {
      isCrisis: true,
      reason: 'high_intensity',
      suggestion: 'Noto que la intensidad es muy alta. ¿Te gustaría hacer una pausa para regularte?'
    };
  }
  
  // Check for sustained high intensity
  if (metricsHistory && metricsHistory.length >= CrisisIndicators.SUSTAINED_COUNT) {
    const recentHigh = metricsHistory
      .slice(-CrisisIndicators.SUSTAINED_COUNT)
      .every(m => m.intensity >= CrisisIndicators.SUSTAINED_HIGH_THRESHOLD);
    
    if (recentHigh) {
      return {
        isCrisis: true,
        reason: 'sustained_high',
        suggestion: 'La intensidad ha sido alta durante varias fases. Quizás sea buen momento para una pausa.'
      };
    }
  }
  
  return { isCrisis: false };
}

/**
 * Checks if intensity spike warrants somatic break
 */
export function shouldTriggerSomaticBreak(
  previousIntensity: number,
  currentIntensity: number,
  somaticBreaksTaken: number
): boolean {
  const spike = currentIntensity - previousIntensity;
  
  // Trigger if intensity spikes by 2+ points or reaches 8+
  if (spike >= 2 || (currentIntensity >= 8 && somaticBreaksTaken < 3)) {
    return true;
  }
  
  return false;
}

export const CRISIS_RESOURCES = {
  spain: {
    name: 'Teléfono de la Esperanza',
    phone: '717 003 717',
    description: 'Línea de atención a la conducta suicida (24h)',
  },
  spain_general: {
    name: 'Teléfono de la Esperanza General',
    phone: '024',
    description: 'Línea corta de atención en crisis',
  },
  international: {
    name: 'International Association for Suicide Prevention',
    url: 'https://www.iasp.info/resources/Crisis_Centres/',
    description: 'Directorio de centros de crisis por país',
  },
};
