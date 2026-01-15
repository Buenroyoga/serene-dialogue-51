import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { actProfileQuestions, calculateProfile, ProfileResult } from '@/lib/actData';
import { ProgressIndicator } from './ProgressIndicator';
import { LikertScale } from './LikertScale';
import { ProfileResultDisplay } from './ProfileResult';
import { Button } from '@/components/ui/button';
import { BreathAnchor } from './BreathAnchor';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface ACTProfileTestProps {
  onComplete: (result: ProfileResult) => void;
  onBack: () => void;
}

const categoryInfo = {
  A: { name: 'Cognitivo', emoji: '🧠', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30' },
  B: { name: 'Emocional', emoji: '❤️', color: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30' },
  C: { name: 'Somático', emoji: '💪', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
  D: { name: 'Narrativo', emoji: '📖', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' }
};

export function ACTProfileTest({ onComplete, onBack }: ACTProfileTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [direction, setDirection] = useState(1);

  const currentQuestion = actProfileQuestions[currentIndex];
  const category = categoryInfo[currentQuestion.category as keyof typeof categoryInfo];

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    setDirection(1);
    setTimeout(() => {
      if (currentIndex < actProfileQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        const profileResult = calculateProfile({ ...answers, [currentQuestion.id]: value });
        setResult(profileResult);
      }
    }, 400);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleContinue = () => {
    if (result) {
      onComplete(result);
    }
  };

  if (result) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl mx-auto p-6"
      >
        <ProfileResultDisplay result={result} onContinue={handleContinue} />
      </motion.div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 min-h-screen flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver
        </button>
        <div className="text-center">
          <BreathAnchor />
          <h2 className="text-2xl font-bold mt-4 mb-2 tracking-tight">Test de Perfil ACT</h2>
          <p className="text-sm text-muted-foreground">Responde con honestidad contemplativa</p>
        </div>
      </motion.div>

      {/* Progress */}
      <ProgressIndicator 
        current={currentIndex + 1} 
        total={actProfileQuestions.length} 
        className="mb-8"
      />

      {/* Question Card */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Category Badge */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <div className={`glass-card px-4 py-2 rounded-full flex items-center gap-2 ${category.border} border`}>
                <span className="text-2xl">{category.emoji}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {category.name}
                </span>
              </div>
            </motion.div>

            {/* Question */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className={`glass-card p-8 rounded-3xl mb-8 bg-gradient-to-br ${category.color} border ${category.border}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background/50 flex items-center justify-center text-lg font-bold text-primary">
                  {currentIndex + 1}
                </div>
                <p className="text-lg leading-relaxed font-medium pt-1.5">
                  {currentQuestion.text}
                </p>
              </div>
            </motion.div>

            {/* Likert Scale */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <LikertScale 
                value={answers[currentQuestion.id] || null}
                onChange={handleAnswer}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex justify-between items-center"
      >
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        
        {/* Mini progress dots */}
        <div className="flex gap-1 flex-wrap justify-center max-w-xs">
          {actProfileQuestions.map((q, i) => {
            const qCategory = categoryInfo[q.category as keyof typeof categoryInfo];
            return (
              <motion.div 
                key={i}
                initial={false}
                animate={{
                  scale: i === currentIndex ? 1.5 : 1,
                  opacity: answers[q.id] ? 1 : 0.3
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex 
                    ? 'bg-primary' 
                    : answers[q.id] 
                      ? 'bg-primary/60' 
                      : 'bg-muted'
                }`}
              />
            );
          })}
        </div>

        {/* Completion indicator */}
        <div className="w-24 text-right">
          {Object.keys(answers).length === actProfileQuestions.length - 1 && !answers[currentQuestion.id] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 text-xs text-primary font-medium"
            >
              <Sparkles className="w-3 h-3" />
              ¡Última!
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
