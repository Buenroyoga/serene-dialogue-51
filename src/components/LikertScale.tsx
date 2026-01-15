import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  labels?: { low: string; high: string };
}

export function LikertScale({ 
  value, 
  onChange, 
  labels = { low: 'Nunca', high: 'Siempre' } 
}: LikertScaleProps) {
  const options = [1, 2, 3, 4, 5];

  const getOptionColor = (opt: number) => {
    if (value === null) return '';
    if (value === opt) {
      switch (opt) {
        case 1: return 'bg-emerald-500 text-white shadow-emerald-500/40';
        case 2: return 'bg-teal-500 text-white shadow-teal-500/40';
        case 3: return 'bg-amber-500 text-white shadow-amber-500/40';
        case 4: return 'bg-orange-500 text-white shadow-orange-500/40';
        case 5: return 'bg-rose-500 text-white shadow-rose-500/40';
        default: return 'bg-primary text-primary-foreground';
      }
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
          {labels.low}
        </span>
        <span className="flex items-center gap-1">
          {labels.high}
          <span className="w-2 h-2 rounded-full bg-rose-500/60" />
        </span>
      </div>
      
      <div className="flex justify-between gap-3">
        {options.map((opt, index) => (
          <motion.button
            key={opt}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt)}
            className={cn(
              "flex-1 py-5 rounded-2xl font-bold text-xl transition-all duration-300 relative overflow-hidden",
              "border-2 hover:border-primary/50",
              value === opt 
                ? `${getOptionColor(opt)} shadow-lg border-transparent` 
                : "bg-card/50 backdrop-blur-sm border-border/50 text-muted-foreground hover:text-foreground hover:bg-card"
            )}
          >
            {/* Background glow effect */}
            {value === opt && (
              <motion.div
                layoutId="likert-glow"
                className="absolute inset-0 opacity-30"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <span className="relative z-10">{opt}</span>
            
            {/* Selection indicator */}
            {value === opt && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/50"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Visual intensity bar */}
      <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500/30 via-amber-500/30 to-rose-500/30 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
          initial={{ width: 0 }}
          animate={{ width: value ? `${(value / 5) * 100}%` : '0%' }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
