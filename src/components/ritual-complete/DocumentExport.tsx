import { memo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  FileText, Loader2, Sparkles, Copy, Check, Download, 
  Printer, X, Target, Lightbulb, Heart, Shield, Zap, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { PremiumSummary } from './types';
import { DiagnosisData, ProfileResult } from '@/domain/types';
import { actProfiles } from '@/lib/actData';
import { telemetry } from '@/domain/telemetry';

interface DocumentExportProps {
  isGeneratingSummary: boolean;
  premiumSummary: PremiumSummary | null;
  showDocument: boolean;
  onGenerateSummary: (mode: 'textual' | 'ai') => void;
  onCloseDocument: () => void;
  diagnosis: DiagnosisData;
  actProfile: ProfileResult;
  finalIntensity: number;
  commitment: string;
}

export const DocumentExport = memo(function DocumentExport({
  isGeneratingSummary,
  premiumSummary,
  showDocument,
  onGenerateSummary,
  onCloseDocument,
  diagnosis,
  actProfile,
  finalIntensity,
  commitment
}: DocumentExportProps) {
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const profile = actProfiles[actProfile.profile];
  const intensityDrop = diagnosis.intensity - finalIntensity;

  const printDocument = () => {
    if (!premiumSummary) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Permite las ventanas emergentes para imprimir');
      return;
    }

    const htmlContent = generatePrintHtml(premiumSummary, profile, diagnosis, finalIntensity, intensityDrop, commitment);
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
    <>
      {/* Generate Document Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8 space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onGenerateSummary('textual')}
            disabled={isGeneratingSummary}
            variant="outline"
            className="py-6 border-border/50 hover:border-primary/50 flex-col h-auto"
          >
            <FileText className="w-5 h-5 mb-2 text-muted-foreground" />
            <span className="text-sm font-medium">Solo mis palabras</span>
            <span className="text-xs text-muted-foreground mt-1">Sin IA</span>
          </Button>
          
          <Button
            onClick={() => onGenerateSummary('ai')}
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
                  onClick={onCloseDocument}
                  className="hover:bg-primary/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 max-w-3xl mx-auto" ref={printRef}>
              <DocumentPreview 
                premiumSummary={premiumSummary}
                profile={profile}
                diagnosis={diagnosis}
                finalIntensity={finalIntensity}
                intensityDrop={intensityDrop}
                commitment={commitment}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

interface DocumentPreviewProps {
  premiumSummary: PremiumSummary;
  profile: { name: string; emoji: string; actMicro: string };
  diagnosis: DiagnosisData;
  finalIntensity: number;
  intensityDrop: number;
  commitment: string;
}

function DocumentPreview({
  premiumSummary,
  profile,
  diagnosis,
  finalIntensity,
  intensityDrop,
  commitment
}: DocumentPreviewProps) {
  return (
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
        <p className="italic text-foreground">{premiumSummary.exercises.length > 0 ? premiumSummary.exercises[0].description : ''}</p>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-border/30 text-sm text-muted-foreground">
        <p>Este documento es para tu reflexión personal.</p>
        <p className="text-primary mt-2">✨ Diálogo Socrático Interior</p>
      </div>
    </motion.div>
  );
}

function generatePrintHtml(
  premiumSummary: PremiumSummary,
  profile: { name: string; emoji: string; actMicro: string },
  diagnosis: DiagnosisData,
  finalIntensity: number,
  intensityDrop: number,
  commitment: string
): string {
  return `
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
    
    .logo { font-size: 48px; margin-bottom: 10px; }
    
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
    
    .date { font-size: 14px; color: #888; margin-top: 10px; }
    
    .profile-badge {
      display: inline-block;
      background: linear-gradient(135deg, #c9a86c 0%, #8b7355 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 25px;
      font-size: 14px;
      margin-top: 15px;
    }
    
    section { margin-bottom: 40px; }
    
    h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e8e0d5;
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
    
    .metric-value { font-size: 36px; font-weight: 600; color: #c9a86c; }
    .metric-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
    
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
    
    .value-highlight h3 { color: #c9a86c; margin-bottom: 5px; }
    .value-text { font-family: 'Cormorant Garamond', serif; font-size: 26px; }
    
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
    
    .if-box, .then-box { padding: 10px 15px; border-radius: 8px; }
    .if-box { background: #ffe4e4; border-left: 3px solid #e57373; }
    .then-box { background: #e4f5e4; border-left: 3px solid #81c784; }
    .arrow { font-size: 24px; color: #c9a86c; }
    
    .commitment-box {
      background: linear-gradient(135deg, #c9a86c 0%, #8b7355 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
    }
    
    .commitment-box h3 { color: white; opacity: 0.9; }
    .commitment-text { font-family: 'Cormorant Garamond', serif; font-size: 20px; margin-top: 10px; }
    
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
    
    .exercise-content h4 { font-size: 16px; font-weight: 600; margin-bottom: 5px; }
    .exercise-duration { font-size: 12px; color: #c9a86c; margin-bottom: 8px; }
    .exercise-description { font-size: 14px; color: #666; }
    
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
    
    @media print {
      body { background: white; }
      .page { padding: 40px; box-shadow: none; }
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
      ${premiumSummary.ifThenPlan.map(p => `
        <div class="if-then-item">
          <div class="if-box"><strong>SI</strong><br>${p.trigger}</div>
          <div class="arrow">→</div>
          <div class="then-box"><strong>ENTONCES</strong><br>${p.response}</div>
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
    
    <footer class="footer">
      <p>Este documento es para tu reflexión personal.</p>
      <p>Vuelve a él cuando necesites recordar tu camino.</p>
      <p style="margin-top: 15px; color: #c9a86c;">✨ Diálogo Socrático Interior</p>
    </footer>
  </div>
  
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>
  `;
}
