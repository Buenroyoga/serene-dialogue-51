import { useState, useEffect } from 'react';
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);

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

  // Static fallback question
  const staticQuestion = currentPhase.getQuestion(ritualContext);

  // Fetch AI question when phase changes
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

    setIsTransitioning(true);

    // Save the entry
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
      // Complete the ritual
      onComplete(finalIntensity);
    } else {
      // Move to next phase with animation
      setTimeout(() => {
        setCurrentPhaseIndex(prev => prev + 1);
        setCurrentAnswer('');
        setAiQuestion(null);
        setIsTransitioning(false);
      }, 300);
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
    <div className="w-full max-w-2xl mx-auto p-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={handlePrev}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentPhaseIndex === 0 ? 'Volver' : 'Fase anterior'}
        </button>
        <div className="text-center">
          <BreathAnchor />
          <h2 className="text-xl font-bold mt-4 mb-1">Diálogo Socrático</h2>
          <p className="text-sm text-muted-foreground">
            Fase {currentPhaseIndex + 1} de {socraticRitual.length}
          </p>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="flex gap-1 mb-6 px-2">
        {socraticRitual.map((phase, i) => (
          <div 
            key={phase.id}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-300",
                i < currentPhaseIndex && "opacity-60 grayscale-0",
                i === currentPhaseIndex && "scale-110 animate-pulse-slow",
                i > currentPhaseIndex && "opacity-30 grayscale"
              )}
            >
              {phase.emoji}
            </div>
            <div 
              className={cn(
                "h-1 w-full rounded-full transition-all duration-500",
                i < currentPhaseIndex && "bg-primary",
                i === currentPhaseIndex && "bg-primary/60",
                i > currentPhaseIndex && "bg-muted"
              )}
            />
          </div>
        ))}
      </div>

      {/* Current Phase Card */}
      <div 
        className={cn(
          "flex-1 transition-all duration-300",
          isTransitioning && "opacity-0 translate-x-8"
        )}
      >
        {/* Phase Header */}
        <div className="text-center mb-6">
          <div 
            className={cn(
              "text-6xl mb-4",
              currentPhase.id === 'opuesto' && "animate-spin-slow"
            )}
          >
            {currentPhase.emoji}
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {currentPhase.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {currentPhase.instruction}
          </p>
        </div>

        {/* Question Card */}
        <div className="contemplative-card mb-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">{profile.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-primary">
                  Pregunta adaptada a tu perfil {profile.name}
                </p>
                {aiQuestion && (
                  <span className="flex items-center gap-1 text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    IA
                  </span>
                )}
              </div>
              {isLoadingQuestion ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Generando pregunta personalizada...</span>
                </div>
              ) : (
                <p className="text-lg leading-relaxed text-foreground">
                  {currentQuestion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Answer Area */}
        {isLastPhase ? (
          <div className="space-y-6">
            <div className="contemplative-card">
              <h4 className="font-semibold mb-4 text-foreground">
                Nueva intensidad de la creencia
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Antes: <span className="text-primary font-bold">{diagnosis.intensity}/10</span>
              </p>
              <Slider
                value={[finalIntensity]}
                onValueChange={([value]) => setFinalIntensity(value)}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                <span>0 - Disuelta</span>
                <span className="text-2xl font-bold text-primary">{finalIntensity}</span>
                <span>10 - Igual</span>
              </div>
              {diagnosis.intensity > finalIntensity && (
                <div className="mt-4 p-3 rounded-lg bg-primary/10 text-primary text-center">
                  ✨ Reducción de {diagnosis.intensity - finalIntensity} puntos
                </div>
              )}
            </div>
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="¿Qué ha cambiado? ¿Dónde sientes más espacio o ligereza?"
              className="min-h-[100px]"
            />
          </div>
        ) : (
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Responde con honestidad y desde tu experiencia presente..."
            className="min-h-[150px] text-base"
            disabled={isLoadingQuestion}
          />
        )}

        {/* Answer Guidance */}
        {!isLastPhase && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">
              💡 Tip: No busques la respuesta "correcta". Lo importante es observar 
              qué surge cuando te haces esta pregunta desde la {
                actProfile.profile === 'A' ? 'mente observadora' :
                actProfile.profile === 'B' ? 'compasión hacia ti' :
                actProfile.profile === 'C' ? 'conciencia corporal' : 'perspectiva del narrador'
              }.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 space-y-3">
        <Button 
          onClick={handleNext}
          disabled={!canProceed() || isLoadingQuestion}
          className="w-full py-6 text-lg"
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
      </div>
    </div>
  );
}