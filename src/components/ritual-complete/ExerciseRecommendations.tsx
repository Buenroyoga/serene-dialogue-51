import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACTExercise, exerciseCategories } from '@/lib/actExercises';

interface ExerciseRecommendationsProps {
  exercises: ACTExercise[];
  onShowAll: () => void;
}

export function ExerciseRecommendations({ 
  exercises, 
  onShowAll 
}: ExerciseRecommendationsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="glass-card mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Ejercicios Recomendados
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowAll}
          className="text-xs text-primary hover:text-primary/80"
        >
          Ver todos
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75 + index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
            onClick={onShowAll}
          >
            <span className="text-xl">{exercise.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{exercise.name}</p>
              <p className="text-xs text-muted-foreground">{exercise.duration}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-muted">
              {exerciseCategories[exercise.category].emoji}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
