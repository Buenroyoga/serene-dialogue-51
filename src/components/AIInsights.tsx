import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Brain, TrendingUp, TrendingDown, Minus, Target, AlertTriangle,
  Lightbulb, Loader2, Sparkles, BarChart3, Calendar, Activity
} from 'lucide-react';
import { JournalEntry, Streak, DBSession } from '@/hooks/useUserData';

interface PatternAnalysis {
  overallMood: {
    average: number;
    trend: 'improving' | 'declining' | 'stable';
    description: string;
  };
  patterns: Array<{
    type: 'emotion' | 'trigger' | 'correlation' | 'time';
    title: string;
    description: string;
    frequency: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  correlations: Array<{
    factor1: string;
    factor2: string;
    relationship: 'positiva' | 'negativa';
    strength: 'débil' | 'moderada' | 'fuerte';
    insight: string;
  }>;
  predictions: Array<{
    type: 'warning' | 'opportunity';
    message: string;
    confidence: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: 'ejercicio' | 'hábito' | 'reflexión' | 'profesional';
    title: string;
    description: string;
    actExercise?: string;
  }>;
  weeklyGoalSuggestions: Array<{
    title: string;
    description: string;
    targetCount: number;
    reasoning: string;
  }>;
}

interface AIInsightsProps {
  journalEntries: JournalEntry[];
  sessions?: DBSession[];
  streaks?: Streak[];
  onClose: () => void;
  onCreateGoal?: (goal: { title: string; description: string; target_count: number }) => void;
}

export function AIInsights({ journalEntries, sessions, streaks, onClose, onCreateGoal }: AIInsightsProps) {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePatterns = async () => {
    if (journalEntries.length < 3) {
      toast.error('Necesitas al menos 3 entradas en el diario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-patterns', {
        body: {
          journalEntries,
          sessions: sessions?.slice(0, 10),
          streaks
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalysis(data.analysis);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error analizando patrones';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-destructive" />;
      default: return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge variant="secondary">Media</Badge>;
      default: return <Badge variant="outline">Baja</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Análisis de Patrones con IA
            </CardTitle>
            <CardDescription>
              Insights personalizados basados en {journalEntries.length} entradas del diario
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!analysis && !loading && (
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Descubre tus patrones emocionales</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  La IA analizará tus entradas del diario para identificar patrones, 
                  correlaciones y generar recomendaciones personalizadas.
                </p>
                <Button onClick={analyzePatterns} size="lg" className="mt-4">
                  <Brain className="w-4 h-4 mr-2" />
                  Analizar mis patrones
                </Button>
                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}
              </div>
            )}

            {loading && (
              <div className="text-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground">Analizando tus patrones emocionales...</p>
              </div>
            )}

            {analysis && (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Overall Mood */}
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="w-6 h-6 text-primary" />
                          <div>
                            <h4 className="font-semibold">Estado General</h4>
                            <p className="text-sm text-muted-foreground">Promedio: {analysis.overallMood.average.toFixed(1)}/10</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(analysis.overallMood.trend)}
                          <span className="capitalize">{
                            analysis.overallMood.trend === 'improving' ? 'Mejorando' :
                            analysis.overallMood.trend === 'declining' ? 'Declinando' : 'Estable'
                          }</span>
                        </div>
                      </div>
                      <Progress value={analysis.overallMood.average * 10} className="h-3" />
                      <p className="mt-3 text-sm">{analysis.overallMood.description}</p>
                    </CardContent>
                  </Card>

                  {/* Patterns */}
                  {analysis.patterns.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Patrones Identificados
                      </h4>
                      <div className="grid gap-3">
                        {analysis.patterns.map((pattern, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-4 rounded-lg border ${getSeverityColor(pattern.severity)}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-medium">{pattern.title}</h5>
                                <p className="text-sm mt-1">{pattern.description}</p>
                                <span className="text-xs opacity-70">{pattern.frequency}</span>
                              </div>
                              <Badge variant="outline" className="capitalize">{pattern.type}</Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Predictions */}
                  {analysis.predictions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Predicciones y Alertas
                      </h4>
                      <div className="grid gap-3">
                        {analysis.predictions.map((pred, i) => (
                          <Card key={i} className={pred.type === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-green-500/30 bg-green-500/5'}>
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                {pred.type === 'warning' ? (
                                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                                ) : (
                                  <Lightbulb className="w-5 h-5 text-green-500 mt-0.5" />
                                )}
                                <div>
                                  <p className="font-medium">{pred.message}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{pred.recommendation}</p>
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    Confianza: {pred.confidence === 'high' ? 'Alta' : pred.confidence === 'medium' ? 'Media' : 'Baja'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Recomendaciones Personalizadas
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {analysis.recommendations.map((rec, i) => (
                          <Card key={i} className="border-primary/20">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium">{rec.title}</h5>
                                {getPriorityBadge(rec.priority)}
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                              {rec.actExercise && (
                                <Badge variant="secondary" className="mt-2">
                                  Ejercicio: {rec.actExercise}
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Goal Suggestions */}
                  {analysis.weeklyGoalSuggestions.length > 0 && onCreateGoal && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Objetivos Sugeridos
                      </h4>
                      <div className="grid gap-3">
                        {analysis.weeklyGoalSuggestions.map((goal, i) => (
                          <Card key={i} className="border-primary/20 hover:border-primary/40 transition-colors">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium">{goal.title}</h5>
                                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                                  <p className="text-xs text-primary mt-2">Meta: {goal.targetCount} veces</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onCreateGoal({
                                    title: goal.title,
                                    description: goal.description,
                                    target_count: goal.targetCount
                                  })}
                                >
                                  Crear meta
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    <Button onClick={analyzePatterns}>
                      <Brain className="w-4 h-4 mr-2" />
                      Volver a analizar
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
