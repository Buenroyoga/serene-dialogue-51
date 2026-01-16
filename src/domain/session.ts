// ═══════════════════════════════════════════════════════════
// SESSION DOMAIN - Schema migrations and session management
// ═══════════════════════════════════════════════════════════

import { 
  Session, 
  SessionSchema, 
  CURRENT_SCHEMA_VERSION,
  PrivacyMode,
  CompletedSession,
  RitualState,
  ACTMetrics,
  DiagnosisData,
  ProfileResult,
} from './types';

export type { CompletedSession };

const STORAGE_KEY = 'via_serenis_session';
const HISTORY_KEY = 'via_serenis_history';
const EXPIRY_DAYS = 7;

// ═══ SCHEMA MIGRATIONS ═══

interface LegacySessionV1 {
  id: string;
  actProfile: ProfileResult | null;
  diagnosis: DiagnosisData | null;
  dialogue: Array<{
    phaseId: string;
    phaseName: string;
    question: string;
    answer: string;
    timestamp: string | Date;
  }>;
  createdAt: string | Date;
  completedAt?: string | Date;
}

function migrateV1ToV2(legacy: LegacySessionV1): Session {
  return {
    schemaVersion: 2,
    id: legacy.id,
    actProfile: legacy.actProfile,
    diagnosis: legacy.diagnosis,
    dialogue: legacy.dialogue.map(d => ({
      ...d,
      timestamp: new Date(d.timestamp),
      isAiGenerated: false,
    })),
    ritualState: null,
    initialMetrics: legacy.diagnosis ? { intensity: legacy.diagnosis.intensity } : null,
    finalMetrics: null,
    createdAt: new Date(legacy.createdAt),
    completedAt: legacy.completedAt ? new Date(legacy.completedAt) : undefined,
    expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    privacyMode: 'persist',
    tags: [],
  };
}

function migrateSession(data: unknown): Session | null {
  try {
    const obj = data as Record<string, unknown>;
    const version = typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 1;
    
    if (version === 1) {
      return migrateV1ToV2(data as unknown as LegacySessionV1);
    }
    
    // Current version - validate and return
    const parsed = SessionSchema.safeParse({
      ...obj,
      createdAt: new Date(obj.createdAt as string),
      completedAt: obj.completedAt ? new Date(obj.completedAt as string) : undefined,
      expiresAt: obj.expiresAt ? new Date(obj.expiresAt as string) : undefined,
      dialogue: ((obj.dialogue as unknown[]) || []).map((d: unknown) => {
        const entry = d as Record<string, unknown>;
        return {
          ...entry,
          timestamp: new Date(entry.timestamp as string),
        };
      }),
    });
    
    if (parsed.success) {
      return parsed.data;
    }
    
    console.warn('Session validation failed:', parsed.error);
    return null;
  } catch (e) {
    console.warn('Session migration failed:', e);
    return null;
  }
}

// ═══ STORAGE OPERATIONS ═══

export function loadSession(): Session | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    const session = migrateSession(parsed);
    
    if (!session) {
      // Corrupted data - clear and notify
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    // Check expiry
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return session;
  } catch (e) {
    console.warn('Failed to load session:', e);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveSession(session: Session): void {
  if (session.privacyMode === 'private') {
    // Don't persist private sessions
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to save session:', e);
  }
}

export function deleteSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function createNewSession(privacyMode: PrivacyMode = 'persist'): Session {
  const now = new Date();
  const expiresAt = privacyMode === 'session' 
    ? undefined 
    : new Date(now.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    actProfile: null,
    diagnosis: null,
    dialogue: [],
    ritualState: null,
    initialMetrics: null,
    finalMetrics: null,
    createdAt: now,
    expiresAt,
    privacyMode,
    tags: [],
  };
}

// ═══ RITUAL STATE MANAGEMENT ═══

export function createRitualState(): RitualState {
  return {
    currentPhaseIndex: 0,
    answers: [],
    isPaused: false,
    isAiMode: true,
    aiCircuitBreakerTripped: false,
    aiRetryCount: 0,
    metricsHistory: [],
    somaticBreaksTaken: 0,
    needsSomaticBreak: false,
  };
}

export function updateRitualPhase(
  state: RitualState, 
  phaseId: string,
  question: string,
  answer: string,
  isAiGenerated: boolean
): RitualState {
  return {
    ...state,
    currentPhaseIndex: state.currentPhaseIndex + 1,
    answers: [...state.answers, { phaseId, question, answer, isAiGenerated }],
  };
}

export function pauseRitual(state: RitualState): RitualState {
  return {
    ...state,
    isPaused: true,
    pausedAt: new Date(),
  };
}

export function resumeRitual(state: RitualState): RitualState {
  return {
    ...state,
    isPaused: false,
    pausedAt: undefined,
  };
}

export function tripCircuitBreaker(state: RitualState): RitualState {
  return {
    ...state,
    aiCircuitBreakerTripped: true,
    isAiMode: false,
  };
}

export function addMetricsToHistory(state: RitualState, metrics: ACTMetrics): RitualState {
  return {
    ...state,
    metricsHistory: [...state.metricsHistory, metrics],
  };
}

// ═══ HISTORY MANAGEMENT ═══

export function loadHistory(): CompletedSession[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((s: Record<string, unknown>) => ({
      ...s,
      createdAt: new Date(s.createdAt as string),
      completedAt: new Date(s.completedAt as string),
    }));
  } catch {
    return [];
  }
}

export function saveToHistory(session: Session, finalIntensity: number, summaryMode?: 'textual' | 'ai'): void {
  if (!session.actProfile || !session.diagnosis) return;
  
  const completed: CompletedSession = {
    id: session.id,
    createdAt: session.createdAt,
    completedAt: new Date(),
    coreBelief: session.diagnosis.coreBelief,
    primaryEmotion: session.diagnosis.emotionalHistory[0] || '',
    profile: session.actProfile.profile,
    initialIntensity: session.diagnosis.intensity,
    finalIntensity,
    tags: session.tags,
    phasesCompleted: session.dialogue.length,
    usedAi: session.dialogue.some(d => d.isAiGenerated),
    summaryMode,
  };
  
  try {
    const history = loadHistory();
    const updated = [completed, ...history].slice(0, 50); // Keep max 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save to history:', e);
  }
}

export function deleteFromHistory(sessionId: string): void {
  try {
    const history = loadHistory();
    const updated = history.filter(s => s.id !== sessionId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete from history:', e);
  }
}

export function searchHistory(query: string, history: CompletedSession[]): CompletedSession[] {
  const lower = query.toLowerCase();
  return history.filter(s => 
    s.coreBelief.toLowerCase().includes(lower) ||
    s.primaryEmotion.toLowerCase().includes(lower) ||
    s.tags.some(t => t.toLowerCase().includes(lower))
  );
}
