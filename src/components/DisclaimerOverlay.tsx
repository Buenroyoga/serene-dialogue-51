// ═══════════════════════════════════════════════════════════
// DISCLAIMER OVERLAY - Non-intrusive initial notice
// ═══════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Shield } from 'lucide-react';

interface DisclaimerOverlayProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export function DisclaimerOverlay({ isVisible, onDismiss }: DisclaimerOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-card max-w-md w-full p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Heart className="w-8 h-8 text-primary" />
            </motion.div>

            <h2 className="text-xl font-semibold mb-4 text-gradient-subtle">
              Bienvenido/a a tu espacio interior
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Esta es una herramienta de <strong className="text-foreground">autoexploración</strong> basada 
              en la Terapia de Aceptación y Compromiso (ACT). Está diseñada para 
              acompañarte en la reflexión personal.
            </p>

            <div className="flex items-start gap-3 text-left p-4 rounded-xl bg-muted/30 mb-6">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Importante:</strong> Esta aplicación no sustituye 
                la terapia profesional ni el consejo médico. Si estás atravesando 
                una crisis, por favor contacta con un profesional de salud mental.
              </p>
            </div>

            <Button
              onClick={onDismiss}
              className="btn-ritual w-full"
              size="lg"
            >
              Entendido, comenzar
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Tus datos se guardan localmente y puedes eliminarlos en cualquier momento.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
