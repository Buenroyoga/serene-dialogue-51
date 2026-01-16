// ═══════════════════════════════════════════════════════════
// RITUAL COMPLETE - Premium Closure with PDF Export
// ═══════════════════════════════════════════════════════════

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DiagnosisData, DialogueEntry, ProfileResult } from '@/domain/types';
import { actProfiles, socraticRitual } from '@/lib/actData';
import {
  Home, RotateCcw, BookOpen, X, ChevronRight, FileText, Download, 
  Loader2, Copy, Check, Target, Lightbulb, Shield, Zap, Heart,
  Printer, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreathAnchor } from './BreathAnchor';
import { ExerciseLibrary } from './ExerciseLibrary';
import { getExercisesForProfile, exerciseCategories, ACTExercise } from '@/lib/actExercises';
import { supabase } from '@/integrations/supabase/client';
import { telemetry } from '@/domain/telemetry';
import { toast } from 'sonner';

interface RitualCompleteProps {
  actProfile: ProfileResult;
  diagnosis: DiagnosisData;
  dialogueEntries: DialogueEntry[];
  finalIntensity: number;
  onHome: () => void;
  onNewRitual: () => void;
}

interface PremiumSummary {
  findings: string[];
  underlyingValue: string;
  ifThenPlan: { trigger: string; response: string }[];
  exercises: ACTExercise[];
  commitment: string;
  fullDocument: string;
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
  const [copied, setCopied] = useState(false);
  const [commitment, setCommitment] = useState('');
  const [showCommitmentInput, setShowCommitmentInput] = useState(false);
  const [summaryMode, setSummaryMode] = useState<'textual' | 'ai'>('ai');
  const printRef = useRef<HTMLDivElement>(null);
  
  const profile = actProfiles[actProfile.profile];
  const intensityDrop = diagnosis.intensity - finalIntensity;
  const percentDrop = Math.round((intensityDrop / diagnosis.intensity) * 100);
  const recommendedExercises = getExercisesForProfile(actProfile.profile).slice(0, 3);

  const getTransformationMessage = () => {
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
      // Look for key insights based on phase
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

  // Generate textual summary (no AI)
  const generateTextualSummary = (): PremiumSummary => {
    const findings = extractFindings();
    
    // Generate if-then plans based on triggers
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

  const generateSummary = async (mode: 'textual' | 'ai') => {
    setSummaryMode(mode);
    
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
        // Fallback to textual
        const summary = generateTextualSummary();
        setPremiumSummary(summary);
        setShowDocument(true);
        return;
      }

      if (data) {
        setPremiumSummary({
          findings: data.findings || extractFindings(),
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

  const printDocument = () => {
    if (!premiumSummary) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Permite las ventanas emergentes para imprimir');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documento de Transformación - ${new Date().toLocaleDateString('es-ES')}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #fafafa;
      padding: 0;
    }
    
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 50px;
      background: white;
      min-height: 100vh;
    }
    
    .header {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 2px solid #e8e0d5;
    }
    
    .logo {
      font-size: 48px;
      margin-bottom: 10px;
    }
    
    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .date {
      font-size: 14px;
      color: #888;
      margin-top: 10px;
    }
    
    .profile-badge {
      display: inline-block;
      background: linear-gradient(135deg, #c9a86c 0%, #8b7355 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 25px;
      font-size: 14px;
      margin-top: 15px;
    }
    
    section {
      margin-bottom: 40px;
    }
    
    h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e8e0d5;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }
    
    .belief-box {
      background: linear-gradient(135deg, #f8f6f3 0%, #f0ebe4 100%);
      border-left: 4px solid #c9a86c;
      padding: 25px 30px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 25px;
    }
    
    .belief-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-style: italic;
      color: #333;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin: 25px 0;
    }
    
    .metric-card {
      text-align: center;
      padding: 20px;
      background: #f8f6f3;
      border-radius: 12px;
    }
    
    .metric-value {
      font-size: 36px;
      font-weight: 600;
      color: #c9a86c;
    }
    
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .finding-item {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      padding: 15px 20px;
      background: #fafafa;
      border-radius: 8px;
    }
    
    .finding-number {
      width: 28px;
      height: 28px;
      background: #c9a86c;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .value-highlight {
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%);
      color: white;
      padding: 25px 30px;
      border-radius: 12px;
      text-align: center;
    }
    
    .value-highlight h3 {
      color: #c9a86c;
      margin-bottom: 5px;
    }
    
    .value-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 26px;
    }
    
    .if-then-item {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 15px;
      align-items: center;
      margin-bottom: 15px;
      padding: 15px;
      background: #f8f6f3;
      border-radius: 8px;
    }
    
    .if-box, .then-box {
      padding: 10px 15px;
      border-radius: 8px;
    }
    
    .if-box {
      background: #ffe4e4;
      border-left: 3px solid #e57373;
    }
    
    .then-box {
      background: #e4f5e4;
      border-left: 3px solid #81c784;
    }
    
    .arrow {
      font-size: 24px;
      color: #c9a86c;
    }
    
    .commitment-box {
      background: linear-gradient(135deg, #c9a86c 0%, #8b7355 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
    }
    
    .commitment-box h3 {
      color: white;
      opacity: 0.9;
    }
    
    .commitment-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      margin-top: 10px;
    }
    
    .exercise-card {
      display: flex;
      gap: 15px;
      padding: 20px;
      background: #fafafa;
      border-radius: 12px;
      margin-bottom: 15px;
    }
    
    .exercise-emoji {
      font-size: 32px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 12px;
    }
    
    .exercise-content h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .exercise-duration {
      font-size: 12px;
      color: #c9a86c;
      margin-bottom: 8px;
    }
    
    .exercise-description {
      font-size: 14px;
      color: #666;
    }
    
    .practice-box {
      background: #f0f4f8;
      border: 2px dashed #b0c4d8;
      padding: 25px;
      border-radius: 12px;
      text-align: center;
    }
    
    .practice-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-style: italic;
      color: #333;
    }
    
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #e8e0d5;
      color: #888;
      font-size: 12px;
    }
    
