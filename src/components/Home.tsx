import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JourneyCard } from './JourneyCard';
import { BreathAnchor } from './BreathAnchor';
import { ExerciseLibrary } from './ExerciseLibrary';
import { Session } from '@/domain/types';
import { 
  Sparkles, 
  BookOpen, 
  X, 
  HelpCircle, 
  Brain, 
  Search, 
  Wand2,
  CheckCircle2,
  Circle,
  ChevronRight,
  Trophy,
  Target,
  Heart
} from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface HomeProps {
  session: Session;
  onStartProfile: () => void;
  onStartDiagnosis: () => void;
  onStartDialogue: () => void;
  onViewHistory: () => void;
  onHowItWorks?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

export function Home({ 
  session, 
  onStartProfile, 
  onStartDiagnosis, 
  onStartDialogue,
  onHowItWorks,
}: HomeProps) {
  const [showExercises, setShowExercises] = useState(false);
  
  const hasProfile = session.actProfile !== null;
  const hasDiagnosis = session.diagnosis !== null;
  const hasDialogue = session.dialogue.length > 0;

  // Calculate overall progress
  const progressData = useMemo(() => {
    let completed = 0;
    const total = 3;
    
    if (hasProfile) completed++;
    if (hasDiagnosis) completed++;
    if (hasDialogue) completed++;
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  }, [hasProfile, hasDiagnosis, hasDialogue]);

  // Determine current step
  const currentStep = useMemo(() => {
    if (!hasProfile) return 1;
    if (!hasDiagnosis) return 2;
    return 3;
  }, [hasProfile, hasDiagnosis]);

  const steps = [
    {
      id: 1,
      icon: Brain,
      title: 'Perfil ACT',
      subtitle: 'Descubre tu patrón',
      description: '24 preguntas para identificar cómo procesas tus experiencias internas.',
      completed: hasProfile,
      active: !hasProfile,
      action: onStartProfile,
      result: session.actProfile ? `${session.actProfile.profile} - ${session.actProfile.mixedProfile?.name || 'Puro'}` : null,
    },
    {
      id: 2,
      icon: Search,
      title: 'Diagnóstico',
      subtitle: 'Creencia nuclear',
      description: 'Identifica la creencia que pesa, sus emociones, disparadores y origen.',
      completed: hasDiagnosis,
      active: hasProfile && !hasDiagnosis,
      disabled: !hasProfile,
      action: hasProfile ? onStartDiagnosis : undefined,
      result: session.diagnosis?.coreBelief || null,
    },
    {
      id: 3,
      icon: Wand2,
      title: 'Transformación',
      subtitle: 'Ritual socrático',
      description: '6 fases de diálogo guiado por IA para disolver creencias limitantes.',
      completed: false,
      active: hasDiagnosis,
      disabled: !hasDiagnosis,
      action: hasDiagnosis ? onStartDialogue : undefined,
      result: hasDialogue ? `${session.dialogue.length} fases completadas` : null,
    },
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center p-4 md:p-8 overflow-hidden">
      {/* Ambient background */}
      <div className="ambient-bg" />
      
      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          style={{
            left: `${10 + i * 20}%`,
            top: `${15 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [-10, -80, -10],
            x: [0, 20, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div 
        className="relative z-10 w-full max-w-4xl pt-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <BreathAnchor size="md" className="mb-6" />
          
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            <span className="text-gradient">Diálogo Socrático Interior</span>
          </motion.h1>
          
          <motion.p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Transforma creencias con <span className="text-foreground">consciencia</span> y <span className="text-foreground">compasión</span>
          </motion.p>
        </motion.div>

        {/* Progress Overview Card */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  {progressData.percentage === 100 ? (
                    <Trophy className="w-5 h-5 text-primary" />
                  ) : (
                    <Target className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Tu Progreso</h3>
                  <p className="text-sm text-muted-foreground">
                    {progressData.completed} de {progressData.total} pasos completados
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gradient">{progressData.percentage}%</span>
              </div>
            </div>
            
            <Progress value={progressData.percentage} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex justify-between mt-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${step.completed 
                      ? 'bg-primary text-primary-foreground' 
                      : step.active 
                        ? 'bg-primary/20 text-primary border-2 border-primary' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {step.completed ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      hidden sm:block w-16 md:w-24 lg:w-32 h-0.5 mx-2 transition-colors
                      ${step.completed ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Journey Steps */}
        <motion.div variants={itemVariants} className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCurrentStep = currentStep === step.id;
            
            return (
              <motion.div
                key={step.id}
                className={`
                  glass-card p-5 transition-all duration-300 cursor-pointer
                  ${step.active ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/10' : ''}
                  ${step.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/40'}
                  ${step.completed ? 'border-primary/30' : ''}
                `}
                onClick={step.action}
                whileHover={!step.disabled ? { scale: 1.01, y: -2 } : {}}
                whileTap={!step.disabled ? { scale: 0.99 } : {}}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  {/* Step Icon */}
                  <div className={`
                    relative w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all
                    ${step.completed 
                      ? 'bg-primary/20' 
                      : step.active 
                        ? 'bg-gradient-to-br from-primary/30 to-secondary/20 animate-glow-pulse' 
                        : 'bg-muted/50'
                    }
                  `}>
                    <StepIcon className={`
                      w-6 h-6 transition-colors
                      ${step.completed ? 'text-primary' : step.active ? 'text-primary' : 'text-muted-foreground'}
                    `} />
                    
                    {/* Status badge */}
                    {step.completed && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    {step.active && !step.completed && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center animate-pulse">
                        <Circle className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">
                        Paso {step.id}
                      </span>
                      {step.completed && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Completado
                        </span>
                      )}
                      {isCurrentStep && !step.completed && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                          Actual
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {step.description}
                    </p>

                    {/* Result display */}
                    {step.result && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Resultado: </span>
                          <span className="text-foreground font-medium italic">
                            {step.id === 2 ? `"${step.result}"` : step.result}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action indicator */}
                  <div className={`
                    shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${step.active ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}
                  `}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Current Session Summary */}
        {(hasProfile || hasDiagnosis || hasDialogue) && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Resumen de Sesión</h3>
                  <p className="text-sm text-muted-foreground">Tu progreso guardado</p>
                </div>
              </div>
              
              <div className="grid gap-3">
                {session.actProfile && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                    <Brain className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Perfil ACT</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.actProfile.profile} - {session.actProfile.mixedProfile?.name || 'Puro'}
                      </p>
                    </div>
                  </div>
                )}
                
                {session.diagnosis && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                    <Search className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Creencia nuclear</p>
                      <p className="text-sm font-medium text-foreground italic truncate">
                        "{session.diagnosis.coreBelief}"
                      </p>
                    </div>
                  </div>
                )}
                
                {session.diagnosis?.emotionalHistory && session.diagnosis.emotionalHistory.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Emociones</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {session.diagnosis.emotionalHistory.slice(0, 4).map((emotion, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary"
                          >
                            {emotion}
                          </span>
                        ))}
                        {session.diagnosis.emotionalHistory.length > 4 && (
                          <span className="text-xs text-muted-foreground">
                            +{session.diagnosis.emotionalHistory.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-8">
          <Button
            onClick={() => setShowExercises(true)}
            variant="outline"
            className="h-auto py-4 px-4 border-primary/30 hover:border-primary/60 hover:bg-primary/5 group flex flex-col items-center gap-2"
          >
            <BookOpen className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Ejercicios ACT</span>
          </Button>
          
          {onHowItWorks && (
            <Button
              onClick={onHowItWorks}
              variant="outline"
              className="h-auto py-4 px-4 border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5 group flex flex-col items-center gap-2"
            >
              <HelpCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                ¿Cómo Funciona?
              </span>
            </Button>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center pb-8">
          <p className="text-xs text-muted-foreground">
            Un espacio seguro para la introspección y transformación
          </p>
        </motion.div>
      </motion.div>

      {/* Exercise Library Modal */}
      <AnimatePresence>
        {showExercises && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-b border-border/30">
              <h2 className="text-xl font-semibold text-gradient-subtle">Biblioteca de Ejercicios ACT</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExercises(false)}
                className="hover:bg-primary/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <ExerciseLibrary profile={session.actProfile?.profile} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
