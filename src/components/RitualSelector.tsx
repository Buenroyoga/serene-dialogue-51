// ═══════════════════════════════════════════════════════════
// RITUAL SELECTOR - Choose between short (3 phases) or full (6 phases) ritual
// ═══════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, Zap, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RitualMode = 'short' | 'full';

interface RitualSelectorProps {
  onSelect: (mode: RitualMode) => void;
  onBack: () => void;
}

export function RitualSelector({ onSelect, onBack }: RitualSelectorProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6">
      {/* Ambient background */}
      <div className="ambient-bg" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Back button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver
        </button>

        <div className="text-center mb-10">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            ✨
          </motion.div>
          <h2 className="text-3xl font-bold text-gradient-subtle mb-3">
            Elige tu Ritual
          </h2>
          <p className="text-muted-foreground">
            Selecciona según el tiempo y profundidad que desees
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Short Ritual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => onSelect('short')}
              className={cn(
                "w-full text-left glass-card p-6 group",
                "hover:border-primary/50 transition-all duration-300",
                "hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    Ritual Corto
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    3 fases esenciales para transformación rápida
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">🔍</span>
                      <span>Exploración</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">❤️</span>
                      <span>Valores</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">🎯</span>
                      <span>Acción</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-primary">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~5-10 minutos</span>
                  </div>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Full Ritual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => onSelect('full')}
              className={cn(
                "w-full text-left glass-card p-6 group relative overflow-hidden",
                "hover:border-primary/50 transition-all duration-300",
                "hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
              )}
            >
              {/* Recommended badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Recomendado
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    Ritual Completo
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    6 fases para transformación profunda
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">🔍</span>
                      <span>Certeza</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">⚡</span>
                      <span>Impacto</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">🕊️</span>
                      <span>Sin Historia</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">🔄</span>
                      <span>Giro</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">👁️</span>
                      <span>Testigo</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">✨</span>
                      <span>Cambio</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-primary">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~15-25 minutos</span>
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Puedes pausar en cualquier momento y retomar después
        </motion.p>
      </motion.div>
    </div>
  );
}
