import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { actExercises, exerciseCategories, ACTExercise } from '@/lib/actExercises';
import { ProfileCategory, actProfiles } from '@/lib/actData';
import { Clock, ChevronDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExerciseLibraryProps {
  profile?: ProfileCategory;
  onClose?: () => void;
}

export function ExerciseLibrary({ profile, onClose }: ExerciseLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<ACTExercise['category'] | 'all'>('all');
  const [selectedProfile, setSelectedProfile] = useState<ProfileCategory | 'all'>(profile || 'all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const filteredExercises = actExercises.filter(ex => {
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesProfile = selectedProfile === 'all' || ex.profiles.includes(selectedProfile);
    return matchesCategory && matchesProfile;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Biblioteca de Ejercicios ACT</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredExercises.length} ejercicios disponibles
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Category Filter */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Categoría ACT
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              Todos
            </button>
            {Object.entries(exerciseCategories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as ACTExercise['category'])}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1",
                  selectedCategory === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                <span>{cat.emoji}</span>
                <span className="hidden sm:inline">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Filter */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Perfil ACT
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedProfile('all')}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                selectedProfile === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              Todos
            </button>
            {(Object.keys(actProfiles) as ProfileCategory[]).map(key => {
              const prof = actProfiles[key];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedProfile(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1",
                    selectedProfile === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  <span>{prof.emoji}</span>
                  <span>{prof.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredExercises.map((exercise) => {
            const category = exerciseCategories[exercise.category];
            const isExpanded = expandedExercise === exercise.id;

            return (
              <motion.div
                key={exercise.id}
                variants={itemVariants}
                layout
                className="glass-card rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                  className={`w-full p-5 text-left transition-all hover:bg-primary/5 bg-gradient-to-r ${category.color}`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{exercise.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{exercise.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-background/50">
                          {category.emoji} {category.name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exercise.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          {exercise.profiles.map(p => actProfiles[p].emoji).join(' ')}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-border/30">
                        <div className="pt-5 space-y-4">
                          {/* Steps */}
                          <div>
                            <h4 className="text-sm font-bold mb-3 text-primary">Pasos del ejercicio</h4>
                            <ol className="space-y-3">
                              {exercise.steps.map((step, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex gap-3"
                                >
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">
                                    {i + 1}
                                  </span>
                                  <span className="text-sm pt-0.5">{step}</span>
                                </motion.li>
                              ))}
                            </ol>
                          </div>

                          {/* Benefit */}
                          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="text-sm font-medium text-primary flex items-start gap-2">
                              <span className="text-lg">✨</span>
                              <span>{exercise.benefit}</span>
                            </p>
                          </div>

                          {/* Profiles this is good for */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Recomendado para:</span>
                            {exercise.profiles.map(p => (
                              <span key={p} className="px-2 py-1 rounded-full bg-muted flex items-center gap-1">
                                {actProfiles[p].emoji} {actProfiles[p].name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredExercises.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <p className="text-4xl mb-4">🔍</p>
            <p>No hay ejercicios que coincidan con los filtros seleccionados</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
