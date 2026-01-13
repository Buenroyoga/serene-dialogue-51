import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BreathAnchor } from './BreathAnchor';
import { DiagnosisData, DialogueEntry } from '@/hooks/useSession';
import { ProfileResult } from '@/lib/actData';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { t } from '@/lib/i18n';

interface DialoguePhase {
  id: string;
  name: string;
  prompt: string;
}

interface DialogueViewProps {
  actProfile: ProfileResult;
  diagnosis: DiagnosisData;
  dialogue: DialogueEntry[];
  onAddEntry: (entry: Omit<DialogueEntry, 'timestamp'>) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function DialogueView({
  actProfile,
  diagnosis,
  dialogue,
  onAddEntry,
  onComplete,
  onBack
}: DialogueViewProps) {
  const [answer, setAnswer] = useState('');

  const phases: DialoguePhase[] = useMemo(() => ([
    {
      id: 'observe',
      name: 'Observación',
      prompt: t('dialogue.phase.observe', {
        belief: diagnosis.coreBelief,
        focus: actProfile.profile === 'A' ? 'mente' : actProfile.profile === 'B' ? 'corazón' : actProfile.profile === 'C' ? 'cuerpo' : 'historia'
      })
    },
    {
      id: 'evidence',
      name: 'Evidencias',
      prompt: t('dialogue.phase.evidence')
    },
    {
      id: 'impact',
      name: 'Impacto',
      prompt: t('dialogue.phase.impact')
    },
    {
      id: 'values',
      name: 'Valores',
      prompt: t('dialogue.phase.values')
    },
    {
      id: 'reframe',
      name: 'Reencuadre',
      prompt: t('dialogue.phase.reframe')
    },
    {
      id: 'commitment',
      name: 'Compromiso',
      prompt: t('dialogue.phase.commitment')
    }
  ]), [actProfile.profile, diagnosis.coreBelief]);

  const currentPhaseIndex = dialogue.length;
  const currentPhase = phases[currentPhaseIndex];
  const isComplete = currentPhaseIndex >= phases.length;

  const handleSubmit = () => {
    if (!currentPhase) {
      return;
    }

    const trimmed = answer.trim();
    if (!trimmed) {
      return;
    }

    onAddEntry({
      phaseId: currentPhase.id,
      phaseName: currentPhase.name,
      question: currentPhase.prompt,
      answer: trimmed
    });
    setAnswer('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 min-h-screen flex flex-col">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('dialogue.back')}
        </button>
        <div className="text-center">
          <BreathAnchor />
          <h2 className="text-xl font-bold mt-4 mb-2">{t('dialogue.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('dialogue.phaseCounter', {
              current: Math.min(currentPhaseIndex + 1, phases.length),
              total: phases.length
            })}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {phases.map((phase, i) => (
          <div
            key={phase.id}
            className={`flex-1 h-1 rounded-full transition-all ${
              i < currentPhaseIndex ? 'bg-primary' :
              i === currentPhaseIndex ? 'bg-primary/60' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {isComplete ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center contemplative-card">
          <div className="text-5xl mb-4">🌙</div>
          <h3 className="text-2xl font-semibold mb-2">{t('dialogue.completeTitle')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('dialogue.completeBody')}
          </p>
          <Button onClick={onComplete} size="lg" className="px-8">
            {t('dialogue.completeCta')}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-6">
            <div className="contemplative-card">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">{currentPhase.name}</h3>
              </div>
              <p className="text-muted-foreground">{currentPhase.prompt}</p>
            </div>

            {dialogue.length > 0 && (
              <div className="contemplative-card space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  {t('dialogue.previousAnswers')}
                </h4>
                <div className="space-y-3">
                  {dialogue.map(entry => (
                    <div key={entry.phaseId} className="rounded-lg bg-muted/40 p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        {entry.phaseName}
                      </p>
                      <p className="text-sm text-foreground">{entry.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="contemplative-card">
              <Textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={t('dialogue.answerPlaceholder')}
                className="min-h-[140px]"
                aria-label="Respuesta del diálogo"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {t('dialogue.answerHint')}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Button onClick={handleSubmit} disabled={!answer.trim()} className="w-full py-6 text-lg" size="lg">
              {t('dialogue.saveAndContinue')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
