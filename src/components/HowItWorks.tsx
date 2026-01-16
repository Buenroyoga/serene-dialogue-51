// ═══════════════════════════════════════════════════════════
// HOW IT WORKS - Instructions and app overview screen
// ═══════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Brain, 
  Search, 
  Sparkles, 
  Shield, 
  Heart,
  Clock,
  Lock,
  Zap
} from 'lucide-react';

interface HowItWorksProps {
  onBack: () => void;
  onStart: () => void;
}

const steps = [
  {
    icon: Brain,
    title: 'Test de Perfil ACT',
    description: '24 preguntas para identificar tu patrón de procesamiento interno (Cognitivo, Emocional, Somático o Narrativo).',
    duration: '~5 min',
    emoji: '🧠',
  },
  {
    icon: Search,
    title: 'Diagnóstico Profundo',
    description: 'Identifica tu creencia nuclear, las emociones asociadas, disparadores y origen de la creencia.',
    duration: '~5 min',
    emoji: '🔍',
  },
  {
    icon: Sparkles,
    title: 'Ritual de Transformación',
    description: 'Diálogo socrático guiado con preguntas personalizadas por IA para transformar tu creencia limitante.',
    duration: '10-25 min',
    emoji: '✨',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Espacio Seguro',
    description: 'Detección de crisis con recursos de ayuda inmediata',
  },
  {
    icon: Heart,
    title: 'Pausas Somáticas',
    description: 'Ejercicios de regulación cuando la intensidad sube',
  },
  {
    icon: Clock,
    title: 'Ritual Corto o Completo',
    description: 'Elige 3 fases (5-10 min) o 6 fases (15-25 min)',
  },
  {
    icon: Lock,
    title: 'Privacidad Total',
    description: 'Tus datos se guardan localmente. Modo privado disponible.',
  },
];

export function HowItWorks({ onBack, onStart }: HowItWorksProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col p-6">
      {/* Ambient background */}
      <div className="ambient-bg" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl mx-auto"
      >
        {/* Back button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            📖
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-subtle mb-3">
            ¿Cómo Funciona?
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Una guía basada en la Terapia de Aceptación y Compromiso (ACT) 
            para transformar creencias limitantes con consciencia y compasión.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            El Proceso
          </h2>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-5 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{step.emoji}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.duration}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Características
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-sm text-foreground">{feature.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Important notes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5 mb-8 border-primary/30"
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Importante
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Esta herramienta es para autoexploración y <strong>no sustituye terapia profesional</strong>.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Si estás en crisis, hay recursos de ayuda disponibles dentro de la app.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Puedes pausar en cualquier momento y retomar donde lo dejaste.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Tus datos son privados y se guardan solo en tu dispositivo.
            </li>
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center gap-4"
        >
          <Button 
            onClick={onStart}
            size="lg"
            className="w-full max-w-md gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Comenzar el Proceso
          </Button>
          <p className="text-xs text-muted-foreground">
            ~15-35 minutos para el proceso completo
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
