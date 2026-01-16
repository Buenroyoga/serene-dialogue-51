// ═══════════════════════════════════════════════════════════
// TELEMETRY - Local event tracking for debugging
// ═══════════════════════════════════════════════════════════

import { TelemetryEvent, TelemetryPayload } from './types';

const TELEMETRY_STORAGE_KEY = 'via_serenis_telemetry';
const MAX_EVENTS = 500;

class TelemetryService {
  private events: TelemetryPayload[] = [];
  private enabled = true;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(TELEMETRY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.events = parsed.map((e: TelemetryPayload) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch {
      this.events = [];
    }
  }

  private saveToStorage(): void {
    if (!this.enabled) return;
    try {
      // Keep only last MAX_EVENTS
      const toSave = this.events.slice(-MAX_EVENTS);
      localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Telemetry save failed:', e);
    }
  }

  track(event: TelemetryEvent, sessionId: string, data?: Record<string, unknown>): void {
    const payload: TelemetryPayload = {
      event,
      timestamp: new Date(),
      sessionId,
      data,
    };

    this.events.push(payload);
    this.saveToStorage();

    // Debug log in development
    if (import.meta.env.DEV) {
      console.log(`[Telemetry] ${event}`, data || '');
    }
  }

  getEvents(sessionId?: string): TelemetryPayload[] {
    if (sessionId) {
      return this.events.filter(e => e.sessionId === sessionId);
    }
    return [...this.events];
  }

  getEventsByType(event: TelemetryEvent): TelemetryPayload[] {
    return this.events.filter(e => e.event === event);
  }

  clear(): void {
    this.events = [];
    localStorage.removeItem(TELEMETRY_STORAGE_KEY);
  }

  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }

  exportAsJson(): string {
    return JSON.stringify(this.events, null, 2);
  }
}

export const telemetry = new TelemetryService();
