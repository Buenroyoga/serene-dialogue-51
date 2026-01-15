import { motion } from 'framer-motion';
import { ProfileResult as ProfileResultType, actProfiles } from '@/lib/actData';
import { getExercisesForProfile, exerciseCategories, ACTExercise } from '@/lib/actExercises';
import { Button } from '@/components/ui/button';
import { BreathAnchor } from './BreathAnchor';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ProfileResultProps {
  result: ProfileResultType;
  onContinue: () => void;
}

export function ProfileResultDisplay({ result, onContinue }: ProfileResultProps) {
  const primaryProfile = actProfiles[result.profile];
  const secondaryProfile = result.secondaryProfile ? actProfiles[result.secondaryProfile] : null;
  const recommendedExercises = getExercisesForProfile(result.profile).slice(0, 4);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <BreathAnchor />
        <h2 className="text-3xl font-bold mt-6 mb-2 tracking-tight">Tu Perfil ACT</h2>
        <p className="text-muted-foreground">Resultado de tu evaluación interior</p>
      </motion.div>

      {/* Primary Profile Card */}
      <motion.div 
        variants={itemVariants}
        className="glass-card p-8 rounded-3xl text-center relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="text-7xl mb-4"
          >
            {primaryProfile.emoji}
          </motion.div>
          <h3 className="text-3xl font-bold mb-2">Perfil {primaryProfile.name}</h3>
          <p className="text-muted-foreground mb-4">{primaryProfile.description}</p>
          <p className="text-sm leading-relaxed max-w-md mx-auto">{primaryProfile.fullDescription}</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Mixed Profile */}
      {result.mixedProfile && secondaryProfile && (
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <motion.span 
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl"
            >
              {result.mixedProfile.emoji}
            </motion.span>
            <div className="flex-1">
              <h4 className="font-bold text-lg">{result.mixedProfile.name}</h4>
              <p className="text-sm text-muted-foreground">{result.mixedProfile.description}</p>
              <p className="text-xs text-primary mt-1">
                También muestras características del perfil {secondaryProfile.name} {secondaryProfile.emoji}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scores Distribution */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Distribución de tu perfil
        </h4>
        <div className="space-y-4">
          {(Object.entries(result.scores) as [keyof typeof actProfiles, number][])
            .sort(([, a], [, b]) => b - a)
            .map(([key, score], index) => {
              const profile = actProfiles[key];
              const maxScore = 30;
              const percentage = (score / maxScore) * 100;
              const isTop = index === 0;
              
              return (
                <motion.div 
                  key={key} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm items-center">
                    <span className={`flex items-center gap-2 ${isTop ? 'font-bold' : ''}`}>
                      <span className="text-lg">{profile.emoji}</span> 
                      {profile.name}
                      {isTop && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Principal</span>}
                    </span>
                    <span className="text-muted-foreground font-mono">{score}/30</span>
                  </div>
                  <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${isTop ? 'bg-primary' : 'bg-primary/40'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
          })}
        </div>
      </motion.div>

      {/* ACT Micro-intervention */}
      <motion.div 
        variants={itemVariants}
        className="glass-card p-6 rounded-2xl border-l-4 border-primary bg-gradient-to-r from-primary/10 to-transparent"
      >
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <span className="text-xl">🌟</span>
          Microintervención ACT recomendada
        </h4>
        <p className="text-primary font-medium text-lg mb-3">{primaryProfile.actMicro}</p>
        <p className="text-sm text-muted-foreground">
          Tono recomendado: <span className="text-foreground font-medium">{primaryProfile.tone}</span>
        </p>
      </motion.div>

      {/* Recommended Exercises */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <span className="text-xl">🎯</span>
          Ejercicios recomendados para ti
        </h4>
        
        <div className="grid gap-3">
          {recommendedExercises.map((exercise, index) => {
            const category = exerciseCategories[exercise.category];
            const isExpanded = expandedExercise === exercise.id;
            
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                  className={`w-full p-4 text-left transition-all hover:bg-primary/5 bg-gradient-to-r ${category.color}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{exercise.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold truncate">{exercise.name}</h5>
                      <p className="text-sm text-muted-foreground truncate">{exercise.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {exercise.duration}
                    </div>
                  </div>
                </button>
                
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 border-t border-border/50"
                  >
                    <div className="pt-4 space-y-3">
                      <div>
                        <h6 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pasos</h6>
                        <ol className="space-y-2">
                          {exercise.steps.map((step, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="pt-2 border-t border-border/30">
                        <p className="text-xs text-primary font-medium">
                          ✨ {exercise.benefit}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.div variants={itemVariants}>
        <Button 
          onClick={onContinue}
          className="w-full py-6 text-lg gap-2 group"
          size="lg"
        >
          Continuar al Diagnóstico Profundo
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
