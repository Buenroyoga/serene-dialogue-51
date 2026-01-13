import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { BreathAnchor } from './BreathAnchor';
import { TagSelector } from './TagSelector';
import { DiagnosisData } from '@/hooks/useSession';
import { ProfileResult, actProfiles } from '@/lib/actData';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { t } from '@/lib/i18n';

interface DiagnosisFormProps {
  actProfile: ProfileResult;
  onComplete: (diagnosis: DiagnosisData) => void;
  onBack: () => void;
}

const steps = [
  { id: 'belief', title: 'Creencia Nuclear', emoji: '💭' },
  { id: 'emotions', title: 'Emociones Asociadas', emoji: '❤️' },
  { id: 'triggers', title: 'Disparadores', emoji: '⚡' },
  { id: 'origin', title: 'Origen', emoji: '🌱' },
  { id: 'intensity', title: 'Intensidad', emoji: '🔥' },
];

export function DiagnosisForm({ actProfile, onComplete, onBack }: DiagnosisFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<DiagnosisData>>({
    coreBelief: '',
    emotionalHistory: [],
    triggers: [],
    narrative: '',
    origin: '',
    intensity: 5,
    subcategory: ''
  });

  const profile = actProfiles[actProfile.profile];
  const emotionOptions = ['Tristeza', 'Ansiedad', 'Rabia', 'Vergüenza', 'Miedo', 'Culpa', 'Frustración', 'Soledad', 'Desesperanza'];
  const triggerOptions = ['Trabajo', 'Relaciones', 'Familia', 'Momentos de soledad', 'Evaluaciones', 'Conflictos', 'Errores', 'Comparación con otros'];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete diagnosis
      const diagnosis: DiagnosisData = {
        coreBelief: formData.coreBelief || '',
        emotionalHistory: formData.emotionalHistory || [],
        triggers: formData.triggers || [],
        narrative: formData.narrative || '',
        origin: formData.origin || '',
        intensity: formData.intensity || 5,
        subcategory: `${actProfile.profile}1 - ${profile.description}`
      };
      onComplete(diagnosis);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'belief':
        return Boolean(formData.coreBelief && formData.coreBelief.trim().length >= 10);
      case 'emotions':
        return (formData.emotionalHistory?.length || 0) > 0;
      case 'triggers':
        return (formData.triggers?.length || 0) > 0;
      case 'origin':
        return true; // Optional
      case 'intensity':
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'belief':
        return (
          <div className="space-y-4">
            <div className="contemplative-card">
              <p className="text-sm text-muted-foreground mb-4">
                Como perfil <span className="text-primary">{profile.name}</span>, 
                te invitamos a expresar esa creencia que pesa en tu {
                  actProfile.profile === 'A' ? 'mente' :
                  actProfile.profile === 'B' ? 'corazón' :
                  actProfile.profile === 'C' ? 'cuerpo' : 'historia'
                }:
              </p>
              <Label htmlFor="belief" className="text-lg font-semibold">
                ¿Cuál es la creencia que quieres transformar?
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Ejemplo: "No soy suficiente", "Siempre fracaso", "No merezco amor"
              </p>
              <Textarea
                id="belief"
                value={formData.coreBelief || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coreBelief: e.target.value }))}
                placeholder="Escribe tu creencia nuclear aquí..."
                className="min-h-[120px] text-lg"
                aria-describedby="belief-guidance"
              />
              <p id="belief-guidance" className="text-xs text-muted-foreground mt-2">
                {t('diagnosis.beliefHint')}
              </p>
            </div>
          </div>
        );

      case 'emotions':
        return (
          <div className="space-y-4">
            <TagSelector
              id="custom-emotion"
              label="¿Qué emociones acompañan esta creencia?"
              description={`Selecciona las emociones que sientes cuando "${formData.coreBelief}" aparece:`}
              options={emotionOptions}
              selected={formData.emotionalHistory || []}
              onChange={(next) => setFormData(prev => ({ ...prev, emotionalHistory: next }))}
              inputPlaceholder={t('diagnosis.customEmotion')}
              inputAriaLabel="Agregar otra emoción"
              hint={t('diagnosis.emotionsHint')}
            />
          </div>
        );

      case 'triggers':
        return (
          <div className="space-y-4">
            <TagSelector
              id="custom-trigger"
              label="¿Qué situaciones disparan esta creencia?"
              description={`Identifica los momentos o contextos donde "${formData.coreBelief}" se activa:`}
              options={triggerOptions}
              selected={formData.triggers || []}
              onChange={(next) => setFormData(prev => ({ ...prev, triggers: next }))}
              inputPlaceholder={t('diagnosis.customTrigger')}
              inputAriaLabel="Agregar otro disparador"
              hint={t('diagnosis.triggersHint')}
            />
          </div>
        );

      case 'origin':
        return (
          <div className="space-y-4">
            <div className="contemplative-card">
              <Label htmlFor="origin" className="text-lg font-semibold">
                ¿Cuándo crees que nació esta creencia?
              </Label>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Reflexiona sobre el posible origen de "{formData.coreBelief}":
              </p>
              <Textarea
                id="origin"
                value={formData.origin || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                placeholder="Ejemplo: En mi infancia cuando... / A partir de esa experiencia en..."
                className="min-h-[100px]"
              />
              <Textarea
                className="mt-4"
                value={formData.narrative || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, narrative: e.target.value }))}
                placeholder="¿Hay algo más que quieras compartir sobre esta creencia? (opcional)"
                aria-label="Notas adicionales sobre la creencia"
              />
            </div>
          </div>
        );

      case 'intensity':
        return (
          <div className="space-y-4">
            <div className="contemplative-card">
              <Label className="text-lg font-semibold">
                ¿Cuán intensa sientes esta creencia ahora?
              </Label>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Del 1 al 10, ¿cuánto pesa "{formData.coreBelief}" en este momento?
              </p>
              <div className="space-y-6">
                <Slider
                  value={[formData.intensity || 5]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, intensity: value }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 - Leve</span>
                  <span className="text-2xl font-bold text-primary">{formData.intensity}</span>
                  <span>10 - Muy intenso</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={handlePrev}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 0 ? 'Volver' : 'Anterior'}
        </button>
        <div className="text-center">
          <BreathAnchor />
          <h2 className="text-xl font-bold mt-4 mb-2">Diagnóstico Profundo</h2>
          <p className="text-sm text-muted-foreground">
            Paso {currentStep + 1} de {steps.length}: {steps[currentStep].title}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {steps.map((step, i) => (
          <div 
            key={step.id}
            className={`flex-1 h-1 rounded-full transition-all ${
              i < currentStep ? 'bg-primary' :
              i === currentStep ? 'bg-primary/60' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step Icon */}
      <div className="text-center mb-6">
        <span className="text-5xl">{steps[currentStep].emoji}</span>
      </div>

      {/* Content */}
      <div className="flex-1 animate-fade-in">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="mt-8">
        <Button 
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full py-6 text-lg"
          size="lg"
        >
          {currentStep === steps.length - 1 ? 'Completar Diagnóstico' : 'Continuar'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
