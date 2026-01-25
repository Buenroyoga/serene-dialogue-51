// ═══════════════════════════════════════════════════════════
// SUPABASE INFRASTRUCTURE - Centralized API calls with timeouts
// ═══════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const AI_TIMEOUT = 30000; // 30 seconds for AI calls

interface FunctionCallOptions {
  timeout?: number;
  retries?: number;
}

interface FunctionCallResult<T> {
  data: T | null;
  error: Error | null;
  isRateLimited: boolean;
  isTimeout: boolean;
}

/**
 * Wraps a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
  return Promise.race([promise, timeout]);
}

/**
 * Centralized function call with timeout and error handling
 */
export async function invokeFunction<T = unknown>(
  functionName: string,
  body: object,
  options: FunctionCallOptions = {}
): Promise<FunctionCallResult<T>> {
  const { timeout = DEFAULT_TIMEOUT, retries = 1 } = options;
  
  // Check if user is authenticated before calling edge functions
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.log(`[${functionName}] No active session, using static fallback`);
    return {
      data: { useStatic: true } as T,
      error: null,
      isRateLimited: false,
      isTimeout: false,
    };
  }
  
  let lastError: Error | null = null;
  let isRateLimited = false;
  let isTimeout = false;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await withTimeout(
        supabase.functions.invoke(functionName, { body }),
        timeout
      );
      
      if (result.error) {
        const errorMsg = result.error.message || '';
        isRateLimited = errorMsg.includes('Rate limit') || errorMsg.includes('429');
        
        // Handle 401 errors - user token may have expired
        if (errorMsg.includes('401') || errorMsg.includes('Invalid token') || errorMsg.includes('Unauthorized')) {
          console.log(`[${functionName}] Auth error, using static fallback`);
          return {
            data: { useStatic: true } as T,
            error: null,
            isRateLimited: false,
            isTimeout: false,
          };
        }
        
        if (isRateLimited) {
          return {
            data: null,
            error: new Error('Límite de uso alcanzado. Por favor, espera un momento.'),
            isRateLimited: true,
            isTimeout: false,
          };
        }
        
        throw new Error(errorMsg || 'Function call failed');
      }
      
      return {
        data: result.data as T,
        error: null,
        isRateLimited: false,
        isTimeout: false,
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Unknown error');
      isTimeout = lastError.message === 'Request timeout';
      
      // Don't retry on rate limit
      if (isRateLimited) break;
      
      // Wait before retry
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  return {
    data: null,
    error: lastError,
    isRateLimited,
    isTimeout,
  };
}

// ═══ SPECIFIC FUNCTION CALLS ═══

export interface SocraticQuestionRequest {
  phaseId: string;
  phaseName: string;
  phaseInstruction: string;
  coreBelief: string;
  profile: string;
  profileName: string;
  emotions: string[];
  triggers: string[];
  origin: string;
  intensity: number;
  previousAnswers: Array<{
    phaseId: string;
    question: string;
    answer: string;
  }>;
}

export interface SocraticQuestionResponse {
  question?: string;
  useStatic?: boolean;
  error?: string;
}

export async function fetchSocraticQuestion(
  request: SocraticQuestionRequest
): Promise<FunctionCallResult<SocraticQuestionResponse>> {
  return invokeFunction<SocraticQuestionResponse>(
    'socratic-question',
    request,
    { timeout: AI_TIMEOUT, retries: 2 }
  );
}

export interface SummaryRequest {
  coreBelief: string;
  profile: string;
  profileName: string;
  emotions: string[];
  triggers: string[];
  origin: string;
  initialIntensity: number;
  finalIntensity: number;
  dialogueEntries: Array<{
    phaseId: string;
    phaseName: string;
    question: string;
    answer: string;
  }>;
  actMicro: string;
}

export interface SummaryResponse {
  summary?: string;
  error?: string;
}

export async function fetchSummary(
  request: SummaryRequest
): Promise<FunctionCallResult<SummaryResponse>> {
  return invokeFunction<SummaryResponse>(
    'generate-summary',
    request,
    { timeout: AI_TIMEOUT, retries: 1 }
  );
}

// ═══ USER DATA OPERATIONS ═══

export async function saveSessionToCloud(
  userId: string,
  session: {
    actProfile: unknown;
    diagnosis: unknown;
    dialogue: unknown;
    initialIntensity: number;
    finalIntensity: number;
  }
) {
  const { data, error } = await supabase
    .from('sessions')
    .insert([{
      user_id: userId,
      act_profile: session.actProfile as never,
      diagnosis: session.diagnosis as never,
      dialogue: session.dialogue as never,
      initial_intensity: session.initialIntensity,
      final_intensity: session.finalIntensity,
      completed_at: new Date().toISOString(),
    }])
    .select()
    .single();

  return { data, error };
}

export async function getUserSessions(userId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}
