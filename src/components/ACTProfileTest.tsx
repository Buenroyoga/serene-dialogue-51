import { useState } from 'react';
import { actProfileQuestions, calculateProfile, ProfileResult } from '@/lib/actData';
import { ProgressIndicator } from './ProgressIndicator';
import { LikertScale } from './LikertScale';
import { ProfileResultDisplay } from './ProfileResult';
import { Button } from '@/components/ui/button';
import { BreathAnchor } from './BreathAnchor';
import { ArrowLeft } from 'lucide-react';

interface ACTProfileTestProps {
  onComplete: (result: ProfileResult) => void;
  onBack: () => void;
}

export function ACTProfileTest({ onComplete, onBack }: ACTProfileTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = actProfileQuestions[currentIndex];
  const isComplete = currentIndex >= actProfileQuestions.length;

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentIndex < actProfileQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        const profileResult = calculateProfile({ ...answers, [currentQuestion.id]: value });
        setResult(profileResult);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleContinue = () => {
    if (result) {
      onComplete(result);
    }
  };

  if (result) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <ProfileResultDisplay result={result} onContinue={handleContinue} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="text-center">
          <BreathAnchor />
          <h2 className="text-xl font-bold mt-4 mb-2">Test de Perfil ACT</h2>
          <p className="text-sm text-muted-foreground">Responde con honestidad contemplativa</p>
        </div>
      </div>

      {/* Progress */}
      <ProgressIndicator 
        current={currentIndex + 1} 
        total={actProfileQuestions.length} 
        className="mb-8"
      />

      {/* Question */}
      <div className={`flex-1 flex flex-col justify-center transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
        <div className="contemplative-card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">
              {currentQuestion.category === 'A' && '🧠'}
              {currentQuestion.category === 'B' && '❤️'}
              {currentQuestion.category === 'C' && '💪'}
              {currentQuestion.category === 'D' && '📖'}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {currentQuestion.category === 'A' && 'Cognitivo'}
              {currentQuestion.category === 'B' && 'Emocional'}
              {currentQuestion.category === 'C' && 'Somático'}
              {currentQuestion.category === 'D' && 'Narrativo'}
            </span>
          </div>
          <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
        </div>

        <LikertScale 
          value={answers[currentQuestion.id] || null}
          onChange={handleAnswer}
        />
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
        >
          ← Anterior
        </Button>
        <div className="flex gap-1">
          {actProfileQuestions.map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex 
                  ? 'bg-primary w-4' 
                  : answers[actProfileQuestions[i].id] 
                    ? 'bg-primary/60' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <div className="w-20" /> {/* Spacer for alignment */}
      </div>
    </div>
  );
}
