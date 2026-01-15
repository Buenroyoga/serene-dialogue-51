import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JourneyCard } from './JourneyCard';
import { BreathAnchor } from './BreathAnchor';
import { ExerciseLibrary } from './ExerciseLibrary';
import { Session } from '@/hooks/useSession';
import { ArrowDown, Sparkles, BookOpen, X } from 'lucide-react';
import { Button } from './ui/button';

interface HomeProps {
  session: Session;
  onStartProfile: () => void;
  onStartDiagnosis: () => void;
  onStartDialogue: () => void;
  onViewHistory: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  },
};

export function Home({ 
  session, 
  onStartProfile, 
  onStartDiagnosis, 
  onStartDialogue,
}: HomeProps) {
  const [showExercises, setShowExercises] = useState(false);
  const hasProfile = session.actProfile !== null;
  const hasDiagnosis = session.diagnosis !== null;

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 md:p-8 overflow-hidden">
      {/* Ambient background */}
      <div className="ambient-bg" />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-20, -120, -20],
            x: [0, 30, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            delay: i * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div 
        className="relative z-10 w-full max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <BreathAnchor size="lg" className="mb-8" />
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            <span className="text-gradient-subtle">Diálogo Socrático</span>
            <br />
            <span className="text-gradient">Interior</span>
          </motion.h1>
          
          <motion.p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Transforma las creencias que pesan en tu corazón con 
            <span className="text-foreground"> consciencia </span> 
            y <span className="text-foreground">compasión</span>
          </motion.p>
        </motion.div>

        {/* Journey Path Visualization */}
        <motion.div variants={itemVariants} className="glass-card mb-12 p-8">
          <h3 className="text-xl font-semibold text-center mb-8 text-gradient-subtle">
            El Camino de Transformación
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
            {/* Step 1 */}
            <motion.div 
              className="flex flex-col items-center text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className={`phase-orb ${hasProfile ? 'completed' : !hasProfile ? 'active' : ''}`}>
                🧠
              </div>
              <span className="mt-3 font-medium text-sm">Perfil ACT</span>
              <span className="text-xs text-muted-foreground">Descubre tu patrón</span>
            </motion.div>

            {/* Connector */}
            <motion.div 
              className="hidden md:block w-16"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="divider-glow" />
            </motion.div>
            <motion.div className="md:hidden" animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowDown className="w-5 h-5 text-primary/50" />
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="flex flex-col items-center text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className={`phase-orb ${hasDiagnosis ? 'completed' : hasProfile ? 'active' : ''}`}>
                🔍
              </div>
              <span className="mt-3 font-medium text-sm">Diagnóstico</span>
              <span className="text-xs text-muted-foreground">Creencia nuclear</span>
            </motion.div>

            {/* Connector */}
            <motion.div 
              className="hidden md:block w-16"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="divider-glow" />
            </motion.div>
            <motion.div className="md:hidden" animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}>
              <ArrowDown className="w-5 h-5 text-primary/50" />
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="flex flex-col items-center text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className={`phase-orb ${hasDiagnosis ? 'active' : ''}`}>
                ✨
              </div>
              <span className="mt-3 font-medium text-sm">Transformación</span>
              <span className="text-xs text-muted-foreground">Ritual socrático</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <JourneyCard
              emoji="🧠"
              title="Descubre tu Perfil ACT"
              description="24 preguntas para identificar cómo procesas tus experiencias internas y cuál es la mejor intervención para ti."
              onClick={onStartProfile}
              active={!hasProfile}
              completed={hasProfile}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <JourneyCard
              emoji="🔍"
              title="Diagnóstico Profundo"
              description="Identifica tu creencia nuclear, las emociones que la acompañan, sus disparadores y su origen."
              onClick={hasProfile ? onStartDiagnosis : undefined}
              active={hasProfile && !hasDiagnosis}
              completed={hasDiagnosis}
              disabled={!hasProfile}
            />
          </motion.div>
        </div>

        {/* Dialogue Card - Full Width */}
        <motion.div variants={itemVariants} className="mb-10">
          <JourneyCard
            emoji="✨"
            title="Ritual de Transformación"
            description="6 fases de diálogo socrático guiado por IA para disolver el peso de tus creencias limitantes con preguntas personalizadas."
            onClick={hasDiagnosis ? onStartDialogue : undefined}
            active={hasDiagnosis}
            disabled={!hasDiagnosis}
          />
        </motion.div>

        {/* Session Info */}
        {hasProfile && (
          <motion.div 
            variants={itemVariants}
            className="glass-card"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Tu sesión actual</h4>
                <div className="space-y-1.5 text-sm">
                  {session.actProfile && (
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Perfil:</span>{' '}
                      {session.actProfile.profile} - {session.actProfile.mixedProfile?.name || 'Puro'}
                    </p>
                  )}
                  {session.diagnosis && (
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Creencia:</span>{' '}
                      <span className="italic">"{session.diagnosis.coreBelief}"</span>
                    </p>
                  )}
                  {session.dialogue.length > 0 && (
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Progreso:</span>{' '}
                      {session.dialogue.length} fases completadas
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exercise Library Button */}
        <motion.div variants={itemVariants} className="mb-8">
          <Button
            onClick={() => setShowExercises(true)}
            variant="outline"
            className="w-full py-6 border-primary/30 hover:border-primary/60 hover:bg-primary/5 group"
          >
            <BookOpen className="w-5 h-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-gradient-subtle font-semibold">Explorar Biblioteca de Ejercicios ACT</span>
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div 
          variants={itemVariants}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
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