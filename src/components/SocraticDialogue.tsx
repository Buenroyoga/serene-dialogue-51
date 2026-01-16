// ═══════════════════════════════════════════════════════════
// SOCRATIC DIALOGUE - Enhanced with retention features
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { BreathAnchor } from './BreathAnchor';
import { SomaticBreak } from './SomaticBreak';
import { CrisisModal } from './CrisisModal';
import { SafeExitModal } from './SafeExitModal';
import { ActivationTrafficLight, getActivationLevel } from './ActivationTrafficLight';
import { AutosaveIndicator } from './AutosaveIndicator';
import { DiagnosisData, DialogueEntry } from '@/hooks/useSession';
import { ProfileResult, actProfiles, getRitualPhases, RitualContext, RitualMode } from '@/lib/actData';
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2, Pause, Play, Zap, Target, Heart, LogOut, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchSocraticQuestion } from '@/infra/supabase';
import { detectCrisis, CrisisCheckResult } from '@/domain/crisis';
import { telemetry } from '@/domain/telemetry';
import { toast } from 'sonner';

interface SocraticDialogueProps {
  actProfile: ProfileResult;
  diagnosis: DiagnosisData;
  ritualMode?: RitualMode;
  onAddEntry: (entry: Omit<DialogueEntry, 'timestamp'>) => void;
  onComplete: (finalIntensity: number) => void;
  onBack: () => void;
  onSaveAndExit?: () => void;
}

interface PreviousAnswer {
  phaseId: string;
  question: string;
  answer: string;
  isAiGenerated?: boolean;
}

interface LocalRitualState {
  currentPhaseIndex: number;
  answers: PreviousAnswer[];
  isPaused: boolean;
  pausedAt?: Date;
  isAiMode: boolean;
  aiCircuitBreakerTripped: boolean;
  aiRetryCount: number;
  lastIntensity: number;
  needsSomaticBreak: boolean;
  somaticBreaksTaken: number;
}

const MAX_AI_RETRIES_PER_PHASE = 2;
const INTENSITY_JUMP_THRESHOLD = 2;

const generateSessionId = () => `ritual_${Date.now()}`;

