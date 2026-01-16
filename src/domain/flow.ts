// ═══════════════════════════════════════════════════════════
// FLOW CONTROLLER - State machine for app navigation
// ═══════════════════════════════════════════════════════════

import { FlowStage, Session } from './types';

export interface FlowGuardResult {
  allowed: boolean;
  reason?: string;
  suggestion?: string;
}

/**
 * Validates if a stage transition is allowed based on current session state
 */
export function canTransitionTo(targetStage: FlowStage, session: Session): FlowGuardResult {
  switch (targetStage) {
    case 'IDLE':
      return { allowed: true };
      
    case 'TEST':
      return { allowed: true };
      
    case 'DIAGNOSIS':
      if (!session.actProfile) {
        return {
          allowed: false,
          reason: 'profile_required',
          suggestion: 'Primero completa el Test de Perfil ACT para acceder al diagnóstico.',
        };
      }
      return { allowed: true };
      
    case 'RITUAL':
      if (!session.actProfile) {
        return {
          allowed: false,
          reason: 'profile_required',
          suggestion: 'Primero completa el Test de Perfil ACT.',
        };
      }
      if (!session.diagnosis || !isValidDiagnosis(session.diagnosis)) {
        return {
          allowed: false,
          reason: 'diagnosis_required',
          suggestion: 'Primero completa el Diagnóstico con una creencia nuclear válida.',
        };
      }
      return { allowed: true };
      
    case 'COMPLETE':
      if (!session.actProfile || !session.diagnosis) {
        return {
          allowed: false,
          reason: 'session_incomplete',
          suggestion: 'No hay una sesión completa para mostrar.',
        };
      }
      return { allowed: true };
      
    default:
      return { allowed: false, reason: 'unknown_stage' };
  }
}

/**
 * Validates minimum requirements for diagnosis
 */
function isValidDiagnosis(diagnosis: Session['diagnosis']): boolean {
  if (!diagnosis) return false;
  
  return (
    diagnosis.coreBelief.length >= 5 &&
    diagnosis.emotionalHistory.length > 0 &&
    diagnosis.triggers.length > 0 &&
    diagnosis.intensity >= 1 &&
    diagnosis.intensity <= 10
  );
}

/**
 * Determines current effective stage based on session state
 */
export function getCurrentStage(session: Session): FlowStage {
  if (session.completedAt) {
    return 'COMPLETE';
  }
  
  if (session.ritualState && session.ritualState.currentPhaseIndex > 0) {
    return 'RITUAL';
  }
  
  if (session.diagnosis) {
    return 'DIAGNOSIS';
  }
  
  if (session.actProfile) {
    return 'TEST';
  }
  
  return 'IDLE';
}

/**
 * Gets available next stages from current state
 */
export function getAvailableTransitions(session: Session): FlowStage[] {
  const available: FlowStage[] = ['IDLE', 'TEST'];
  
  if (session.actProfile) {
    available.push('DIAGNOSIS');
  }
  
  if (session.actProfile && session.diagnosis && isValidDiagnosis(session.diagnosis)) {
    available.push('RITUAL');
  }
  
  if (session.completedAt) {
    available.push('COMPLETE');
  }
  
  return available;
}

/**
 * Checks if session has meaningful progress worth preserving
 */
export function hasSignificantProgress(session: Session): boolean {
  return (
    session.actProfile !== null ||
    (session.diagnosis !== null && session.diagnosis.coreBelief.length > 0) ||
    session.dialogue.length > 0
  );
}

/**
 * Gets completion percentage for UI
 */
export function getProgressPercentage(session: Session): number {
  let progress = 0;
  
  if (session.actProfile) progress += 25;
  if (session.diagnosis) progress += 25;
  if (session.dialogue.length > 0) {
    progress += Math.min(40, (session.dialogue.length / 6) * 40);
  }
  if (session.completedAt) progress = 100;
  
  return Math.round(progress);
}
