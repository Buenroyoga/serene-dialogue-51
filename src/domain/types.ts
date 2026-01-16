// ═══════════════════════════════════════════════════════════
// DOMAIN TYPES - Central type definitions for the entire app
// ═══════════════════════════════════════════════════════════

import { z } from 'zod';

// ═══ FLOW STAGES ═══
export const FlowStage = {
  IDLE: 'IDLE',
  TEST: 'TEST',
  DIAGNOSIS: 'DIAGNOSIS',
  RITUAL: 'RITUAL',
  COMPLETE: 'COMPLETE',
} as const;

export type FlowStage = typeof FlowStage[keyof typeof FlowStage];

// ═══ PROFILE CATEGORIES ═══
export const ProfileCategory = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
} as const;

export type ProfileCategory = typeof ProfileCategory[keyof typeof ProfileCategory];

// ═══ ZOD SCHEMAS ═══

export const ProfileScoresSchema = z.object({
  A: z.number().min(0).max(30),
  B: z.number().min(0).max(30),
  C: z.number().min(0).max(30),
  D: z.number().min(0).max(30),
});

export type ProfileScores = z.infer<typeof ProfileScoresSchema>;

export const MixedProfileSchema = z.object({
  name: z.string(),
  description: z.string(),
  emoji: z.string(),
});

export type MixedProfile = z.infer<typeof MixedProfileSchema>;

export const ProfileResultSchema = z.object({
  profile: z.enum(['A', 'B', 'C', 'D']),
  scores: ProfileScoresSchema,
  secondaryProfile: z.enum(['A', 'B', 'C', 'D']).optional(),
  mixedProfile: MixedProfileSchema.optional(),
});

export type ProfileResult = z.infer<typeof ProfileResultSchema>;

export const DiagnosisDataSchema = z.object({
  coreBelief: z.string().min(5, 'La creencia debe tener al menos 5 caracteres'),
  emotionalHistory: z.array(z.string()).min(1, 'Selecciona al menos una emoción'),
  triggers: z.array(z.string()).min(1, 'Selecciona al menos un disparador'),
  narrative: z.string().default(''),
  origin: z.string().default(''),
  intensity: z.number().min(1).max(10),
  subcategory: z.string().default(''),
});

export type DiagnosisData = z.infer<typeof DiagnosisDataSchema>;

export const DialogueEntrySchema = z.object({
  phaseId: z.string(),
  phaseName: z.string(),
  question: z.string(),
  answer: z.string(),
  timestamp: z.date(),
  isAiGenerated: z.boolean().default(false),
});

export type DialogueEntry = z.infer<typeof DialogueEntrySchema>;

// ═══ ACT METRICS ═══
export const ACTMetricsSchema = z.object({
  intensity: z.number().min(0).max(10),
  cognitiveFusion: z.number().min(0).max(10).optional(),
  avoidanceUrgency: z.number().min(0).max(10).optional(),
});

export type ACTMetrics = z.infer<typeof ACTMetricsSchema>;

// ═══ RITUAL STATE ═══
export const RitualStateSchema = z.object({
  currentPhaseIndex: z.number().min(0).max(5),
  answers: z.array(z.object({
    phaseId: z.string(),
    question: z.string(),
    answer: z.string(),
    isAiGenerated: z.boolean().default(false),
  })),
  isPaused: z.boolean().default(false),
  pausedAt: z.date().optional(),
  isAiMode: z.boolean().default(true),
  aiCircuitBreakerTripped: z.boolean().default(false),
  aiRetryCount: z.number().default(0),
  metricsHistory: z.array(ACTMetricsSchema).default([]),
  somaticBreaksTaken: z.number().default(0),
  needsSomaticBreak: z.boolean().default(false),
});

export type RitualState = z.infer<typeof RitualStateSchema>;

// ═══ PRIVACY MODE ═══
export const PrivacyModeSchema = z.enum(['persist', 'session', 'private']);
export type PrivacyMode = z.infer<typeof PrivacyModeSchema>;

// ═══ SESSION SCHEMA (Versioned) ═══
export const CURRENT_SCHEMA_VERSION = 2;

