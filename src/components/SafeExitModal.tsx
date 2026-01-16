// ═══════════════════════════════════════════════════════════
// SAFE EXIT MODAL - Mini-closure with brief breathing + options
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save, Trash2, X, Wind } from 'lucide-react';

interface SafeExitModalProps {
  isVisible: boolean;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
  onCancel: () => void;
  currentPhase: number;
  totalPhases: number;
}

export function SafeExitModal({
  isVisible,
  onSaveAndExit,
  onDiscardAndExit,
  onCancel,
  currentPhase,
  totalPhases,
}: SafeExitModalProps) {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale' | 'done'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setBreathingPhase('inhale');
      setBreathCount(0);
      setShowOptions(false);
      return;
    }

    // Brief breathing exercise (2 breaths)
    const breathCycle = () => {
      if (breathCount >= 2) {
        setBreathingPhase('done');
        setShowOptions(true);
        return;
      }

      if (breathingPhase === 'inhale') {
        setTimeout(() => setBreathingPhase('exhale'), 3000);
      } else if (breathingPhase === 'exhale') {
        setTimeout(() => {
          setBreathCount(prev => prev + 1);
          setBreathingPhase('inhale');
        }, 4000);
      }
    };

    const timer = setTimeout(breathCycle, 100);
    return () => clearTimeout(timer);
  }, [isVisible, breathingPhase, breathCount]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card max-w-md w-full p-8 text-center relative"
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!showOptions ? (
            // Breathing phase
            <motion.div
              key="breathing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
                animate={{
                  scale: breathingPhase === 'inhale' ? [1, 1.3] : [1.3, 1],
                }}
                transition={{ duration: breathingPhase === 'inhale' ? 3 : 4, ease: 'easeInOut' }}
              >
                <Wind className="w-12 h-12 text-primary" />
              </motion.div>

              <h3 className="text-xl font-semibold mb-2">
                {breathingPhase === 'inhale' ? 'Inhala...' : 'Exhala...'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {breathingPhase === 'inhale' 
                  ? 'Respira profundo por la nariz' 
                  : 'Suelta el aire lentamente por la boca'}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Respiración {breathCount + 1} de 2
              </p>
            </motion.div>
          ) : (
            // Options phase
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">🌿</span>
              </div>

              <h3 className="text-xl font-semibold mb-3">Salida Segura</h3>
              
              <div className="text-muted-foreground text-sm mb-6 space-y-2">
                <p>Has completado {currentPhase} de {totalPhases} fases.</p>
                <p className="text-foreground font-medium">
                  Lo que has explorado ya tiene valor.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={onSaveAndExit}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Save className="w-4 h-4" />
                  Guardar y Salir
                </Button>
                
                <Button 
                  onClick={onDiscardAndExit}
                  variant="outline"
                  className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                  size="lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Descartar y Salir
                </Button>

                <Button 
                  onClick={onCancel}
                  variant="ghost"
                  className="w-full"
                >
                  Continuar Ritual
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-6">
                Si guardas, podrás retomar exactamente donde lo dejaste.
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
