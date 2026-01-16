// ═══════════════════════════════════════════════════════════
// DEPRECATED: Este archivo solo re-exporta tipos de domain/types.ts
// Mantener para compatibilidad hacia atrás - NO AÑADIR NUEVA LÓGICA
// ═══════════════════════════════════════════════════════════

// Re-exportar tipos desde el dominio central
export type { 
  DiagnosisData,
  DialogueEntry,
  Session,
  ProfileResult,
} from '@/domain/types';

// Alias para compatibilidad con componentes legacy
import type { Session as DomainSession } from '@/domain/types';
export type LegacySession = DomainSession;
