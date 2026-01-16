import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { BreathAnchor } from './BreathAnchor';
import { SuggestedChips } from './SuggestedChips';
import { DiagnosisData, ProfileResult } from '@/domain/types';
import { actProfiles } from '@/lib/actData';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
interface DiagnosisFormProps {
  actProfile: ProfileResult;
  onComplete: (diagnosis: DiagnosisData) => void;
  onBack: () => void;
}

const steps = [
  { id: 'belief', title: 'Creencia Nuclear', emoji: '💭', color: 'from-violet-500/20 to-purple-500/20' },
  { id: 'emotions', title: 'Emociones Asociadas', emoji: '❤️', color: 'from-rose-500/20 to-pink-500/20' },
  { id: 'triggers', title: 'Disparadores', emoji: '⚡', color: 'from-amber-500/20 to-orange-500/20' },
  { id: 'origin', title: 'Origen', emoji: '🌱', color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 'intensity', title: 'Intensidad', emoji: '🔥', color: 'from-red-500/20 to-rose-500/20' },
];

export function DiagnosisForm({ actProfile, onComplete, onBack }: DiagnosisFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [customInput, setCustomInput] = useState('');
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
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
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const addCustomItem = (field: 'emotionalHistory' | 'triggers') => {
    if (customInput.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), customInput.trim()]
      }));
      setCustomInput('');
    }
  };

  const toggleItem = (field: 'emotionalHistory' | 'triggers', item: string) => {
    const current = formData[field] || [];
    const updated = current.includes(item)
      ? current.filter(e => e !== item)
      : [...current, item];
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const removeItem = (field: 'emotionalHistory' | 'triggers', item: string) => {
    const current = formData[field] || [];
    setFormData(prev => ({ ...prev, [field]: current.filter(e => e !== item) }));
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'belief':
        return formData.coreBelief && formData.coreBelief.length > 5;
      case 'emotions':
        return (formData.emotionalHistory?.length || 0) > 0;
      case 'triggers':
        return (formData.triggers?.length || 0) > 0;
      case 'origin':
        return true;
      case 'intensity':
        return true;
      default:
        return false;
    }
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 3) return { text: 'Leve', color: 'text-emerald-500' };
    if (value <= 5) return { text: 'Moderado', color: 'text-amber-500' };
    if (value <= 7) return { text: 'Significativo', color: 'text-orange-500' };
    return { text: 'Intenso', color: 'text-rose-500' };
  };

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

  const renderStep = () => {
    const currentStepData = steps[currentStep];
    
    switch (currentStepData.id) {
      case 'belief':
        return (
          <div className="space-y-6">
            <div className={`glass-card p-6 rounded-2xl bg-gradient-to-br ${currentStepData.color}`}>
              <p className="text-sm text-muted-foreground mb-4">
                Como perfil <span className="text-primary font-semibold">{profile.emoji} {profile.name}</span>, 
                te invitamos a expresar esa creencia que pesa en tu {
                  actProfile.profile === 'A' ? 'mente' :
                  actProfile.profile === 'B' ? 'corazón' :
                  actProfile.profile === 'C' ? 'cuerpo' : 'historia'
                }:
              </p>
              <Label htmlFor="belief" className="text-lg font-semibold block mb-2">
                ¿Cuál es la creencia que quieres transformar?
              </Label>
              <p className="text-xs text-muted-foreground mb-4">
                Ejemplo: "No soy suficiente", "Siempre fracaso", "No merezco amor"
              </p>
              <Textarea
                id="belief"
                value={formData.coreBelief || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coreBelief: e.target.value }))}
                placeholder="Escribe tu creencia nuclear aquí..."
                className="min-h-[120px] text-lg bg-background/50 border-primary/20 focus:border-primary/50"
              />
              {formData.coreBelief && formData.coreBelief.length > 5 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 text-sm text-primary"
                >
                  <Check className="w-4 h-4" />
                  <span>Creencia registrada</span>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'emotions':
        return (
          <div className="space-y-6">
            <div className={`glass-card p-6 rounded-2xl bg-gradient-to-br ${currentStepData.color}`}>
              <Label className="text-lg font-semibold block mb-2">
                ¿Qué emociones acompañan esta creencia?
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Cuando "<span className="text-foreground">{formData.coreBelief}</span>" aparece:
              </p>
              
              <SuggestedChips
                type="emotions"
                selected={formData.emotionalHistory || []}
                onToggle={(item) => toggleItem('emotionalHistory', item)}
                onRemove={(item) => removeItem('emotionalHistory', item)}
              />

              {/* Custom emotion input */}
              <div className="mt-4 flex gap-2">
                <Input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Otra emoción..."
                  className="bg-background/50"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem('emotionalHistory')}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => addCustomItem('emotionalHistory')}
                  disabled={!customInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'triggers':
        return (
          <div className="space-y-6">
            <div className={`glass-card p-6 rounded-2xl bg-gradient-to-br ${currentStepData.color}`}>
              <Label className="text-lg font-semibold block mb-2">
                ¿Qué situaciones disparan esta creencia?
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Momentos donde "<span className="text-foreground">{formData.coreBelief}</span>" se activa:
              </p>
              
              <SuggestedChips
                type="triggers"
                selected={formData.triggers || []}
                onToggle={(item) => toggleItem('triggers', item)}
                onRemove={(item) => removeItem('triggers', item)}
              />

              {/* Custom trigger input */}
              <div className="mt-4 flex gap-2">
                <Input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Otro disparador..."
                  className="bg-background/50"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem('triggers')}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => addCustomItem('triggers')}
                  disabled={!customInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'origin':
        return (
          <div className="space-y-6">
            <div className={`glass-card p-6 rounded-2xl bg-gradient-to-br ${currentStepData.color}`}>
              <Label htmlFor="origin" className="text-lg font-semibold block mb-2">
                ¿Cuándo crees que nació esta creencia?
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Reflexiona sobre el posible origen de "<span className="text-foreground">{formData.coreBelief}</span>":
              </p>
              <Textarea
                id="origin"
                value={formData.origin || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                placeholder="Ejemplo: En mi infancia cuando... / A partir de esa experiencia en..."
                className="min-h-[100px] bg-background/50 border-primary/20"
              />
              <Textarea
                className="mt-4 bg-background/50 border-primary/20"
                value={formData.narrative || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, narrative: e.target.value }))}
                placeholder="¿Hay algo más que quieras compartir sobre esta creencia? (opcional)"
              />
              <p className="text-xs text-muted-foreground mt-2 italic">
                Este paso es opcional, pero puede ayudar a profundizar en el diálogo socrático.
              </p>
            </div>
          </div>
        );

      case 'intensity':
        const intensityLabel = getIntensityLabel(formData.intensity || 5);
        return (
          <div className="space-y-6">
            <div className={`glass-card p-6 rounded-2xl bg-gradient-to-br ${currentStepData.color}`}>
              <Label className="text-lg font-semibold block mb-2">
                ¿Cuán intensa sientes esta creencia ahora?
              </Label>
              <p className="text-sm text-muted-foreground mb-6">
                Del 1 al 10, ¿cuánto pesa "<span className="text-foreground">{formData.coreBelief}</span>"?
              </p>
              
              <div className="space-y-8">
                {/* Intensity display */}
                <motion.div 
                  key={formData.intensity}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <span className={`text-7xl font-bold ${intensityLabel.color}`}>
                    {formData.intensity}
                  </span>
                  <p className={`text-lg font-medium mt-2 ${intensityLabel.color}`}>
                    {intensityLabel.text}
                  </p>
                </motion.div>

                {/* Slider */}
                <div className="px-2">
                  <Slider
                    value={[formData.intensity || 5]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, intensity: value }))}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Labels */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Apenas perceptible</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Abrumador</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                </div>

                {/* Visual intensity bar */}
                <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-rose-500/20 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                    initial={false}
                    animate={{ width: `${((formData.intensity || 5) / 10) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button 
          onClick={handlePrev}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {currentStep === 0 ? 'Volver' : 'Anterior'}
        </button>
        <div className="text-center">
          <BreathAnchor />
          <h2 className="text-2xl font-bold mt-4 mb-2 tracking-tight">Diagnóstico Profundo</h2>
          <p className="text-sm text-muted-foreground">
            Paso {currentStep + 1} de {steps.length}
          </p>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex gap-2 mb-8">
        {steps.map((step, i) => (
          <motion.div 
            key={step.id}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex-1 h-2 rounded-full transition-all duration-300 origin-left",
              i < currentStep ? 'bg-primary' :
              i === currentStep ? 'bg-primary/60' : 'bg-muted/50'
            )}
          />
        ))}
      </div>

      {/* Step Icon */}
      <motion.div 
        key={currentStep}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-6"
      >
        <span className="text-5xl">{steps[currentStep].emoji}</span>
        <h3 className="text-lg font-semibold mt-2 text-primary">{steps[currentStep].title}</h3>
      </motion.div>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8"
      >
        <Button 
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full py-6 text-lg gap-2 group"
          size="lg"
        >
          {currentStep === steps.length - 1 ? (
            <>
              Completar Diagnóstico
              <Check className="w-5 h-5" />
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
