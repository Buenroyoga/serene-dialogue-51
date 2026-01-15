import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
  showSteps?: boolean;
}

export function ProgressIndicator({ current, total, className, showSteps = false }: ProgressIndicatorProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with counter and percentage */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-medium">
          Pregunta <span className="text-foreground font-bold">{current}</span> de {total}
        </span>
        <motion.span 
          key={percentage}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-primary font-bold"
        >
          {Math.round(percentage)}%
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-foreground/20"
              style={{ left: `${((i + 1) / total) * 100}%` }}
            />
          ))}
        </div>
        
        {/* Progress fill */}
        <motion.div 
          className="h-full rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)/0.8))'
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>

      {/* Step indicators (optional) */}
      {showSteps && (
        <div className="flex justify-between mt-2">
          {Array.from({ length: total }).map((_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < current;
            const isCurrent = stepNum === current;
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  stepNum
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