export function SocraticDialogue({ 
  actProfile, 
  diagnosis, 
  ritualMode = 'full',
  onAddEntry, 
  onComplete, 
  onBack,
  onSaveAndExit,
}: SocraticDialogueProps) {
  const sessionId = useMemo(() => generateSessionId(), []);
  const ritualPhases = useMemo(() => getRitualPhases(ritualMode), [ritualMode]);
  
  const [ritualState, setRitualState] = useState<LocalRitualState>({
    currentPhaseIndex: 0,
    answers: [],
    isPaused: false,
    isAiMode: true,
    aiCircuitBreakerTripped: false,
    aiRetryCount: 0,
    lastIntensity: diagnosis.intensity,
    needsSomaticBreak: false,
    somaticBreaksTaken: 0,
  });
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [finalIntensity, setFinalIntensity] = useState(diagnosis.intensity);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [showSomaticBreak, setShowSomaticBreak] = useState(false);
  const [crisisResult, setCrisisResult] = useState<CrisisCheckResult | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [currentIntensityCheck, setCurrentIntensityCheck] = useState(diagnosis.intensity);
  const [showSafeExit, setShowSafeExit] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const profile = actProfiles[actProfile.profile];
  const currentPhase = ritualPhases[ritualState.currentPhaseIndex];
  const isLastPhase = ritualState.currentPhaseIndex === ritualPhases.length - 1;
  const isUsingAi = ritualState.isAiMode && !ritualState.aiCircuitBreakerTripped;
  const activationLevel = getActivationLevel(currentIntensityCheck, currentIntensityCheck - ritualState.lastIntensity);

  const ritualContext: RitualContext = {
    coreBelief: diagnosis.coreBelief,
    profile: actProfile.profile,
    emotions: diagnosis.emotionalHistory,
    triggers: diagnosis.triggers,
    origin: diagnosis.origin,
    intensity: diagnosis.intensity,
    subcategory: diagnosis.subcategory,
    previousAnswers: ritualState.answers.map(a => a.answer)
  };

  const staticQuestion = currentPhase.getQuestion(ritualContext);

  // ═══ AI QUESTION FETCHING WITH CIRCUIT BREAKER ═══
  const fetchAiQuestionSafe = useCallback(async () => {
    if (!isUsingAi || isLastPhase || ritualState.isPaused) {
      setAiQuestion(null);
      return;
    }

    setIsLoadingQuestion(true);
    
    try {
      const result = await fetchSocraticQuestion({
        phaseId: currentPhase.id,
        phaseName: currentPhase.name,
        phaseInstruction: currentPhase.instruction,
        coreBelief: diagnosis.coreBelief,
        profile: actProfile.profile,
        profileName: profile.name,
        emotions: diagnosis.emotionalHistory,
        triggers: diagnosis.triggers,
        origin: diagnosis.origin,
        intensity: diagnosis.intensity,
        previousAnswers: ritualState.answers.map(a => ({
          phaseId: a.phaseId,
          question: a.question,
          answer: a.answer,
        })),
      });

      if (result.error || result.isRateLimited || result.isTimeout) {
        const newRetryCount = ritualState.aiRetryCount + 1;
        
        if (newRetryCount >= MAX_AI_RETRIES_PER_PHASE || result.isRateLimited) {
          // Trip circuit breaker
          setRitualState(prev => ({
            ...prev,
            aiCircuitBreakerTripped: true,
            isAiMode: false,
            aiRetryCount: 0,
          }));
          
          telemetry.track('ai_fallback_used', sessionId, { 
            reason: result.isRateLimited ? 'rate_limit' : 'max_retries',
            phase: currentPhase.id 
          });
          
          toast.info('Usando preguntas estándar para el resto de la sesión', {
            description: 'Esto no afecta la calidad del ritual.',
          });
        } else {
          setRitualState(prev => ({ ...prev, aiRetryCount: newRetryCount }));
        }
        
        setAiQuestion(null);
        return;
      }

      if (result.data?.useStatic) {
        setAiQuestion(null);
        return;
      }

      if (result.data?.question) {
        setAiQuestion(result.data.question);
        setRitualState(prev => ({ ...prev, aiRetryCount: 0 }));
      }
    } catch (err) {
      console.error('Failed to fetch AI question:', err);
      setAiQuestion(null);
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [
    isUsingAi, 
    isLastPhase, 
    ritualState.isPaused, 
    ritualState.answers, 
    ritualState.aiRetryCount,
    currentPhase, 
    diagnosis, 
    actProfile, 
    profile
  ]);

  useEffect(() => {
    fetchAiQuestionSafe();
  }, [ritualState.currentPhaseIndex, fetchAiQuestionSafe]);

  const currentQuestion = aiQuestion || staticQuestion;

  // ═══ CRISIS DETECTION ═══
  const checkCrisisInAnswer = useCallback((text: string, intensity: number) => {
    const result = detectCrisis(text, { intensity });
    
    if (result.isCrisis) {
      setCrisisResult(result);
      setShowCrisisModal(true);
      telemetry.track('crisis_detected', sessionId, { 
        reason: result.reason, 
        phase: currentPhase.id 
      });
      return true;
    }
    return false;
  }, [sessionId, currentPhase.id]);

  // ═══ INTENSITY MONITORING ═══
  const handleIntensityChange = (value: number) => {
    setCurrentIntensityCheck(value);
    
    // Check if intensity jumped significantly
    if (value - ritualState.lastIntensity >= INTENSITY_JUMP_THRESHOLD) {
      setRitualState(prev => ({ ...prev, needsSomaticBreak: true }));
    }
  };

  // ═══ PAUSE/RESUME ═══
  const handlePause = () => {
    setRitualState(prev => ({
      ...prev,
      isPaused: true,
      pausedAt: new Date(),
    }));
    
    telemetry.track('ritual_paused', sessionId, { phase: currentPhase.id });
    toast.info('Ritual pausado', {
      description: 'Tu progreso está guardado. Tómate el tiempo que necesites.',
    });
  };

  const handleResume = () => {
    setRitualState(prev => ({
      ...prev,
      isPaused: false,
      pausedAt: undefined,
    }));
    
    telemetry.track('ritual_resumed', sessionId, { phase: currentPhase.id });
  };

  // ═══ SOMATIC BREAK ═══
  const handleSomaticBreakComplete = () => {
    setShowSomaticBreak(false);
    setRitualState(prev => ({
      ...prev,
      needsSomaticBreak: false,
      somaticBreaksTaken: prev.somaticBreaksTaken + 1,
    }));
    
    telemetry.track('somatic_break_completed', sessionId, { 
      phase: currentPhase.id,
      total: ritualState.somaticBreaksTaken + 1 
    });
  };

  // ═══ NAVIGATION ═══
  const handleNext = async () => {
    if (!currentAnswer.trim() && !isLastPhase) return;

    // Crisis check before proceeding
    if (checkCrisisInAnswer(currentAnswer, isLastPhase ? finalIntensity : currentIntensityCheck)) {
      return;
    }

    // Check if somatic break is needed
    if (ritualState.needsSomaticBreak && !isLastPhase) {
      setShowSomaticBreak(true);
      return;
    }

    onAddEntry({
      phaseId: currentPhase.id,
      phaseName: currentPhase.name,
      question: currentQuestion,
      answer: currentAnswer
    });

    const newAnswer: PreviousAnswer = {
      phaseId: currentPhase.id,
      question: currentQuestion,
      answer: currentAnswer,
      isAiGenerated: !!aiQuestion,
    };

    if (isLastPhase) {
      telemetry.track('ritual_phase_completed', sessionId, { 
        phase: currentPhase.id,
        isLast: true 
      });
      onComplete(finalIntensity);
    } else {
      setRitualState(prev => ({
        ...prev,
        currentPhaseIndex: prev.currentPhaseIndex + 1,
        answers: [...prev.answers, newAnswer],
        lastIntensity: currentIntensityCheck,
      }));
      setCurrentAnswer('');
      setAiQuestion(null);
      
      telemetry.track('ritual_phase_completed', sessionId, { 
        phase: currentPhase.id,
        isLast: false 
      });
    }
  };

  const handlePrev = () => {
    if (ritualState.currentPhaseIndex > 0) {
      const prevAnswers = ritualState.answers.slice(0, -1);
      const prevAnswer = ritualState.answers[ritualState.answers.length - 1];
      
      setRitualState(prev => ({
        ...prev,
        currentPhaseIndex: prev.currentPhaseIndex - 1,
        answers: prevAnswers,
      }));
      setCurrentAnswer(prevAnswer?.answer || '');
      setAiQuestion(null);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    if (ritualState.isPaused) return false;
    if (isLastPhase) return true;
    return currentAnswer.trim().length > 10;
  };

  // ═══ CRISIS MODAL HANDLERS ═══
  const handleCrisisContinue = () => {
    setShowCrisisModal(false);
    setCrisisResult(null);
  };

  const handleCrisisPause = () => {
    setShowCrisisModal(false);
    setCrisisResult(null);
    setShowSomaticBreak(true);
  };

  const handleCrisisExit = () => {
    setShowCrisisModal(false);
    setCrisisResult(null);
    onBack();
  };

  // ═══ RENDER ═══
  return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* Ambient background */}
      <div className="ambient-bg" />

      {/* Somatic Break Overlay */}
      <SomaticBreak 
        isVisible={showSomaticBreak}
        onComplete={handleSomaticBreakComplete}
        onSkip={() => setShowSomaticBreak(false)}
      />

      {/* Crisis Modal */}
      <CrisisModal
        isVisible={showCrisisModal}
        crisisResult={crisisResult || undefined}
        onContinue={handleCrisisContinue}
        onPause={handleCrisisPause}
        onExit={handleCrisisExit}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto p-6 flex flex-col flex-1">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={handlePrev}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {ritualState.currentPhaseIndex === 0 ? 'Volver' : 'Fase anterior'}
            </button>
            
            {/* Pause/Resume Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={ritualState.isPaused ? handleResume : handlePause}
              className={cn(
                "gap-2",
                ritualState.isPaused && "border-primary text-primary"
              )}
            >
              {ritualState.isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  Reanudar
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              )}
            </Button>
          </div>
          
          <div className="text-center">
            <BreathAnchor size="sm" className="mb-4" />
            <h2 className="text-2xl font-bold text-gradient-subtle">Diálogo Socrático</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fase {ritualState.currentPhaseIndex + 1} de {ritualPhases.length}
            </p>
            
            {/* AI Mode Indicator */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {ritualState.aiCircuitBreakerTripped ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  Preguntas estándar
                </span>
              ) : isUsingAi ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
                  <Sparkles className="w-3 h-3" />
                  Preguntas personalizadas
                </span>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* Paused Overlay */}
        <AnimatePresence>
          {ritualState.isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="glass-card max-w-md text-center p-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Pause className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ritual en Pausa</h3>
                <p className="text-muted-foreground mb-6">
                  Tómate el tiempo que necesites. Tu progreso está guardado en la fase {ritualState.currentPhaseIndex + 1}.
                </p>
                <div className="space-y-3">
                  <Button onClick={handleResume} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Reanudar Ritual
                  </Button>
                  <Button variant="ghost" onClick={() => setShowSomaticBreak(true)} className="w-full">
                    Hacer ejercicio de regulación
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6 flex-1">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Phase Progress */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 mb-6 px-4"
            >
              {ritualPhases.map((phase, i) => (
                <div key={phase.id} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    className={cn(
                      "phase-orb w-10 h-10",
                      i < ritualState.currentPhaseIndex && "completed",
                      i === ritualState.currentPhaseIndex && "active",
                    )}
                    animate={i === ritualState.currentPhaseIndex ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className={cn(
                      "text-lg transition-all",
                      i > ritualState.currentPhaseIndex && "grayscale opacity-40"
                    )}>
                      {phase.emoji}
                    </span>
                  </motion.div>
                  <div className="progress-track w-full">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: i < ritualState.currentPhaseIndex ? '100%' : i === ritualState.currentPhaseIndex ? '50%' : '0%' 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Current Phase Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={ritualState.currentPhaseIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col"
              >
                {/* Phase Header */}
                <div className="text-center mb-6">
                  <motion.div 
                    className={cn(
                      "text-6xl mb-4 inline-block",
                      currentPhase.id === 'opuesto' && "animate-spin-slow"
                    )}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {currentPhase.emoji}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {currentPhase.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    {currentPhase.instruction}
                  </p>
                </div>

                {/* Question Card */}
                <motion.div 
                  className="glass-card mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{profile.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs text-primary font-medium">
                          Adaptada a tu perfil {profile.name}
                        </p>
                        {aiQuestion && (
                          <span className="ai-badge">
                            <Sparkles className="w-3 h-3" />
                            IA
                          </span>
                        )}
                      </div>
                      {isLoadingQuestion ? (
                        <div className="flex items-center gap-3 py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-muted-foreground">Generando pregunta personalizada...</span>
                        </div>
                      ) : (
                        <p className="text-lg leading-relaxed text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {currentQuestion}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Answer Area */}
                <div className="flex-1">
                  {isLastPhase ? (
                    <div className="space-y-6">
                      <motion.div 
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h4 className="font-semibold mb-4 text-foreground">
                          Nueva intensidad de la creencia
                        </h4>
                        <p className="text-sm text-muted-foreground mb-6">
                          Antes: <span className="text-primary font-bold text-lg">{diagnosis.intensity}/10</span>
                        </p>
                        <Slider
                          value={[finalIntensity]}
                          onValueChange={([value]) => {
                            setFinalIntensity(value);
                            handleIntensityChange(value);
                          }}
                          min={0}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between mt-6 text-sm text-muted-foreground">
                          <span>0 - Disuelta</span>
                          <motion.span 
                            className="text-3xl font-bold text-gradient"
                            key={finalIntensity}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                          >
                            {finalIntensity}
                          </motion.span>
                          <span>10 - Igual</span>
                        </div>
                        {diagnosis.intensity > finalIntensity && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 rounded-xl text-center"
                            style={{ background: 'linear-gradient(135deg, hsl(35 85% 55% / 0.15), hsl(270 50% 60% / 0.1))' }}
                          >
                            <span className="text-lg">✨</span>
                            <span className="ml-2 text-primary font-medium">
                              Reducción de {diagnosis.intensity - finalIntensity} puntos
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                      <Textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="¿Qué ha cambiado? ¿Dónde sientes más espacio o ligereza?"
                        className="min-h-[120px] bg-card/50 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Responde con honestidad y desde tu experiencia presente..."
                        className="min-h-[180px] text-base bg-card/50 border-border/50 focus:border-primary/50 transition-colors"
                        disabled={isLoadingQuestion || ritualState.isPaused}
                      />
                      
                      {/* Mid-ritual intensity check (every 2 phases) */}
                      {ritualState.currentPhaseIndex > 0 && ritualState.currentPhaseIndex % 2 === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/30"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-primary" />
                            <p className="text-sm font-medium">¿Cómo sientes la intensidad ahora?</p>
                          </div>
                          <Slider
                            value={[currentIntensityCheck]}
                            onValueChange={([value]) => handleIntensityChange(value)}
                            min={0}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>0</span>
                            <span className="font-medium text-primary">{currentIntensityCheck}</span>
                            <span>10</span>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* Answer Guidance */}
                  {!isLastPhase && ritualState.currentPhaseIndex % 2 !== 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/30"
                    >
                      <p className="text-sm text-muted-foreground">
                        <span className="text-primary">💡</span> No busques la respuesta "correcta". Lo importante es observar 
                        qué surge cuando te haces esta pregunta desde la {
                          actProfile.profile === 'A' ? 'mente observadora' :
                          actProfile.profile === 'B' ? 'compasión hacia ti' :
                          actProfile.profile === 'C' ? 'conciencia corporal' : 'perspectiva del narrador'
                        }.
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 space-y-4"
            >
              <Button 
                onClick={handleNext}
                disabled={!canProceed() || isLoadingQuestion}
                className="btn-ritual w-full"
                size="lg"
              >
                {isLastPhase ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Completar Ritual
                  </>
                ) : (
                  <>
                    Siguiente Fase
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {ritualState.currentPhaseIndex > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Puedes volver a fases anteriores si necesitas revisar tus respuestas
                </p>
              )}
            </motion.div>
          </div>

          {/* Context Panel (Desktop) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="glass-card p-4 sticky top-6 space-y-4">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Contexto de la Sesión
              </h4>
              
              {/* Core Belief */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Creencia
                </p>
                <p className="text-sm text-foreground italic">
                  "{diagnosis.coreBelief}"
                </p>
              </div>
              
              {/* Primary Emotion */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Emoción principal
                </p>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-sm">{diagnosis.emotionalHistory[0] || 'No especificada'}</span>
                </div>
              </div>
              
              {/* Profile */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Perfil ACT
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{profile.emoji}</span>
                  <span className="text-sm">{profile.name}</span>
                </div>
              </div>
              
              {/* Current Phase */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Fase actual
                </p>
                <p className="text-sm text-primary font-medium">
                  {currentPhase.name}
                </p>
              </div>
              
              {/* Intensity Tracker */}
              <div className="p-3 rounded-xl bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Intensidad</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-muted-foreground">{diagnosis.intensity}</p>
                    <p className="text-xs text-muted-foreground">Inicial</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{currentIntensityCheck}</p>
                    <p className="text-xs text-muted-foreground">Actual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
