// ═══════════════════════════════════════════════════════════
// FLOW CONTROLLER HOOK - State machine for app navigation
// ═══════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react';
import { 
  FlowStage, 
  Session, 
  ProfileResult, 
  DiagnosisData, 
  DialogueEntry,
  PrivacyMode,
  ACTMetrics,
  TelemetryEvent,
} from '@/domain/types';
import { 
  canTransitionTo, 
  getCurrentStage, 
  hasSignificantProgress,
  getProgressPercentage,
} from '@/domain/flow';
import {
  loadSession,
  saveSession,
  deleteSession,
  createNewSession,
  createRitualState,
  pauseRitual,
  resumeRitual,
  tripCircuitBreaker,
  saveToHistory,
  loadHistory,
  deleteFromHistory,
  searchHistory,
  CompletedSession,
} from '@/domain/session';
import { telemetry } from '@/domain/telemetry';
import { toast } from 'sonner';

export function useFlowController() {
  const [session, setSession] = useState<Session>(() => loadSession() || createNewSession());
  const [currentStage, setCurrentStage] = useState<FlowStage>(() => getCurrentStage(session));
  const [history, setHistory] = useState<CompletedSession[]>(() => loadHistory());
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    return !sessionStorage.getItem('disclaimer_shown');
  });

  // Persist session changes
  useEffect(() => {
    saveSession(session);
  }, [session]);

  // ═══ STAGE TRANSITIONS ═══
  
  const goToStage = useCallback((targetStage: FlowStage) => {
    const guard = canTransitionTo(targetStage, session);
    
    if (!guard.allowed) {
      toast.error(guard.suggestion || 'No puedes acceder a esta etapa todavía');
      return false;
    }
    
    setCurrentStage(targetStage);
    return true;
  }, [session]);

  // ═══ PROFILE MANAGEMENT ═══
  
  const setActProfile = useCallback((profile: ProfileResult) => {
    telemetry.track(TelemetryEvent.TEST_COMPLETED, session.id, { profile: profile.profile });
    
    setSession(prev => ({
      ...prev,
      actProfile: profile,
    }));
    
    toast.success('Perfil ACT identificado');
    setCurrentStage('IDLE');
  }, [session.id]);

  // ═══ DIAGNOSIS MANAGEMENT ═══
  
  const setDiagnosis = useCallback((diagnosis: DiagnosisData) => {
    telemetry.track(TelemetryEvent.DIAGNOSIS_COMPLETED, session.id, { 
      intensity: diagnosis.intensity,
      emotionCount: diagnosis.emotionalHistory.length,
    });
    
    setSession(prev => ({
      ...prev,
      diagnosis,
      initialMetrics: { intensity: diagnosis.intensity },
    }));
    
    toast.success('Diagnóstico completado');
    setCurrentStage('IDLE');
  }, [session.id]);

  // ═══ RITUAL MANAGEMENT ═══
  
  const startRitual = useCallback(() => {
    const guard = canTransitionTo('RITUAL', session);
    if (!guard.allowed) {
      toast.error(guard.suggestion || 'Completa los pasos anteriores primero');
      return false;
    }
    
    telemetry.track(TelemetryEvent.RITUAL_STARTED, session.id);
    
    setSession(prev => ({
      ...prev,
      ritualState: prev.ritualState || createRitualState(),
    }));
    
    setCurrentStage('RITUAL');
    return true;
  }, [session]);

  const addDialogueEntry = useCallback((entry: Omit<DialogueEntry, 'timestamp'>) => {
    const fullEntry: DialogueEntry = {
      ...entry,
      timestamp: new Date(),
    };
    
    telemetry.track(TelemetryEvent.RITUAL_PHASE_COMPLETED, session.id, {
      phaseId: entry.phaseId,
      isAiGenerated: entry.isAiGenerated,
    });
    
    setSession(prev => ({
      ...prev,
      dialogue: [...prev.dialogue, fullEntry],
    }));
  }, [session.id]);

  const pauseCurrentRitual = useCallback(() => {
    telemetry.track(TelemetryEvent.RITUAL_PAUSED, session.id);
    
    setSession(prev => ({
      ...prev,
      ritualState: prev.ritualState ? pauseRitual(prev.ritualState) : null,
    }));
    
    setCurrentStage('IDLE');
    toast.info('Ritual pausado. Tu progreso está guardado.');
  }, [session.id]);

  const resumeCurrentRitual = useCallback(() => {
    if (!session.ritualState) {
      toast.error('No hay ritual para reanudar');
      return false;
    }
    
    telemetry.track(TelemetryEvent.RITUAL_RESUMED, session.id);
    
    setSession(prev => ({
      ...prev,
      ritualState: prev.ritualState ? resumeRitual(prev.ritualState) : null,
    }));
    
    setCurrentStage('RITUAL');
    return true;
  }, [session]);

  const tripAiCircuitBreaker = useCallback(() => {
    telemetry.track(TelemetryEvent.AI_CIRCUIT_BREAKER_TRIPPED, session.id);
    
    setSession(prev => ({
      ...prev,
      ritualState: prev.ritualState ? tripCircuitBreaker(prev.ritualState) : null,
    }));
    
    toast.info('Cambiando a preguntas estándar', {
      description: 'Continuaremos con preguntas predefinidas de alta calidad.',
    });
  }, [session.id]);

  const updateRitualMetrics = useCallback((metrics: ACTMetrics) => {
    setSession(prev => {
      if (!prev.ritualState) return prev;
      return {
        ...prev,
        ritualState: {
          ...prev.ritualState,
          metricsHistory: [...prev.ritualState.metricsHistory, metrics],
        },
      };
    });
  }, []);

  const setSomaticBreakNeeded = useCallback((needed: boolean) => {
    setSession(prev => {
      if (!prev.ritualState) return prev;
      return {
        ...prev,
        ritualState: {
          ...prev.ritualState,
          needsSomaticBreak: needed,
        },
      };
    });
  }, []);

  const completeSomaticBreak = useCallback(() => {
    telemetry.track(TelemetryEvent.SOMATIC_BREAK_COMPLETED, session.id);
    
    setSession(prev => {
      if (!prev.ritualState) return prev;
      return {
        ...prev,
        ritualState: {
          ...prev.ritualState,
          needsSomaticBreak: false,
          somaticBreaksTaken: prev.ritualState.somaticBreaksTaken + 1,
        },
      };
    });
  }, [session.id]);

  // ═══ COMPLETION ═══
  
  const completeRitual = useCallback((finalIntensity: number, summaryMode?: 'textual' | 'ai') => {
    telemetry.track(TelemetryEvent.RITUAL_COMPLETED, session.id, {
      initialIntensity: session.diagnosis?.intensity,
      finalIntensity,
      phasesCompleted: session.dialogue.length,
    });
    
    // Save to history
    saveToHistory(session, finalIntensity, summaryMode);
    setHistory(loadHistory());
    
    setSession(prev => ({
      ...prev,
      finalMetrics: { intensity: finalIntensity },
      completedAt: new Date(),
    }));
    
    setCurrentStage('COMPLETE');
  }, [session]);

  // ═══ SESSION MANAGEMENT ═══
  
  const resetSession = useCallback((privacyMode: PrivacyMode = 'persist') => {
    telemetry.track(TelemetryEvent.SESSION_DELETED, session.id);
    
    deleteSession();
    const newSession = createNewSession(privacyMode);
    setSession(newSession);
    setCurrentStage('IDLE');
    
    toast.success('Sesión reiniciada');
  }, [session.id]);

  const startNewRitual = useCallback(() => {
    // Keep profile but reset diagnosis and ritual
    setSession(prev => ({
      ...prev,
      diagnosis: null,
      dialogue: [],
      ritualState: null,
      initialMetrics: null,
      finalMetrics: null,
      completedAt: undefined,
    }));
    
    setCurrentStage('IDLE');
  }, []);

  const setPrivacyMode = useCallback((mode: PrivacyMode) => {
    setSession(prev => ({
      ...prev,
      privacyMode: mode,
    }));
    
    if (mode === 'private') {
      deleteSession();
      toast.info('Modo privado activado', {
        description: 'Los datos no se guardarán al cerrar.',
      });
    }
  }, []);

  const addTag = useCallback((tag: string) => {
    setSession(prev => ({
      ...prev,
      tags: [...new Set([...prev.tags, tag])],
    }));
  }, []);

  // ═══ HISTORY MANAGEMENT ═══
  
  const deleteHistoryEntry = useCallback((sessionId: string) => {
    deleteFromHistory(sessionId);
    setHistory(loadHistory());
    toast.success('Entrada eliminada del historial');
  }, []);

  const searchInHistory = useCallback((query: string) => {
    if (!query.trim()) {
      return history;
    }
    return searchHistory(query, history);
  }, [history]);

  // ═══ DISCLAIMER ═══
  
  const dismissDisclaimer = useCallback(() => {
    sessionStorage.setItem('disclaimer_shown', 'true');
    setShowDisclaimer(false);
  }, []);

  // ═══ COMPUTED VALUES ═══
  
  const hasProfile = session.actProfile !== null;
  const hasDiagnosis = session.diagnosis !== null;
  const hasProgress = hasSignificantProgress(session);
  const progressPercent = getProgressPercentage(session);
  const canStartRitual = hasProfile && hasDiagnosis;
  const isRitualPaused = session.ritualState?.isPaused ?? false;
  const isAiMode = session.ritualState?.isAiMode ?? true;
  const aiCircuitBroken = session.ritualState?.aiCircuitBreakerTripped ?? false;

  return {
    // State
    session,
    currentStage,
    history,
    showDisclaimer,
    
    // Computed
    hasProfile,
    hasDiagnosis,
    hasProgress,
    progressPercent,
    canStartRitual,
    isRitualPaused,
    isAiMode,
    aiCircuitBroken,
    
    // Stage navigation
    goToStage,
    
    // Profile
    setActProfile,
    
    // Diagnosis
    setDiagnosis,
    
    // Ritual
    startRitual,
    addDialogueEntry,
    pauseCurrentRitual,
    resumeCurrentRitual,
    tripAiCircuitBreaker,
    updateRitualMetrics,
    setSomaticBreakNeeded,
    completeSomaticBreak,
    completeRitual,
    
    // Session
    resetSession,
    startNewRitual,
    setPrivacyMode,
    addTag,
    
    // History
    deleteHistoryEntry,
    searchInHistory,
    
    // Disclaimer
    dismissDisclaimer,
  };
}