export const SessionSchema = z.object({
  schemaVersion: z.number().default(CURRENT_SCHEMA_VERSION),
  id: z.string().uuid(),
  actProfile: ProfileResultSchema.nullable(),
  diagnosis: DiagnosisDataSchema.nullable(),
  dialogue: z.array(DialogueEntrySchema),
  ritualState: RitualStateSchema.nullable(),
  initialMetrics: ACTMetricsSchema.nullable(),
  finalMetrics: ACTMetricsSchema.nullable(),
  createdAt: z.date(),
  completedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  privacyMode: PrivacyModeSchema.default('persist'),
  tags: z.array(z.string()).default([]),
});

export type Session = z.infer<typeof SessionSchema>;

// ═══ COMPLETED SESSION (for history) ═══
export const CompletedSessionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  completedAt: z.date(),
  coreBelief: z.string(),
  primaryEmotion: z.string(),
  profile: z.enum(['A', 'B', 'C', 'D']),
  initialIntensity: z.number(),
  finalIntensity: z.number(),
  tags: z.array(z.string()),
  phasesCompleted: z.number(),
  usedAi: z.boolean(),
  summaryMode: z.enum(['textual', 'ai']).optional(),
});

export type CompletedSession = z.infer<typeof CompletedSessionSchema>;

// ═══ CRISIS DETECTION ═══
export const CrisisIndicators = {
  KEYWORDS: [
    'suicidio', 'suicidar', 'matarme', 'morir', 'muerte',
    'hacerme daño', 'autolesion', 'autolesión', 'cortarme',
    'no quiero vivir', 'acabar con todo', 'desaparecer',
    'matar', 'hacer daño a', 'violencia'
  ],
  INTENSITY_THRESHOLD: 9,
  SUSTAINED_HIGH_THRESHOLD: 8,
  SUSTAINED_COUNT: 3,
} as const;

// ═══ SUMMARY MODES ═══
export const SummaryMode = {
  TEXTUAL: 'textual', // Solo palabras del usuario
  AI: 'ai', // Con inferencias de IA
} as const;

export type SummaryMode = typeof SummaryMode[keyof typeof SummaryMode];

// ═══ EXPORT FORMAT ═══
export const ExportFormat = {
  PDF: 'pdf',
  HTML: 'html',
  MARKDOWN: 'markdown',
} as const;

export type ExportFormat = typeof ExportFormat[keyof typeof ExportFormat];

// ═══ TELEMETRY EVENTS ═══
export const TelemetryEvent = {
  TEST_STARTED: 'test_started',
  TEST_COMPLETED: 'test_completed',
  DIAGNOSIS_STARTED: 'diagnosis_started',
  DIAGNOSIS_COMPLETED: 'diagnosis_completed',
  RITUAL_STARTED: 'ritual_started',
  RITUAL_PHASE_COMPLETED: 'ritual_phase_completed',
  RITUAL_PAUSED: 'ritual_paused',
  RITUAL_RESUMED: 'ritual_resumed',
  RITUAL_COMPLETED: 'ritual_completed',
  RITUAL_SAVED_EXIT: 'ritual_saved_exit',
  RITUAL_DISCARDED_EXIT: 'ritual_discarded_exit',
  AI_QUESTION_REQUESTED: 'ai_question_requested',
  AI_QUESTION_SUCCESS: 'ai_question_success',
  AI_FALLBACK_USED: 'ai_fallback_used',
  AI_CIRCUIT_BREAKER_TRIPPED: 'ai_circuit_breaker_tripped',
  SOMATIC_BREAK_TRIGGERED: 'somatic_break_triggered',
  SOMATIC_BREAK_COMPLETED: 'somatic_break_completed',
  CRISIS_DETECTED: 'crisis_detected',
  CRISIS_MODAL_SHOWN: 'crisis_modal_shown',
  SUMMARY_GENERATED: 'summary_generated',
  EXPORT_DOWNLOADED: 'export_downloaded',
  SESSION_EXPIRED: 'session_expired',
  SESSION_DELETED: 'session_deleted',
} as const;

export type TelemetryEvent = typeof TelemetryEvent[keyof typeof TelemetryEvent];

export interface TelemetryPayload {
  event: TelemetryEvent;
  timestamp: Date;
  sessionId: string;
  data?: Record<string, unknown>;
}
