import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ProfileResult } from '@/lib/actData';
import { DiagnosisData, DialogueEntry } from './useSession';
import { Json } from '@/integrations/supabase/types';

export interface DBSession {
  id: string;
  user_id: string;
  act_profile: ProfileResult | null;
  diagnosis: DiagnosisData | null;
  dialogue: DialogueEntry[];
  initial_intensity: number | null;
  final_intensity: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  mood_score: number;
  emotions: string[];
  triggers: string[];
  notes: string | null;
  energy_level: number | null;
  sleep_quality: number | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: 'daily' | 'weekly' | 'monthly';
  target_count: number;
  current_count: number;
  is_completed: boolean;
  starts_at: string;
  ends_at: string;
  created_at: string;
  completed_at: string | null;
}

export interface Streak {
  id: string;
  user_id: string;
  streak_type: 'ritual' | 'journal' | 'exercise';
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserData() {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<DBSession[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [sessionsRes, journalRes, goalsRes, streaksRes] = await Promise.all([
      supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('streaks').select('*').eq('user_id', user.id)
    ]);

    if (sessionsRes.data) {
      setSessions(sessionsRes.data.map(s => ({
        ...s,
        act_profile: s.act_profile as unknown as ProfileResult | null,
        diagnosis: s.diagnosis as unknown as DiagnosisData | null,
        dialogue: (s.dialogue as unknown as DialogueEntry[]) || []
      })));
    }
    if (journalRes.data) setJournalEntries(journalRes.data as JournalEntry[]);
    if (goalsRes.data) setGoals(goalsRes.data as Goal[]);
    if (streaksRes.data) setStreaks(streaksRes.data as Streak[]);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    } else {
      setSessions([]);
      setJournalEntries([]);
      setGoals([]);
      setStreaks([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchAllData]);

  // Session operations
  const saveSession = async (sessionData: {
    act_profile: ProfileResult | null;
    diagnosis: DiagnosisData | null;
    dialogue: DialogueEntry[];
    initial_intensity: number | null;
    final_intensity: number | null;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        user_id: user.id,
        act_profile: sessionData.act_profile as unknown as Json,
        diagnosis: sessionData.diagnosis as unknown as Json,
        dialogue: sessionData.dialogue as unknown as Json,
        initial_intensity: sessionData.initial_intensity,
        final_intensity: sessionData.final_intensity,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (!error && data) {
      setSessions(prev => [{
        ...data,
        act_profile: data.act_profile as unknown as ProfileResult | null,
        diagnosis: data.diagnosis as unknown as DiagnosisData | null,
        dialogue: (data.dialogue as unknown as DialogueEntry[]) || []
      }, ...prev]);
      await updateStreak('ritual');
    }

    return { data, error };
  };

  // Journal operations
  const addJournalEntry = async (entry: {
    mood_score: number;
    emotions: string[];
    triggers: string[];
    notes?: string;
    energy_level?: number;
    sleep_quality?: number;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        ...entry
      })
      .select()
      .single();

    if (!error && data) {
      setJournalEntries(prev => [data as JournalEntry, ...prev]);
      await updateStreak('journal');
    }

    return { data, error };
  };

  // Goals operations
  const createGoal = async (goal: {
    title: string;
    description?: string;
    goal_type: 'daily' | 'weekly' | 'monthly';
    target_count: number;
    ends_at: string;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        ...goal
      })
      .select()
      .single();

    if (!error && data) {
      setGoals(prev => [data as Goal, ...prev]);
    }

    return { data, error };
  };

  const updateGoalProgress = async (goalId: string, increment: number = 1) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { error: new Error('Goal not found') };

    const newCount = Math.min(goal.current_count + increment, goal.target_count);
    const isCompleted = newCount >= goal.target_count;

    const { data, error } = await supabase
      .from('goals')
      .update({
        current_count: newCount,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', goalId)
      .select()
      .single();

    if (!error && data) {
      setGoals(prev => prev.map(g => g.id === goalId ? data as Goal : g));
    }

    return { data, error };
  };

  // Streak operations
  const updateStreak = async (streakType: 'ritual' | 'journal' | 'exercise') => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const existingStreak = streaks.find(s => s.streak_type === streakType);

    if (existingStreak) {
      const lastDate = existingStreak.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentCount = existingStreak.current_count;

      if (lastDate === today) {
        // Already updated today
        return;
      } else if (lastDate === yesterdayStr) {
        // Consecutive day
        newCurrentCount += 1;
      } else {
        // Streak broken, start fresh
        newCurrentCount = 1;
      }

      const newLongestCount = Math.max(existingStreak.longest_count, newCurrentCount);

      const { data } = await supabase
        .from('streaks')
        .update({
          current_count: newCurrentCount,
          longest_count: newLongestCount,
          last_activity_date: today
        })
        .eq('id', existingStreak.id)
        .select()
        .single();

      if (data) {
        setStreaks(prev => prev.map(s => s.id === existingStreak.id ? data as Streak : s));
      }
    } else {
      // Create new streak
      const { data } = await supabase
        .from('streaks')
        .insert({
          user_id: user.id,
          streak_type: streakType,
          current_count: 1,
          longest_count: 1,
          last_activity_date: today
        })
        .select()
        .single();

      if (data) {
        setStreaks(prev => [...prev, data as Streak]);
      }
    }
  };

  return {
    sessions,
    journalEntries,
    goals,
    streaks,
    loading,
    saveSession,
    addJournalEntry,
    createGoal,
    updateGoalProgress,
    updateStreak,
    refetch: fetchAllData
  };
}
