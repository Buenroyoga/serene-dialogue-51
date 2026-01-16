// ═══════════════════════════════════════════════════════════
// TESTS - Flow State Machine
// ═══════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import { 
  canTransitionTo, 
  getCurrentStage, 
  getAvailableTransitions,
  hasSignificantProgress,
  getProgressPercentage 
} from '@/domain/flow';
import { createNewSession } from '@/domain/session';
import { Session } from '@/domain/types';

describe('Flow State Machine', () => {
  const createMockSession = (overrides: Partial<Session> = {}): Session => ({
    ...createNewSession(),
    ...overrides,
  });

  describe('canTransitionTo', () => {
    it('should always allow transition to IDLE', () => {
      const session = createMockSession();
      const result = canTransitionTo('IDLE', session);
      expect(result.allowed).toBe(true);
    });

    it('should always allow transition to TEST', () => {
      const session = createMockSession();
      const result = canTransitionTo('TEST', session);
      expect(result.allowed).toBe(true);
    });

    it('should block DIAGNOSIS without profile', () => {
      const session = createMockSession({ actProfile: null });
      const result = canTransitionTo('DIAGNOSIS', session);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('profile_required');
      expect(result.suggestion).toContain('Test de Perfil ACT');
    });

    it('should allow DIAGNOSIS with profile', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
      });
      const result = canTransitionTo('DIAGNOSIS', session);
      expect(result.allowed).toBe(true);
    });

    it('should block RITUAL without profile', () => {
      const session = createMockSession({ actProfile: null });
      const result = canTransitionTo('RITUAL', session);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('profile_required');
    });

    it('should block RITUAL without valid diagnosis', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'B',
          scores: { A: 10, B: 25, C: 15, D: 12 },
        },
        diagnosis: null,
      });
      const result = canTransitionTo('RITUAL', session);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('diagnosis_required');
    });

    it('should block RITUAL with invalid diagnosis (short belief)', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
        diagnosis: {
          coreBelief: 'abc', // too short (< 5 chars)
          emotionalHistory: ['Tristeza'],
          triggers: ['Trabajo'],
          narrative: '',
          origin: '',
          intensity: 7,
          subcategory: 'A1',
        },
      });
      const result = canTransitionTo('RITUAL', session);
      
      expect(result.allowed).toBe(false);
    });

    it('should block RITUAL with invalid diagnosis (no emotions)', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
        diagnosis: {
          coreBelief: 'No soy suficiente',
          emotionalHistory: [], // empty
          triggers: ['Trabajo'],
          narrative: '',
          origin: '',
          intensity: 7,
          subcategory: 'A1',
        },
      });
      const result = canTransitionTo('RITUAL', session);
      
      expect(result.allowed).toBe(false);
    });

    it('should allow RITUAL with valid profile and diagnosis', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'C',
          scores: { A: 12, B: 15, C: 28, D: 10 },
        },
        diagnosis: {
          coreBelief: 'No soy suficiente para esto',
          emotionalHistory: ['Ansiedad', 'Miedo'],
          triggers: ['Evaluaciones', 'Comparación'],
          narrative: 'Desde pequeño...',
          origin: 'Infancia',
          intensity: 8,
          subcategory: 'C1',
        },
      });
      const result = canTransitionTo('RITUAL', session);
      
      expect(result.allowed).toBe(true);
    });

    it('should block COMPLETE without profile/diagnosis', () => {
      const session = createMockSession();
      const result = canTransitionTo('COMPLETE', session);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('session_incomplete');
    });
  });

  describe('getCurrentStage', () => {
    it('should return IDLE for empty session', () => {
      const session = createMockSession();
      expect(getCurrentStage(session)).toBe('IDLE');
    });

    it('should return TEST when profile exists but no diagnosis', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
      });
      expect(getCurrentStage(session)).toBe('TEST');
    });

    it('should return DIAGNOSIS when diagnosis exists', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
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
      });
      expect(getCurrentStage(session)).toBe('DIAGNOSIS');
    });

    it('should return RITUAL when ritual is in progress', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
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
        ritualState: {
          currentPhaseIndex: 2,
          answers: [],
          isPaused: false,
          isAiMode: true,
          aiCircuitBreakerTripped: false,
          aiRetryCount: 0,
          metricsHistory: [],
          somaticBreaksTaken: 0,
          needsSomaticBreak: false,
        },
      });
      expect(getCurrentStage(session)).toBe('RITUAL');
    });

    it('should return COMPLETE when session is completed', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
        completedAt: new Date(),
      });
      expect(getCurrentStage(session)).toBe('COMPLETE');
    });
  });

  describe('getAvailableTransitions', () => {
    it('should return IDLE and TEST for empty session', () => {
      const session = createMockSession();
      const available = getAvailableTransitions(session);
      
      expect(available).toContain('IDLE');
      expect(available).toContain('TEST');
      expect(available).not.toContain('DIAGNOSIS');
      expect(available).not.toContain('RITUAL');
    });

    it('should include DIAGNOSIS when profile exists', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
      });
      const available = getAvailableTransitions(session);
      
      expect(available).toContain('DIAGNOSIS');
    });

    it('should include RITUAL when profile and valid diagnosis exist', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
        diagnosis: {
          coreBelief: 'No soy suficiente',
          emotionalHistory: ['Tristeza'],
          triggers: ['Trabajo'],
          narrative: '',
          origin: '',
          intensity: 7,
          subcategory: 'A1',
        },
      });
      const available = getAvailableTransitions(session);
      
      expect(available).toContain('RITUAL');
    });
  });

  describe('hasSignificantProgress', () => {
    it('should return false for empty session', () => {
      const session = createMockSession();
      expect(hasSignificantProgress(session)).toBe(false);
    });

    it('should return true when profile exists', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
      });
      expect(hasSignificantProgress(session)).toBe(true);
    });

    it('should return true when diagnosis has content', () => {
      const session = createMockSession({
        diagnosis: {
          coreBelief: 'Some belief',
          emotionalHistory: [],
          triggers: [],
          narrative: '',
          origin: '',
          intensity: 5,
          subcategory: '',
        },
      });
      expect(hasSignificantProgress(session)).toBe(true);
    });

    it('should return true when dialogue has entries', () => {
      const session = createMockSession({
        dialogue: [{
          phaseId: 'test',
          phaseName: 'Test',
          question: 'Q?',
          answer: 'A',
          timestamp: new Date(),
          isAiGenerated: false,
        }],
      });
      expect(hasSignificantProgress(session)).toBe(true);
    });
  });

  describe('getProgressPercentage', () => {
    it('should return 0 for empty session', () => {
      const session = createMockSession();
      expect(getProgressPercentage(session)).toBe(0);
    });

    it('should return 25 for profile only', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
      });
      expect(getProgressPercentage(session)).toBe(25);
    });

    it('should return 50 for profile + diagnosis', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
        diagnosis: {
          coreBelief: 'Test',
          emotionalHistory: [],
          triggers: [],
          narrative: '',
          origin: '',
          intensity: 5,
          subcategory: '',
        },
      });
      expect(getProgressPercentage(session)).toBe(50);
    });

    it('should return 100 for completed session', () => {
      const session = createMockSession({
        actProfile: {
          profile: 'A',
          scores: { A: 25, B: 15, C: 10, D: 12 },
        },
        completedAt: new Date(),
      });
      expect(getProgressPercentage(session)).toBe(100);
    });
  });
});
