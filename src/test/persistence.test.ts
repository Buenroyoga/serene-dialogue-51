// ═══════════════════════════════════════════════════════════
// TESTS - Session Persistence & Migration
// ═══════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createNewSession, 
  saveSession, 
  loadSession, 
  deleteSession,
  saveToHistory,
  loadHistory,
  deleteFromHistory,
} from '@/domain/session';
import { CURRENT_SCHEMA_VERSION } from '@/domain/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Session Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('createNewSession', () => {
    it('should create session with current schema version', () => {
      const session = createNewSession();
      expect(session.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should create session with unique UUID', () => {
      const session1 = createNewSession();
      const session2 = createNewSession();
      expect(session1.id).not.toBe(session2.id);
      expect(session1.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('should set default privacy mode to persist', () => {
      const session = createNewSession();
      expect(session.privacyMode).toBe('persist');
    });

    it('should set privacy mode when provided', () => {
      const session = createNewSession('private');
      expect(session.privacyMode).toBe('private');
    });

    it('should set expiry date for persist mode', () => {
      const session = createNewSession('persist');
      expect(session.expiresAt).toBeDefined();
      expect(session.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should NOT set expiry for session mode', () => {
      const session = createNewSession('session');
      expect(session.expiresAt).toBeUndefined();
    });

    it('should initialize empty arrays and nulls', () => {
      const session = createNewSession();
      expect(session.actProfile).toBeNull();
      expect(session.diagnosis).toBeNull();
      expect(session.dialogue).toEqual([]);
      expect(session.tags).toEqual([]);
    });
  });

  describe('saveSession / loadSession', () => {
    it('should save and load session correctly', () => {
      const session = createNewSession();
      session.tags = ['test', 'debug'];
      
      saveSession(session);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      const loaded = loadSession();
      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(session.id);
      expect(loaded?.tags).toEqual(['test', 'debug']);
    });

    it('should NOT save private sessions', () => {
      const session = createNewSession('private');
      saveSession(session);
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should return null for empty storage', () => {
      const loaded = loadSession();
      expect(loaded).toBeNull();
    });

    it('should return null and clear for corrupted data', () => {
      localStorageMock.getItem.mockReturnValueOnce('not valid json {{{{');
      
      const loaded = loadSession();
      
      expect(loaded).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('should return null for expired sessions', () => {
      const session = createNewSession();
      session.expiresAt = new Date(Date.now() - 1000); // expired 1 second ago
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(session));
      
      const loaded = loadSession();
      
      expect(loaded).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });

  describe('deleteSession', () => {
    it('should remove session from storage', () => {
      deleteSession();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('via_serenis_session');
    });
  });

  describe('Schema Migration', () => {
    it('should migrate v1 session to v2', () => {
      const v1Session = {
        id: 'test-uuid',
        actProfile: {
          profile: 'A',
          scores: { A: 20, B: 15, C: 10, D: 12 },
        },
        diagnosis: {
          coreBelief: 'Test belief',
          emotionalHistory: ['Tristeza'],
          triggers: ['Trabajo'],
          narrative: '',
          origin: '',
          intensity: 5,
          subcategory: '',
        },
        dialogue: [{
          phaseId: 'certeza',
          phaseName: 'Verificación',
          question: 'Test?',
          answer: 'Answer',
          timestamp: '2024-01-01T00:00:00Z',
        }],
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v1Session));
      
      const loaded = loadSession();
      
      expect(loaded).not.toBeNull();
      expect(loaded?.schemaVersion).toBe(2);
      expect(loaded?.privacyMode).toBe('persist');
      expect(loaded?.ritualState).toBeNull();
      expect(loaded?.dialogue[0].isAiGenerated).toBe(false);
    });
  });
});

describe('History Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('loadHistory', () => {
    it('should return empty array when no history', () => {
      const history = loadHistory();
      expect(history).toEqual([]);
    });

    it('should load and parse history correctly', () => {
      const mockHistory = [{
        id: 'test-id',
        createdAt: '2024-01-01T00:00:00Z',
        completedAt: '2024-01-01T01:00:00Z',
        coreBelief: 'Test',
        primaryEmotion: 'Tristeza',
        profile: 'A',
        initialIntensity: 8,
        finalIntensity: 4,
        tags: ['test'],
        phasesCompleted: 6,
        usedAi: true,
      }];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockHistory));
      
      const history = loadHistory();
      
      expect(history.length).toBe(1);
      expect(history[0].coreBelief).toBe('Test');
      expect(history[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe('saveToHistory', () => {
    it('should save completed session to history', () => {
      const session = createNewSession();
      session.actProfile = {
        profile: 'B',
        scores: { A: 10, B: 25, C: 15, D: 12 },
      };
      session.diagnosis = {
        coreBelief: 'No soy suficiente',
        emotionalHistory: ['Ansiedad'],
        triggers: ['Trabajo'],
        narrative: '',
        origin: '',
        intensity: 7,
        subcategory: 'B1',
      };
      session.dialogue = [{
        phaseId: 'test',
        phaseName: 'Test',
        question: 'Q',
        answer: 'A',
        timestamp: new Date(),
        isAiGenerated: true,
      }];
      
      saveToHistory(session, 3, 'textual');
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData[0].coreBelief).toBe('No soy suficiente');
      expect(savedData[0].initialIntensity).toBe(7);
      expect(savedData[0].finalIntensity).toBe(3);
      expect(savedData[0].usedAi).toBe(true);
    });

    it('should NOT save if no profile or diagnosis', () => {
      const session = createNewSession();
      saveToHistory(session, 5);
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should limit history to 50 entries', () => {
      const existingHistory = Array.from({ length: 50 }, (_, i) => ({
        id: `id-${i}`,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        coreBelief: `Belief ${i}`,
        primaryEmotion: 'Test',
        profile: 'A',
        initialIntensity: 5,
        finalIntensity: 3,
        tags: [],
        phasesCompleted: 6,
        usedAi: false,
      }));
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingHistory));
      
      const session = createNewSession();
      session.actProfile = { profile: 'A', scores: { A: 20, B: 10, C: 10, D: 10 } };
      session.diagnosis = {
        coreBelief: 'New entry',
        emotionalHistory: ['Tristeza'],
        triggers: ['Test'],
        narrative: '',
        origin: '',
        intensity: 5,
        subcategory: '',
      };
      
      saveToHistory(session, 2);
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.length).toBe(50);
      expect(savedData[0].coreBelief).toBe('New entry'); // newest first
    });
  });

  describe('deleteFromHistory', () => {
    it('should remove entry by ID', () => {
      const mockHistory = [
        { id: 'keep-1', coreBelief: 'Keep 1' },
        { id: 'delete-me', coreBelief: 'Delete' },
        { id: 'keep-2', coreBelief: 'Keep 2' },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
      
      deleteFromHistory('delete-me');
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.length).toBe(2);
      expect(savedData.find((s: { id: string }) => s.id === 'delete-me')).toBeUndefined();
    });
  });
});
