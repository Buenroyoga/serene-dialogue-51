import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DiagnosisData, DialogueEntry } from '@/hooks/useSession';
import { ProfileResult, actProfiles, socraticRitual } from '@/lib/actData';
import { Home, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreathAnchor } from './BreathAnchor';

interface RitualCompleteProps {
  actProfile: ProfileResult;
  diagnosis: DiagnosisData;
  dialogueEntries: DialogueEntry[];
  finalIntensity: number;
  onHome: () => void;
  onNewRitual: () => void;
}

export function RitualComplete({
  actProfile,
  diagnosis,
  dialogueEntries,
  finalIntensity,
  onHome,
  onNewRitual
}: RitualCompleteProps) {
  const profile = actProfiles[actProfile.profile];
  const intensityDrop = diagnosis.intensity - finalIntensity;
  const percentDrop = Math.round((intensityDrop / diagnosis.intensity) * 100);

  const getTransformationMessage = () => {
    if (percentDrop >= 70) {
      return {
        emoji: '🌟',
        title: 'Transformación Profunda',
        message: 'Has logrado una liberación significativa. El espacio interior que has creado es invaluable.'
      };
    } else if (percentDrop >= 40) {
      return {
        emoji: '✨',
        title: 'Cambio Notable',
        message: 'La creencia ha perdido fuerza. Cada paso hacia la consciencia cuenta.'
      };
    } else if (percentDrop > 0) {
      return {
        emoji: '🌱',
        title: 'Semilla de Cambio',
        message: 'Has comenzado el proceso. Las transformaciones profundas necesitan tiempo.'
      };
    } else {
      return {
        emoji: '💎',
        title: 'Proceso en Curso',
        message: 'La consciencia que has traído es el primer paso. Este trabajo requiere paciencia.'
      };
    }
  };

  const transformation = getTransformationMessage();

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      <div className="ambient-bg" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-2xl mx-auto p-6 flex flex-col flex-1"
      >
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
                {diagnosis.intensity}
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

        {/* Belief Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">{profile.emoji}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Creencia trabajada • Perfil {profile.name}
              </p>
              <p className="text-foreground font-medium text-lg italic">
                "{diagnosis.coreBelief}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Phases Completed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card mb-6"
        >
          <h3 className="font-semibold mb-4">Fases Completadas</h3>
          <div className="grid grid-cols-3 gap-3">
            {socraticRitual.map((phase) => {
              const entry = dialogueEntries.find(e => e.phaseId === phase.id);
              return (
                <motion.div 
                  key={phase.id}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                    entry ? "bg-primary/5" : "opacity-40"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-2xl">{phase.emoji}</span>
                  <span className="text-xs text-center text-muted-foreground">{phase.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ACT Practice */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card mb-8 border border-primary/20"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🧘</span>
            Tu Práctica ACT
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.actMicro}
          </p>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Usa esta técnica cuando la creencia resurja en tu día a día.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3 mt-auto"
        >
          <Button 
            onClick={onHome}
            className="btn-ritual w-full"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al Inicio
          </Button>
          
          <Button 
            onClick={onNewRitual}
            variant="outline"
            className="w-full py-6 border-border/50 hover:border-primary/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Trabajar Otra Creencia
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}