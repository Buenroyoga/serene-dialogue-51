// ═══════════════════════════════════════════════════════════
// CRISIS MODAL - Safe exit with resources
// ═══════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Phone, ExternalLink, Pause, X } from 'lucide-react';
import { CRISIS_RESOURCES, CrisisCheckResult } from '@/domain/crisis';

interface CrisisModalProps {
  isVisible: boolean;
  crisisResult?: CrisisCheckResult;
  onContinue: () => void;
  onPause: () => void;
  onExit: () => void;
}

export function CrisisModal({ 
  isVisible, 
  crisisResult, 
  onContinue, 
  onPause, 
  onExit 
}: CrisisModalProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-card max-w-lg w-full p-8"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center"
              >
                <Heart className="w-8 h-8 text-rose-500" />
              </motion.div>
              
              <h2 className="text-xl font-semibold mb-2">
                Un momento de pausa
              </h2>
              
              <p className="text-muted-foreground">
                {crisisResult?.suggestion || 
                  'Noto que podrías estar atravesando un momento difícil.'}
              </p>
            </div>

            {/* Resources */}
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-foreground mb-3">
                Recursos de apoyo disponibles:
              </p>
              
              <a
                href={`tel:${CRISIS_RESOURCES.spain_general.phone}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {CRISIS_RESOURCES.spain_general.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {CRISIS_RESOURCES.spain_general.description}
                  </p>
                </div>
              </a>
              
              <a
                href={`tel:${CRISIS_RESOURCES.spain.phone}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {CRISIS_RESOURCES.spain.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {CRISIS_RESOURCES.spain.phone} • {CRISIS_RESOURCES.spain.description}
                  </p>
                </div>
              </a>
              
              <a
                href={CRISIS_RESOURCES.international.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Otros países: directorio internacional de centros de crisis
                </span>
              </a>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={onPause}
                variant="outline"
                className="w-full py-6 border-primary/30 hover:border-primary/60"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pausar y hacer ejercicio de regulación
              </Button>
              
              <div className="flex gap-3">
                <Button
                  onClick={onExit}
                  variant="ghost"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Salir del ritual
                </Button>
                
                <Button
                  onClick={onContinue}
                  variant="ghost"
                  className="flex-1 text-muted-foreground"
                >
                  Continuar
                </Button>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Este mensaje aparece para cuidarte, no para juzgarte.
              <br />
              Siempre puedes elegir cómo continuar.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
