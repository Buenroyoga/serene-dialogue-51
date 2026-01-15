import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyCardProps {
  emoji: string;
  title: string;
  description: string;
  onClick?: () => void;
  active?: boolean;
  completed?: boolean;
  disabled?: boolean;
  className?: string;
}

export function JourneyCard({ 
  emoji, 
  title, 
  description, 
  onClick, 
  active = false,
  completed = false,
  disabled = false,
  className 
}: JourneyCardProps) {
  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { y: -6, scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={cn(
        "glass-card relative overflow-hidden group",
        active && "status-active",
        completed && "status-complete",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      {/* Background gradient on hover */}
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at 50% 0%, hsl(35 85% 55% / 0.1), transparent 70%)',
        }}
      />

      {/* Completed checkmark */}
      {completed && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-primary" />
        </motion.div>
      )}

      {/* Emoji with glow */}
      <motion.div 
        className="relative text-5xl mb-5"
        animate={active ? { 
          scale: [1, 1.1, 1],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="relative z-10">{emoji}</span>
        {active && (
          <motion.div 
            className="absolute inset-0 blur-xl opacity-50"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {emoji}
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-gradient transition-all">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Active indicator line */}
      {active && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{
            background: 'linear-gradient(90deg, hsl(35 85% 55%), hsl(270 50% 60%))',
          }}
        />
      )}
    </motion.div>
  );
}