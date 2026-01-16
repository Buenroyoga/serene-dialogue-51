// ═══════════════════════════════════════════════════════════
// ACTIVATION TRAFFIC LIGHT - Visual indicator for activation level
// ═══════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export type ActivationLevel = 'green' | 'amber' | 'red';

interface ActivationTrafficLightProps {
  intensity: number;
  intensityJump?: number;
  className?: string;
  showLabel?: boolean;
  onSuggestPause?: () => void;
}

export function getActivationLevel(intensity: number, intensityJump: number = 0): ActivationLevel {
  // Red: intensity >= 8 OR sudden jump >= 3
  if (intensity >= 8 || intensityJump >= 3) return 'red';
  // Amber: intensity >= 6 OR jump >= 2
  if (intensity >= 6 || intensityJump >= 2) return 'amber';
  // Green: normal levels
  return 'green';
}

const levelConfig = {
  green: {
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-500',
    icon: CheckCircle,
    label: 'Regulado',
    description: 'Tu nivel de activación es saludable',
  },
  amber: {
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-500',
    icon: AlertCircle,
    label: 'Atención',
    description: 'Observa si necesitas un momento',
  },
  red: {
    color: 'bg-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-500',
    icon: AlertTriangle,
    label: 'Alta activación',
    description: 'Te sugiero una pausa somática',
  },
};

export function ActivationTrafficLight({ 
  intensity, 
  intensityJump = 0,
  className,
  showLabel = true,
  onSuggestPause,
}: ActivationTrafficLightProps) {
  const level = getActivationLevel(intensity, intensityJump);
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <motion.div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border",
        config.bgColor,
        config.borderColor,
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Traffic light indicator */}
      <div className="flex gap-1.5">
        <motion.div 
          className={cn(
            "w-3 h-3 rounded-full transition-colors duration-300",
            level === 'green' ? 'bg-emerald-500' : 'bg-emerald-500/20'
          )}
          animate={level === 'green' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div 
          className={cn(
            "w-3 h-3 rounded-full transition-colors duration-300",
            level === 'amber' ? 'bg-amber-500' : 'bg-amber-500/20'
          )}
          animate={level === 'amber' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div 
          className={cn(
            "w-3 h-3 rounded-full transition-colors duration-300",
            level === 'red' ? 'bg-rose-500' : 'bg-rose-500/20'
          )}
          animate={level === 'red' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>

      {showLabel && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Icon className={cn("w-4 h-4", config.textColor)} />
            <span className={cn("text-sm font-medium", config.textColor)}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {config.description}
          </p>
        </div>
      )}

      {level === 'red' && onSuggestPause && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onSuggestPause}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium",
            "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 transition-colors"
          )}
        >
          Pausar
        </motion.button>
      )}
    </motion.div>
  );
}

// Compact version for inline use
export function ActivationDot({ 
  intensity, 
  intensityJump = 0,
  className,
}: { 
  intensity: number; 
  intensityJump?: number;
  className?: string;
}) {
  const level = getActivationLevel(intensity, intensityJump);
  const config = levelConfig[level];

  return (
    <motion.div
      className={cn("relative", className)}
      title={`${config.label}: ${config.description}`}
    >
      <div className={cn("w-3 h-3 rounded-full", config.color)} />
      {level === 'red' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-rose-500/50"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
