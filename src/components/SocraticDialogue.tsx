import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { BreathAnchor } from './BreathAnchor';
import { DiagnosisData, DialogueEntry } from '@/hooks/useSession';
import { ProfileResult, actProfiles, socraticRitual, RitualContext } from '@/lib/actData';
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SocraticDialogueProps {
  actProfile: ProfileResult;
  diagnosis: DiagnosisData;
  onAddEntry: (entry: Omit<DialogueEntry, 'timestamp'>) => void;
  onComplete: (finalIntensity: number) => void;
  onBack: () => void;
}

interface PreviousAnswer {
  phaseId: string;
  question: string;
  answer: string;
}

export function SocraticDialogue({ 
  actProfile, 
  diagnosis, 
  onAddEntry, 
  onComplete, 
  onBack 
}: SocraticDialogueProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<PreviousAnswer[]>([]);
  const [finalIntensity, setFinalIntensity] = useState(diagnosis.intensity);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isAiEnabled] = useState(true);

  const profile = actProfiles[actProfile.profile];
  const currentPhase = socraticRitual[currentPhaseIndex];
  const isLastPhase = currentPhaseIndex === socraticRitual.length - 1;

  const ritualContext: RitualContext = {
    coreBelief: diagnosis.coreBelief,
    profile: actProfile.profile,
    emotions: diagnosis.emotionalHistory,
    triggers: diagnosis.triggers,
    origin: diagnosis.origin,
    intensity: diagnosis.intensity,
    subcategory: diagnosis.subcategory,
    previousAnswers: answers.map(a => a.answer)
  };

  const staticQuestion = currentPhase.getQuestion(ritualContext);

  useEffect(() => {
    if (!isAiEnabled || isLastPhase) {
      setAiQuestion(null);
      return;
    }

    const fetchAiQuestion = async () => {
      setIsLoadingQuestion(true);
      try {
        const { data, error } = await supabase.functions.invoke('socratic-question', {
          body: {
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
            previousAnswers: answers
          }
        });

        if (error) {
          console.error('Error fetching AI question:', error);
          setAiQuestion(null);
          return;
        }

        if (data?.useStatic) {
          console.log('Using static question due to:', data.error);
          setAiQuestion(null);
          if (data.error?.includes('Rate limit')) {
            toast.error('Límite de uso alcanzado. Usando preguntas estáticas.');
          }
          return;
        }

        if (data?.question) {
          setAiQuestion(data.question);
        }
      } catch (err) {
        console.error('Failed to fetch AI question:', err);
        setAiQuestion(null);
      } finally {
        setIsLoadingQuestion(false);
      }
    };

    fetchAiQuestion();
  }, [currentPhaseIndex, isAiEnabled]);

  const currentQuestion = aiQuestion || staticQuestion;

  const handleNext = async () => {
    if (!currentAnswer.trim() && !isLastPhase) return;

    onAddEntry({
      phaseId: currentPhase.id,
      phaseName: currentPhase.name,
      question: currentQuestion,
      answer: currentAnswer
    });

    const newAnswers = [...answers, {
      phaseId: currentPhase.id,
      question: currentQuestion,
      answer: currentAnswer
    }];
    setAnswers(newAnswers);

    if (isLastPhase) {
      onComplete(finalIntensity);
    } else {
      setCurrentPhaseIndex(prev => prev + 1);
      setCurrentAnswer('');
      setAiQuestion(null);
    }
  };

  const handlePrev = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhaseIndex(prev => prev - 1);
      const prevAnswer = answers[currentPhaseIndex - 1];
      setCurrentAnswer(prevAnswer?.answer || '');
      setAnswers(prev => prev.slice(0, -1));
      setAiQuestion(null);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    if (isLastPhase) return true;
    return currentAnswer.trim().length > 10;
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* Ambient background */}
      <div className="ambient-bg" />

      <div className="relative z-10 w-full max-w-2xl mx-auto p-6 flex flex-col flex-1">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button 
            onClick={handlePrev}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {currentPhaseIndex === 0 ? 'Volver' : 'Fase anterior'}
          </button>
          
          <div className="text-center">
            <BreathAnchor size="sm" className="mb-4" />
            <h2 className="text-2xl font-bold text-gradient-subtle">Diálogo Socrático</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fase {currentPhaseIndex + 1} de {socraticRitual.length}
            </p>
          </div>
        </motion.div>

        {/* Phase Progress */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-8 px-4"
        >
          {socraticRitual.map((phase, i) => (
            <div key={phase.id} className="flex-1 flex flex-col items-center gap-2">
              <motion.div 
                className={cn(
                  "phase-orb w-10 h-10",
                  i < currentPhaseIndex && "completed",
                  i === currentPhaseIndex && "active",
                )}
                animate={i === currentPhaseIndex ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className={cn(
                  "text-lg transition-all",
                  i > currentPhaseIndex && "grayscale opacity-40"
                )}>
                  {phase.emoji}
                </span>
              </motion.div>
              <div className="progress-track w-full">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: i < currentPhaseIndex ? '100%' : i === currentPhaseIndex ? '50%' : '0%' 
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
            key={currentPhaseIndex}
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
                      onValueChange={([value]) => setFinalIntensity(value)}
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
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Responde con honestidad y desde tu experiencia presente..."
                  className="min-h-[180px] text-base bg-card/50 border-border/50 focus:border-primary/50 transition-colors"
                  disabled={isLoadingQuestion}
                />
              )}

              {/* Answer Guidance */}
              {!isLastPhase && (
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
          className="mt-8 space-y-4"
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

          {currentPhaseIndex > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Puedes volver a fases anteriores si necesitas revisar tus respuestas
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}