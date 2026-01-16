// ═══════════════════════════════════════════════════════════
// RITUAL COMPLETE - Premium Closure with PDF Export
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DiagnosisData, DialogueEntry, ProfileResult } from '@/domain/types';
import { actProfiles } from '@/lib/actData';
import { Home, RotateCcw, X } from 'lucide-react';
import { ExerciseLibrary } from './ExerciseLibrary';
import { getExercisesForProfile } from '@/lib/actExercises';
import { supabase } from '@/integrations/supabase/client';
import { telemetry } from '@/domain/telemetry';
import { toast } from 'sonner';
import {
  SummaryCard,
  TransformationMetrics,
  ExerciseRecommendations,
  DocumentExport,
  CommitmentInput,
  PremiumSummary,
  TransformationResult
} from './ritual-complete';

interface RitualCompleteProps {
  actProfile: ProfileResult;
  diagnosis: DiagnosisData;
  dialogueEntries: DialogueEntry[];
  finalIntensity: number;
  onHome: () => void;
  onNewRitual: () => void;
}

export function RitualComplete({
  actProfile,
  diagnosis,
  dialogueEntries,
  finalIntensity,
  onHome,
  onNewRitual
}: RitualCompleteProps) {
  const [showExercises, setShowExercises] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const [premiumSummary, setPremiumSummary] = useState<PremiumSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [commitment, setCommitment] = useState('');
  const [showCommitmentInput, setShowCommitmentInput] = useState(false);
  
  const profile = actProfiles[actProfile.profile];
  const intensityDrop = diagnosis.intensity - finalIntensity;
  const percentDrop = Math.round((intensityDrop / diagnosis.intensity) * 100);
  const recommendedExercises = getExercisesForProfile(actProfile.profile).slice(0, 3);

  const getTransformationMessage = (): TransformationResult => {
    if (percentDrop >= 70) {
      return {
        emoji: '🌟',
        title: 'Transformación Profunda',
        message: 'Has logrado una liberación significativa. El espacio interior que has creado es invaluable.'
      };
    } else if (percentDrop >= 40) {
      return {
        emoji: '✨',
        title: 'Cambio Notable',
        message: 'La creencia ha perdido fuerza. Cada paso hacia la consciencia cuenta.'
      };
    } else if (percentDrop > 0) {
      return {
        emoji: '🌱',
        title: 'Semilla de Cambio',
        message: 'Has comenzado el proceso. Las transformaciones profundas necesitan tiempo.'
      };
    } else {
      return {
        emoji: '💎',
        title: 'Proceso en Curso',
        message: 'La consciencia que has traído es el primer paso. Este trabajo requiere paciencia.'
      };
    }
  };

  const transformation = getTransformationMessage();

  // Extract key findings from dialogue entries
  const extractFindings = (): string[] => {
    const findings: string[] = [];
    
    dialogueEntries.forEach(entry => {
      if (entry.phaseId === 'evidencia' && entry.answer.length > 20) {
        findings.push(`Al examinar las evidencias, descubriste: "${entry.answer.slice(0, 100)}..."`);
      }
      if (entry.phaseId === 'opuesto' && entry.answer.length > 20) {
        findings.push(`Explorando perspectivas alternativas: "${entry.answer.slice(0, 100)}..."`);
      }
      if (entry.phaseId === 'consecuencias' && entry.answer.length > 20) {
        findings.push(`Sobre las consecuencias de esta creencia: "${entry.answer.slice(0, 100)}..."`);
      }
    });
    
    return findings.slice(0, 3);
  };

  // Detect underlying value from emotions and context
  const detectUnderlyingValue = (): string => {
    const emotions = diagnosis.emotionalHistory.map(e => e.toLowerCase());
    
    if (emotions.some(e => ['miedo', 'ansiedad', 'preocupación'].includes(e))) {
      return 'Seguridad y protección';
    }
    if (emotions.some(e => ['tristeza', 'soledad', 'vacío'].includes(e))) {
      return 'Conexión y pertenencia';
    }
    if (emotions.some(e => ['vergüenza', 'culpa', 'inadecuación'].includes(e))) {
      return 'Aceptación y valor propio';
    }
    if (emotions.some(e => ['frustración', 'impotencia', 'rabia'].includes(e))) {
      return 'Autonomía y control';
    }
    
    return 'Bienestar y paz interior';
  };

  const generatePrintableDocument = (
    findings: string[], 
    ifThenPlan: { trigger: string; response: string }[],
    userCommitment: string
  ): string => {
    const date = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
# Documento de Transformación Personal

**Fecha:** ${date}
**Perfil ACT:** ${profile.emoji} ${profile.name}

---

## La Creencia Trabajada

> "${diagnosis.coreBelief}"

**Intensidad inicial:** ${diagnosis.intensity}/10
**Intensidad final:** ${finalIntensity}/10
**Reducción lograda:** ${intensityDrop} puntos (${percentDrop}%)

---

## Contexto Emocional

**Emociones asociadas:** ${diagnosis.emotionalHistory.join(', ') || 'No especificadas'}
**Disparadores identificados:** ${diagnosis.triggers.join(', ') || 'No especificados'}
**Origen de la creencia:** ${diagnosis.origin || 'No especificado'}

---

## Hallazgos Clave

${findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

---

## Valor Subyacente

Lo que realmente te importa debajo de esta lucha: **${detectUnderlyingValue()}**

---

## Plan Si-Entonces (Prevención de Recaídas)

${ifThenPlan.map(p => `- **${p.trigger}** → ${p.response}`).join('\n')}

---

## Tu Compromiso 24-48h

${userCommitment || 'Aún no has definido un compromiso específico.'}

---

## Ejercicios Recomendados

${recommendedExercises.map(ex => `### ${ex.emoji} ${ex.name}\n*${ex.duration}*\n\n${ex.description}\n\n**Pasos:**\n${ex.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`).join('\n\n')}

---

## Tu Práctica ACT Diaria

${profile.actMicro}

---

## Diálogo Socrático Completo

${dialogueEntries.map(entry => `### ${entry.phaseName}\n\n**Pregunta:** ${entry.question}\n\n**Tu respuesta:** ${entry.answer}`).join('\n\n---\n\n')}

---

*Generado por Diálogo Socrático Interior*
*Este documento es para tu reflexión personal*
    `.trim();
  };

  // Generate textual summary (no AI)
  const generateTextualSummary = (): PremiumSummary => {
    const findings = extractFindings();
    
    const ifThenPlan = diagnosis.triggers.slice(0, 3).map(trigger => ({
      trigger: `Cuando ${trigger.toLowerCase()}`,
      response: profile.actMicro
    }));

    const fullDocument = generatePrintableDocument(findings, ifThenPlan, commitment);

    return {
      findings: findings.length > 0 ? findings : [
        'Exploraste la creencia desde múltiples perspectivas',
        'Identificaste el impacto emocional de este patrón',
        'Encontraste espacio para una relación diferente con el pensamiento'
      ],
      underlyingValue: detectUnderlyingValue(),
      ifThenPlan,
      exercises: recommendedExercises,
      commitment,
      fullDocument
    };
  };

  const generateSummary = async (mode: 'textual' | 'ai') => {
    if (mode === 'textual') {
      const summary = generateTextualSummary();
      setPremiumSummary(summary);
      setShowDocument(true);
      telemetry.track('summary_generated', 'ritual', { mode: 'textual' });
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          coreBelief: diagnosis.coreBelief,
          profile: actProfile.profile,
          profileName: profile.name,
          emotions: diagnosis.emotionalHistory,
          triggers: diagnosis.triggers,
          origin: diagnosis.origin,
          initialIntensity: diagnosis.intensity,
          finalIntensity,
          dialogueEntries,
          actMicro: profile.actMicro,
          commitment,
          mode: 'premium'
        }
      });

      if (error) {
        console.error('Error generating summary:', error);
        toast.error('Error al generar. Usando modo textual.');
        const summary = generateTextualSummary();
        setPremiumSummary(summary);
        setShowDocument(true);
        return;
      }

      if (data) {
        const findings = extractFindings();
        setPremiumSummary({
          findings: data.findings || findings,
          underlyingValue: data.underlyingValue || detectUnderlyingValue(),
          ifThenPlan: data.ifThenPlan || diagnosis.triggers.slice(0, 3).map(t => ({
            trigger: `Cuando ${t.toLowerCase()}`,
            response: profile.actMicro
          })),
          exercises: recommendedExercises,
          commitment,
          fullDocument: data.fullDocument || generatePrintableDocument(
            data.findings || [], 
            data.ifThenPlan || [], 
            commitment
          )
        });
        setShowDocument(true);
        telemetry.track('summary_generated', 'ritual', { mode: 'ai' });
        toast.success('Documento premium generado');
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
      toast.error('Error al generar. Usando modo textual.');
      const summary = generateTextualSummary();
      setPremiumSummary(summary);
      setShowDocument(true);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const findings = extractFindings();
  const underlyingValue = detectUnderlyingValue();

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      <div className="ambient-bg" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-2xl mx-auto p-6 flex flex-col flex-1"
      >
        <TransformationMetrics
          transformation={transformation}
          initialIntensity={diagnosis.intensity}
          finalIntensity={finalIntensity}
          intensityDrop={intensityDrop}
          percentDrop={percentDrop}
        />

        <SummaryCard
          findings={findings}
          underlyingValue={underlyingValue}
          diagnosis={diagnosis}
          actMicro={profile.actMicro}
        />

        <CommitmentInput
          commitment={commitment}
          showInput={showCommitmentInput}
          onShowInput={() => setShowCommitmentInput(true)}
          onCommitmentChange={setCommitment}
        />

        <ExerciseRecommendations
          exercises={recommendedExercises}
          onShowAll={() => setShowExercises(true)}
        />

        <DocumentExport
          isGeneratingSummary={isGeneratingSummary}
          premiumSummary={premiumSummary}
          showDocument={showDocument}
          onGenerateSummary={generateSummary}
          onCloseDocument={() => setShowDocument(false)}
          diagnosis={diagnosis}
          actProfile={actProfile}
          finalIntensity={finalIntensity}
          commitment={commitment}
        />

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="space-y-3 mt-auto"
        >
          <Button 
            onClick={onHome}
            className="btn-ritual w-full"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al Inicio
          </Button>
          
          <Button 
            onClick={onNewRitual}
            variant="outline"
            className="w-full py-6 border-border/50 hover:border-primary/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Trabajar Otra Creencia
          </Button>
        </motion.div>
      </motion.div>

      {/* Exercise Library Modal */}
      <AnimatePresence>
        {showExercises && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-b border-border/30">
              <h2 className="text-xl font-semibold text-gradient-subtle">Ejercicios para Ti</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExercises(false)}
                className="hover:bg-primary/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <ExerciseLibrary profile={actProfile.profile} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
