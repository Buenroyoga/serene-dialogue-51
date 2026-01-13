import { useState, useCallback, useEffect } from 'react';
import { ProfileResult } from '@/lib/actData';

export interface DiagnosisData {
  coreBelief: string;
  emotionalHistory: string[];
  triggers: string[];
  narrative: string;
  origin: string;
  intensity: number;
  subcategory: string;
}

export interface DialogueEntry {
  phaseId: string;
  phaseName: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  actProfile: ProfileResult | null;
  diagnosis: DiagnosisData | null;
  dialogue: DialogueEntry[];
  createdAt: Date;
  completedAt?: Date;
}

const STORAGE_KEY = 'via_serenis_session';

export function useSession() {
  const [session, setSession] = useState<Session>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          completedAt: parsed.completedAt ? new Date(parsed.completedAt) : undefined
        };
      } catch {
        return createNewSession();
      }
    }
    return createNewSession();
  });

  function createNewSession(): Session {
    return {
      id: crypto.randomUUID(),
      actProfile: null,
      diagnosis: null,
      dialogue: [],
      createdAt: new Date()
    };
  }

  // Save to localStorage whenever session changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const setActProfile = useCallback((profile: ProfileResult) => {
    setSession(prev => ({ ...prev, actProfile: profile }));
  }, []);

  const setDiagnosis = useCallback((diagnosis: DiagnosisData) => {
    setSession(prev => ({ ...prev, diagnosis }));
  }, []);

  const addDialogueEntry = useCallback((entry: Omit<DialogueEntry, 'timestamp'>) => {
    setSession(prev => ({
      ...prev,
      dialogue: [...prev.dialogue, { ...entry, timestamp: new Date() }]
    }));
  }, []);

  const resetSession = useCallback(() => {
    const newSession = createNewSession();
    setSession(newSession);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasProgress = session.actProfile !== null || session.diagnosis !== null || session.dialogue.length > 0;

  return {
    session,
    setActProfile,
    setDiagnosis,
    addDialogueEntry,
    resetSession,
    hasProgress
  };
}
