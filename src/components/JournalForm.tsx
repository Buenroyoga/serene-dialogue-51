import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  X, Save, Loader2, Heart, Cloud, Zap, Moon, Sun,
  Smile, Frown, Meh, Angry, AlertCircle
} from 'lucide-react';

const EMOTIONS = [
  { id: 'alegría', emoji: '😊', label: 'Alegría' },
  { id: 'calma', emoji: '😌', label: 'Calma' },
  { id: 'gratitud', emoji: '🙏', label: 'Gratitud' },
  { id: 'esperanza', emoji: '✨', label: 'Esperanza' },
  { id: 'amor', emoji: '❤️', label: 'Amor' },
  { id: 'ansiedad', emoji: '😰', label: 'Ansiedad' },
  { id: 'tristeza', emoji: '😢', label: 'Tristeza' },
  { id: 'frustración', emoji: '😤', label: 'Frustración' },
  { id: 'miedo', emoji: '😨', label: 'Miedo' },
  { id: 'soledad', emoji: '🥺', label: 'Soledad' },
  { id: 'confusión', emoji: '😕', label: 'Confusión' },
  { id: 'culpa', emoji: '😔', label: 'Culpa' }
];

const TRIGGERS = [
  { id: 'trabajo', emoji: '💼', label: 'Trabajo' },
  { id: 'relaciones', emoji: '👥', label: 'Relaciones' },
  { id: 'familia', emoji: '👨‍👩‍👧', label: 'Familia' },
  { id: 'salud', emoji: '🏥', label: 'Salud' },
  { id: 'dinero', emoji: '💰', label: 'Dinero' },
  { id: 'futuro', emoji: '🔮', label: 'Futuro' },
  { id: 'pasado', emoji: '⏮️', label: 'Pasado' },
  { id: 'soledad', emoji: '🏠', label: 'Soledad' },
  { id: 'descanso', emoji: '😴', label: 'Falta de descanso' },
  { id: 'social', emoji: '📱', label: 'Redes sociales' }
];

interface JournalFormProps {
  onSave: (entry: {
    mood_score: number;
    emotions: string[];
    triggers: string[];
    notes?: string;
    energy_level?: number;
    sleep_quality?: number;
  }) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function JournalForm({ onSave, onClose, isLoading }: JournalFormProps) {
  const [moodScore, setMoodScore] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [saving, setSaving] = useState(false);

  const getMoodIcon = () => {
    if (moodScore <= 3) return <Frown className="w-8 h-8 text-destructive" />;
    if (moodScore <= 5) return <Meh className="w-8 h-8 text-warning" />;
    if (moodScore <= 7) return <Smile className="w-8 h-8 text-primary" />;
    return <Heart className="w-8 h-8 text-pink-500" />;
  };

  const getMoodColor = () => {
    if (moodScore <= 3) return 'from-destructive/20 to-destructive/5';
    if (moodScore <= 5) return 'from-yellow-500/20 to-yellow-500/5';
    if (moodScore <= 7) return 'from-primary/20 to-primary/5';
    return 'from-pink-500/20 to-pink-500/5';
  };

  const toggleEmotion = (id: string) => {
    setSelectedEmotions(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleTrigger = (id: string) => {
    setSelectedTriggers(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedEmotions.length === 0) {
      toast.error('Selecciona al menos una emoción');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        mood_score: moodScore,
        emotions: selectedEmotions,
        triggers: selectedTriggers,
        notes: notes || undefined,
        energy_level: energyLevel,
        sleep_quality: sleepQuality
      });
      toast.success('Entrada guardada');
      onClose();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              ¿Cómo te sientes hoy?
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mood Score */}
            <div className={`p-6 rounded-xl bg-gradient-to-br ${getMoodColor()} space-y-4`}>
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Estado de ánimo</Label>
                <div className="flex items-center gap-2">
                  {getMoodIcon()}
                  <span className="text-2xl font-bold">{moodScore}/10</span>
                </div>
              </div>
              <Slider
                value={[moodScore]}
                onValueChange={([v]) => setMoodScore(v)}
                min={1}
                max={10}
                step={1}
                className="py-2"
              />
            </div>

            {/* Emotions */}
            <div className="space-y-3">
              <Label className="text-lg font-medium flex items-center gap-2">
                <Smile className="w-5 h-5 text-primary" />
                ¿Qué emociones sientes?
              </Label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map(emotion => (
                  <motion.button
                    key={emotion.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleEmotion(emotion.id)}
                    className={`px-3 py-2 rounded-full border transition-all flex items-center gap-2 ${
                      selectedEmotions.includes(emotion.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <span>{emotion.emoji}</span>
                    <span className="text-sm">{emotion.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div className="space-y-3">
              <Label className="text-lg font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                ¿Qué lo provocó? (opcional)
              </Label>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map(trigger => (
                  <motion.button
                    key={trigger.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTrigger(trigger.id)}
                    className={`px-3 py-2 rounded-full border transition-all flex items-center gap-2 ${
                      selectedTriggers.includes(trigger.id)
                        ? 'bg-secondary text-secondary-foreground border-secondary'
                        : 'bg-muted/50 border-border hover:border-secondary/50'
                    }`}
                  >
                    <span>{trigger.emoji}</span>
                    <span className="text-sm">{trigger.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Energy & Sleep */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Energía: {energyLevel}/10
                </Label>
                <Slider
                  value={[energyLevel]}
                  onValueChange={([v]) => setEnergyLevel(v)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Calidad de sueño: {sleepQuality}/10
                </Label>
                <Slider
                  value={[sleepQuality]}
                  onValueChange={([v]) => setSleepQuality(v)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-primary" />
                Reflexiones (opcional)
              </Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="¿Qué más quieres registrar sobre hoy?"
                className="min-h-24 resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={saving || isLoading}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar entrada
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
