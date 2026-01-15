import { motion } from 'framer-motion';

interface BreathAnchorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BreathAnchor({ size = 'md', className = '' }: BreathAnchorProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-full mx-auto relative`}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: 'radial-gradient(circle at 30% 30%, hsl(35 85% 65% / 0.8), hsl(35 85% 45% / 0.4) 60%, transparent)',
          boxShadow: '0 0 40px hsl(35 85% 55% / 0.3), 0 0 80px hsl(35 85% 55% / 0.15)',
        }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: 'radial-gradient(circle, hsl(35 85% 55% / 0.2), transparent 70%)',
          }}
        />
      </motion.div>

      {/* Outer rings */}
      <motion.div
        className="absolute inset-0 -m-4 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        style={{
          border: '1px solid hsl(35 85% 55% / 0.3)',
        }}
      />
    </div>
  );
}