    .phases-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 25px 0;
    }
    
    .phase-item {
      text-align: center;
      padding: 15px;
      background: #f8f6f3;
      border-radius: 8px;
    }
    
    .phase-emoji {
      font-size: 24px;
      margin-bottom: 5px;
    }
    
    .phase-name {
      font-size: 12px;
      color: #666;
    }
    
    @media print {
      body { background: white; }
      .page { 
        padding: 40px; 
        box-shadow: none;
      }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="logo">✨</div>
      <h1>Documento de Transformación</h1>
      <div class="subtitle">Diálogo Socrático Interior</div>
      <div class="date">${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="profile-badge">${profile.emoji} Perfil ${profile.name}</div>
    </header>
    
    <section>
      <h2>📍 La Creencia Trabajada</h2>
      <div class="belief-box">
        <div class="belief-text">"${diagnosis.coreBelief}"</div>
      </div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${diagnosis.intensity}</div>
          <div class="metric-label">Intensidad Inicial</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${finalIntensity}</div>
          <div class="metric-label">Intensidad Final</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">-${intensityDrop}</div>
          <div class="metric-label">Puntos Reducidos</div>
        </div>
      </div>
    </section>
    
    <section>
      <h2>💡 Hallazgos Clave</h2>
      ${premiumSummary.findings.map((f, i) => `
        <div class="finding-item">
          <div class="finding-number">${i + 1}</div>
          <div>${f}</div>
        </div>
      `).join('')}
    </section>
    
    <section>
      <h2>❤️ Valor Subyacente</h2>
      <div class="value-highlight">
        <h3>Lo que realmente te importa</h3>
        <div class="value-text">${premiumSummary.underlyingValue}</div>
      </div>
    </section>
    
    <section>
      <h2>🛡️ Plan Si-Entonces</h2>
      <p style="margin-bottom: 15px; color: #666;">Para cuando la creencia resurja:</p>
      ${premiumSummary.ifThenPlan.map(p => `
        <div class="if-then-item">
          <div class="if-box">
            <strong>SI</strong><br>${p.trigger}
          </div>
          <div class="arrow">→</div>
          <div class="then-box">
            <strong>ENTONCES</strong><br>${p.response}
          </div>
        </div>
      `).join('')}
    </section>
    
    ${commitment ? `
    <section>
      <h2>🎯 Tu Compromiso 24-48h</h2>
      <div class="commitment-box">
        <h3>Me comprometo a:</h3>
        <div class="commitment-text">${commitment}</div>
      </div>
    </section>
    ` : ''}
    
    <section>
      <h2>🧘 Ejercicios Recomendados</h2>
      ${premiumSummary.exercises.map(ex => `
        <div class="exercise-card">
          <div class="exercise-emoji">${ex.emoji}</div>
          <div class="exercise-content">
            <h4>${ex.name}</h4>
            <div class="exercise-duration">${ex.duration}</div>
            <div class="exercise-description">${ex.description}</div>
          </div>
        </div>
      `).join('')}
    </section>
    
    <section>
      <h2>✨ Tu Práctica ACT Diaria</h2>
      <div class="practice-box">
        <div class="practice-text">${profile.actMicro}</div>
      </div>
    </section>
    
    <section>
      <h2>🌀 Fases Completadas</h2>
      <div class="phases-grid">
        ${socraticRitual.map(phase => `
          <div class="phase-item">
            <div class="phase-emoji">${phase.emoji}</div>
            <div class="phase-name">${phase.name}</div>
          </div>
        `).join('')}
      </div>
    </section>
    
    <footer class="footer">
      <p>Este documento es para tu reflexión personal.</p>
      <p>Vuelve a él cuando necesites recordar tu camino.</p>
      <p style="margin-top: 15px; color: #c9a86c;">✨ Diálogo Socrático Interior</p>
    </footer>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    telemetry.track('export_downloaded', 'ritual', { format: 'pdf' });
  };

  const downloadMarkdown = () => {
    if (!premiumSummary) return;
    
    const blob = new Blob([premiumSummary.fullDocument], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ritual-socrático-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    telemetry.track('export_downloaded', 'ritual', { format: 'markdown' });
    toast.success('Documento descargado');
  };

  const copySummary = async () => {
    if (!premiumSummary) return;
    
    try {
      await navigator.clipboard.writeText(premiumSummary.fullDocument);
      setCopied(true);
      toast.success('Copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      <div className="ambient-bg" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-2xl mx-auto p-6 flex flex-col flex-1"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <BreathAnchor size="lg" className="mb-6" />
          <motion.div 
            className="text-7xl mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {transformation.emoji}
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-subtle mb-3">
            {transformation.title}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {transformation.message}
          </p>
        </motion.div>

        {/* Intensity Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card mb-6"
        >
          <h3 className="font-semibold mb-6 text-center text-lg">Tu Recorrido</h3>
          
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-muted-foreground">
                {diagnosis.intensity}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Antes</div>
            </div>
            
            <motion.div 
              className="text-3xl text-primary"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient">
                {finalIntensity}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Ahora</div>
            </div>
          </div>

          {intensityDrop > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-4 rounded-xl"
              style={{ background: 'linear-gradient(135deg, hsl(35 85% 55% / 0.15), hsl(270 50% 60% / 0.1))' }}
            >
              <span className="text-primary font-semibold text-lg">
                ✨ -{intensityDrop} puntos ({percentDrop}% de reducción)
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Key Findings Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Hallazgos Clave</h3>
          </div>
          <div className="space-y-3">
            {extractFindings().slice(0, 2).map((finding, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-primary/5">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-muted-foreground">{finding.slice(0, 100)}...</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Underlying Value */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold">Valor Subyacente</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Lo que realmente te importa debajo de esta lucha:
          </p>
          <p className="text-xl font-semibold text-primary">
            {detectUnderlyingValue()}
          </p>
        </motion.div>

        {/* If-Then Plan Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold">Plan Si-Entonces</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Para cuando la creencia resurja:
          </p>
          {diagnosis.triggers.slice(0, 2).map((trigger, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-2">
              <div className="px-2 py-1 rounded bg-rose-500/10 text-rose-600 text-xs font-medium">
                SI
              </div>
              <span className="text-sm flex-1">{trigger}</span>
              <Zap className="w-4 h-4 text-primary" />
              <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                ENTONCES
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            → Aplicar: {profile.actMicro.slice(0, 50)}...
          </p>
        </motion.div>

        {/* Commitment Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-card mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Tu Compromiso 24-48h</h3>
          </div>
          
          {!showCommitmentInput ? (
            <Button
              variant="outline"
              onClick={() => setShowCommitmentInput(true)}
              className="w-full border-dashed border-primary/30 hover:border-primary/60"
            >
              <ChevronRight className="w-4 h-4 mr-2" />
              Definir un compromiso concreto
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                ¿Qué pequeña acción puedes hacer en las próximas 24-48 horas que honre tus valores?
              </p>
              <Textarea
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                placeholder="Ej: Cuando sienta la urgencia de evitar, haré 3 respiraciones conscientes antes de decidir..."
                className="min-h-[100px]"
              />
              {commitment && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-emerald-600"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Compromiso guardado</span>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Recommended Exercises */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Ejercicios Recomendados
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExercises(true)}
              className="text-xs text-primary hover:text-primary/80"
            >
              Ver todos
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {recommendedExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => setShowExercises(true)}
              >
                <span className="text-xl">{exercise.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">{exercise.duration}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">
                  {exerciseCategories[exercise.category].emoji}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Generate Document Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => generateSummary('textual')}
              disabled={isGeneratingSummary}
              variant="outline"
              className="py-6 border-border/50 hover:border-primary/50 flex-col h-auto"
            >
              <FileText className="w-5 h-5 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">Solo mis palabras</span>
              <span className="text-xs text-muted-foreground mt-1">Sin IA</span>
            </Button>
            
            <Button
              onClick={() => generateSummary('ai')}
              disabled={isGeneratingSummary}
              variant="outline"
              className="py-6 border-primary/30 hover:border-primary/60 hover:bg-primary/5 flex-col h-auto"
            >
              {isGeneratingSummary ? (
                <Loader2 className="w-5 h-5 mb-2 animate-spin text-primary" />
              ) : (
                <Sparkles className="w-5 h-5 mb-2 text-primary" />
              )}
              <span className="text-sm font-medium text-gradient-subtle">Con insights IA</span>
              <span className="text-xs text-muted-foreground mt-1">Recomendado</span>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Genera un documento profesional para imprimir o guardar
          </p>
        </motion.div>

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

      {/* Premium Document Modal */}
      <AnimatePresence>
        {showDocument && premiumSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-b border-border/30">
              <h2 className="text-xl font-semibold text-gradient-subtle">
                Tu Documento de Transformación
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copySummary}
                  className="hover:bg-primary/10"
                  title="Copiar"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={downloadMarkdown}
                  className="hover:bg-primary/10"
                  title="Descargar Markdown"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={printDocument}
                  className="gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir PDF
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDocument(false)}
                  className="hover:bg-primary/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 max-w-3xl mx-auto" ref={printRef}>
              {/* Document Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card space-y-8"
              >
                {/* Header */}
                <div className="text-center pb-6 border-b border-border/30">
                  <div className="text-5xl mb-4">✨</div>
                  <h1 className="text-2xl font-bold text-gradient-subtle mb-2">
                    Documento de Transformación
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-primary/10">
                    <span>{profile.emoji}</span>
                    <span className="text-sm font-medium">Perfil {profile.name}</span>
                  </div>
                </div>

                {/* Belief */}
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    La Creencia Trabajada
                  </h2>
                  <div className="p-4 rounded-xl bg-primary/5 border-l-4 border-primary">
                    <p className="text-lg italic">"{diagnosis.coreBelief}"</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-muted-foreground">{diagnosis.intensity}</div>
                      <div className="text-xs text-muted-foreground">Inicial</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-primary">{finalIntensity}</div>
                      <div className="text-xs text-muted-foreground">Final</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-primary/10">
                      <div className="text-2xl font-bold text-primary">-{intensityDrop}</div>
                      <div className="text-xs text-muted-foreground">Reducción</div>
                    </div>
                  </div>
                </div>

                {/* Findings */}
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Hallazgos Clave
                  </h2>
                  <div className="space-y-3">
                    {premiumSummary.findings.map((finding, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                        </div>
                        <p className="text-sm">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Value */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-center">
                  <h2 className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Valor Subyacente
                  </h2>
                  <p className="text-xl font-semibold text-primary">
                    {premiumSummary.underlyingValue}
                  </p>
                </div>

                {/* If-Then Plan */}
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    Plan Si-Entonces
                  </h2>
                  <div className="space-y-3">
                    {premiumSummary.ifThenPlan.map((plan, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="px-2 py-1 rounded bg-rose-500/10 text-rose-600 text-xs font-medium flex-shrink-0">
                          SI
                        </div>
                        <span className="text-sm flex-1">{plan.trigger}</span>
                        <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 text-xs font-medium flex-shrink-0">
                          ENTONCES
                        </div>
                        <span className="text-sm flex-1">{plan.response}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commitment */}
                {commitment && (
                  <div className="p-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center">
                    <h2 className="text-sm font-medium opacity-90 mb-2 flex items-center justify-center gap-2">
                      <Target className="w-4 h-4" />
                      Mi Compromiso 24-48h
                    </h2>
                    <p className="text-lg">{commitment}</p>
                  </div>
                )}

                {/* Exercises */}
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Ejercicios Recomendados
                  </h2>
                  <div className="space-y-3">
                    {premiumSummary.exercises.map((ex) => (
                      <div key={ex.id} className="flex gap-4 p-4 rounded-lg bg-muted/30">
                        <div className="text-3xl">{ex.emoji}</div>
                        <div>
                          <h3 className="font-medium">{ex.name}</h3>
                          <p className="text-xs text-primary mb-1">{ex.duration}</p>
                          <p className="text-sm text-muted-foreground">{ex.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Practice */}
                <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 text-center">
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">
                    ✨ Tu Práctica ACT Diaria
                  </h2>
                  <p className="italic text-foreground">{profile.actMicro}</p>
                </div>

                {/* Footer */}
                <div className="text-center pt-6 border-t border-border/30 text-sm text-muted-foreground">
                  <p>Este documento es para tu reflexión personal.</p>
                  <p className="text-primary mt-2">✨ Diálogo Socrático Interior</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
