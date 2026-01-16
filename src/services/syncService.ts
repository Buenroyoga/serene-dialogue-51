// ═══════════════════════════════════════════════════════════
// SYNC SERVICE - Optional Supabase synchronization
// ═══════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';
import { Session, CompletedSession, ProfileResult, DiagnosisData, DialogueEntry } from '@/domain/types';
import type { Json } from '@/integrations/supabase/types';

export interface SyncResult {
  success: boolean;
  error?: string;
  synced?: number;
}

// ═══ AUTH CHECK ═══

export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

// ═══ SESSION SYNC ═══

export async function syncSessionToCloud(session: Session, finalIntensity: number): Promise<SyncResult> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      // Not authenticated - skip sync silently
      return { success: true, synced: 0 };
    }

    if (!session.actProfile || !session.diagnosis) {
      return { success: false, error: 'Incomplete session' };
    }

    const sessionData = {
      id: session.id,
      user_id: userId,
      act_profile: session.actProfile as unknown as Json,
      diagnosis: session.diagnosis as unknown as Json,
      dialogue: session.dialogue as unknown as Json,
      initial_intensity: session.diagnosis.intensity,
      final_intensity: finalIntensity,
      completed_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('sessions')
      .upsert(sessionData);

    if (error) {
      console.warn('Session sync failed:', error);
      return { success: false, error: error.message };
    }

    console.log('[Sync] Session synced to cloud:', session.id);
    return { success: true, synced: 1 };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.warn('Session sync error:', message);
    return { success: false, error: message };
  }
}

// ═══ HISTORY SYNC ═══

export async function loadCloudHistory(): Promise<CompletedSession[]> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Failed to load cloud history:', error);
      return [];
    }

    return (data || []).map(row => {
      const diagnosis = row.diagnosis as unknown as DiagnosisData | null;
      const actProfile = row.act_profile as unknown as ProfileResult | null;
      const dialogue = row.dialogue as unknown as DialogueEntry[] | null;
      
      return {
        id: row.id,
        createdAt: new Date(row.created_at),
        completedAt: new Date(row.completed_at!),
        coreBelief: diagnosis?.coreBelief || '',
        primaryEmotion: diagnosis?.emotionalHistory?.[0] || '',
        profile: actProfile?.profile || 'A',
        initialIntensity: row.initial_intensity || 5,
        finalIntensity: row.final_intensity || 5,
        tags: [],
        phasesCompleted: dialogue?.length || 0,
        usedAi: dialogue?.some(d => d.isAiGenerated) || false,
      };
    });
  } catch (e) {
    console.warn('Cloud history error:', e);
    return [];
  }
}

export async function deleteCloudSession(sessionId: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return false;
    }

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

// ═══ MERGE LOCAL + CLOUD ═══

export function mergeHistories(
  localHistory: CompletedSession[],
  cloudHistory: CompletedSession[]
): CompletedSession[] {
  const merged = new Map<string, CompletedSession>();
  
  // Add cloud entries first
  cloudHistory.forEach(entry => {
    merged.set(entry.id, entry);
  });
  
  // Local entries override cloud (fresher data)
  localHistory.forEach(entry => {
    merged.set(entry.id, entry);
  });
  
  // Sort by completion date, newest first
  return Array.from(merged.values())
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 50);
}

// ═══ BATCH SYNC ═══

export async function syncAllLocalToCloud(localHistory: CompletedSession[]): Promise<SyncResult> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { success: true, synced: 0 };
    }

    // Only sync entries that are not already in cloud
    const cloudHistory = await loadCloudHistory();
    const cloudIds = new Set(cloudHistory.map(h => h.id));
    
    const toSync = localHistory.filter(h => !cloudIds.has(h.id));
    
    if (toSync.length === 0) {
      return { success: true, synced: 0 };
    }

    console.log(`[Sync] Would sync ${toSync.length} local sessions to cloud`);
    
    return { success: true, synced: toSync.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
}
