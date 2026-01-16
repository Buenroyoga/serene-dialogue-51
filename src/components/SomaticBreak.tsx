// ═══════════════════════════════════════════════════════════
// SOMATIC BREAK - Micro-regulation exercise
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, SkipForward } from 'lucide-react';

interface SomaticBreakProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

type BreakPhase = 'intro' | 'breathing' | 'grounding' | 'complete';

export function SomaticBreak({ isVisible, onComplete, onSkip }: SomaticBreakProps) {
  const [phase, setPhase] = useState<BreakPhase>('intro');
  const [breathCount, setBreathCount] = useState(0);
  const [groundingStep, setGroundingStep] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);

  const groundingSteps = [
    { count: 5, sense: 'VER', instruction: '5 cosas que puedes ver ahora mismo', emoji: '👁️' },
    { count: 4, sense: 'TOCAR', instruction: '4 cosas que puedes tocar o sentir', emoji: '✋' },
    { count: 3, sense: 'OÍR', instruction: '3 cosas que puedes oír', emoji: '👂' },
    { count: 2, sense: 'OLER', instruction: '2 cosas que puedes oler', emoji: '👃' },
    { count: 1, sense: 'SABOREAR', instruction: '1 cosa que puedes saborear', emoji: '👅' },
  ];

  const startBreathing = useCallback(() => {
    setPhase('breathing');
    setIsBreathing(true);
    setBreathCount(0);
  }, []);

  // Breathing cycle
  useEffect(() => {
    if (phase !== 'breathing' || !isBreathing) return;

    const cycle = () => {
      setBreathCount(prev => {
        if (prev >= 3) {
          setIsBreathing(false);
          setPhase('grounding');
          return prev;
        }
        return prev + 1;
      });
    };

    // 4s inhale + 4s hold + 6s exhale = 14s per cycle
    const timer = setTimeout(cycle, 14000);
    return () => clearTimeout(timer);
  }, [phase, isBreathing, breathCount]);

  const advanceGrounding = useCallback(() => {
    if (groundingStep < groundingSteps.length - 1) {
      setGroundingStep(prev => prev + 1);
    } else {
      setPhase('complete');
    }
  }, [groundingStep]);

  const handleComplete = useCallback(() => {
    setPhase('intro');
    setBreathCount(0);
    setGroundingStep(0);
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setPhase('intro');
    setBreathCount(0);
    setGroundingStep(0);
    onSkip();
  }, [onSkip]);

  const currentGrounding = groundingSteps[groundingStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card max-w-md w-full p-8 text-center"
          >
            <AnimatePresence mode="wait">
              {/* INTRO */}
              {phase === 'intro' && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-6"
                  >
                    🌬️
                  </motion.div>
                  
                  <h2 className="text-xl font-semibold mb-4 text-gradient-subtle">
                    Momento de Regulación
                  </h2>
                  
                  <p className="text-muted-foreground mb-6">
                    He notado que la intensidad ha subido. Hagamos una breve pausa 
                    para ayudar a tu sistema nervioso a regularse.
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-6">
                    Solo tomará unos 30-60 segundos.
                  </p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={startBreathing}
                      className="btn-ritual w-full"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Comenzar
                    </Button>
                    
                    <Button
                      onClick={handleSkip}
                      variant="ghost"
                      className="w-full text-muted-foreground"
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Saltar
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* BREATHING */}
              {phase === 'breathing' && (
                <motion.div
                  key="breathing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    Respiración {breathCount + 1} de 3
                  </p>
                  
                  <motion.div
                    className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6"
                    animate={{
                      scale: [1, 1.3, 1.3, 1],
                    }}
                    transition={{
                      duration: 14,
                      times: [0, 0.29, 0.57, 1],
                      repeat: Infinity,
                    }}
                  >
                    <motion.span
                      className="text-4xl"
                      animate={{
                        opacity: [0.5, 1, 1, 0.5],
                      }}
                      transition={{
                        duration: 14,
                        times: [0, 0.29, 0.57, 1],
                        repeat: Infinity,
                      }}
                    >
                      🌬️
                    </motion.span>
                  </motion.div>
                  
                  <motion.p
                    className="text-lg font-medium text-foreground"
                    animate={{
                      opacity: [0.7, 1, 0.8, 0.7],
                    }}
                    transition={{
                      duration: 14,
                      times: [0, 0.29, 0.57, 1],
                      repeat: Infinity,
                    }}
                  >
                    <motion.span
                      key="breath-text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Inhala... Sostén... Exhala lentamente...
                    </motion.span>
                  </motion.p>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    4 segundos dentro • 4 segundos sostener • 6 segundos fuera
                  </p>
                </motion.div>
              )}

              {/* GROUNDING */}
              {phase === 'grounding' && currentGrounding && (
                <motion.div
                  key="grounding"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <p className="text-sm text-muted-foreground mb-2">
                    Técnica 5-4-3-2-1
                  </p>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    {groundingSteps.map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i <= groundingStep ? 'bg-primary' : 'bg-muted'
                        }`}
                        animate={i === groundingStep ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.5 }}
                      />
                    ))}
                  </div>
                  
                  <motion.div
                    key={groundingStep}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-6xl mb-4"
                  >
                    {currentGrounding.emoji}
                  </motion.div>
                  
                  <h3 className="text-3xl font-bold text-primary mb-2">
                    {currentGrounding.count} cosas para {currentGrounding.sense}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">
                    {currentGrounding.instruction}
                  </p>
                  
                  <Button
                    onClick={advanceGrounding}
                    className="btn-ritual"
                    size="lg"
                  >
                    {groundingStep < groundingSteps.length - 1 ? 'Siguiente' : 'Completar'}
                  </Button>
                </motion.div>
              )}

              {/* COMPLETE */}
              {phase === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1 }}
                    className="text-6xl mb-6"
                  >
                    ✨
                  </motion.div>
                  
                  <h2 className="text-xl font-semibold mb-4 text-gradient-subtle">
                    Bien hecho
                  </h2>
                  
                  <p className="text-muted-foreground mb-6">
                    Has dado un regalo a tu sistema nervioso. 
                    Tómate un momento para notar cómo te sientes ahora.
                  </p>
                  
                  <Button
                    onClick={handleComplete}
                    className="btn-ritual w-full"
                    size="lg"
                  >
                    Continuar con el ritual
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
