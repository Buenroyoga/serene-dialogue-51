import { memo } from 'react';
import { motion } from 'framer-motion';
import { BreathAnchor } from '../BreathAnchor';
import { TransformationResult } from './types';

interface TransformationMetricsProps {
  transformation: TransformationResult;
  initialIntensity: number;
  finalIntensity: number;
  intensityDrop: number;
  percentDrop: number;
}

export const TransformationMetrics = memo(function TransformationMetrics({
  transformation,
  initialIntensity,
  finalIntensity,
  intensityDrop,
  percentDrop
}: TransformationMetricsProps) {
  return (
    <>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-10"
      >
        <BreathAnchor size="lg" className="mb-6" />
        <motion.div 
          className="text-7xl mb-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {transformation.emoji}
        </motion.div>
        <h1 className="text-3xl font-bold text-gradient-subtle mb-3">
          {transformation.title}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {transformation.message}
        </p>
      </motion.div>

      {/* Intensity Comparison */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card mb-6"
      >
        <h3 className="font-semibold mb-6 text-center text-lg">Tu Recorrido</h3>
        
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-muted-foreground">
              {initialIntensity}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Antes</div>
          </div>
          
          <motion.div 
            className="text-3xl text-primary"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient">
              {finalIntensity}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Ahora</div>
          </div>
        </div>

        {intensityDrop > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 rounded-xl"
            style={{ background: 'linear-gradient(135deg, hsl(35 85% 55% / 0.15), hsl(270 50% 60% / 0.1))' }}
          >
            <span className="text-primary font-semibold text-lg">
              ✨ -{intensityDrop} puntos ({percentDrop}% de reducción)
            </span>
          </motion.div>
        )}
      </motion.div>
    </>
  );
});
