// ═══════════════════════════════════════════════════════════
// METRICS CHART - Visualization of intensity and ACT metrics
// ═══════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Activity, Brain, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsData {
  intensity: number;
  cognitiveFusion?: number;
  avoidanceUrgency?: number;
}

interface MetricsChartProps {
  initial: MetricsData;
  final: MetricsData;
  showDetails?: boolean;
  className?: string;
}

export function MetricsChart({ initial, final, showDetails = true, className }: MetricsChartProps) {
  const intensityChange = initial.intensity - final.intensity;
  
  const getChangeIndicator = (change: number) => {
    if (change > 0) return { icon: TrendingDown, color: 'text-green-500', label: 'Reducción' };
    if (change < 0) return { icon: TrendingUp, color: 'text-red-500', label: 'Aumento' };
    return { icon: Minus, color: 'text-muted-foreground', label: 'Sin cambio' };
  };

  const indicator = getChangeIndicator(intensityChange);
  const Icon = indicator.icon;

  return (
    <div className={cn("glass-card p-6", className)}>
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Evolución de Métricas
      </h4>

      {/* Main Intensity Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Intensidad</span>
          <div className={cn("flex items-center gap-1 text-sm font-medium", indicator.color)}>
            <Icon className="w-4 h-4" />
            <span>{Math.abs(intensityChange)} puntos</span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-3">
          {/* Before */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-16">Antes</span>
            <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${initial.intensity * 10}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, 
                    hsl(var(--primary) / 0.3) 0%, 
                    ${initial.intensity > 7 ? 'rgb(239 68 68)' : initial.intensity > 4 ? 'rgb(251 191 36)' : 'rgb(34 197 94)'} 100%
                  )`,
                }}
              />
            </div>
            <span className="text-lg font-bold w-8 text-right">{initial.intensity}</span>
          </div>

          {/* After */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-16">Después</span>
            <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${final.intensity * 10}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, 
                    hsl(var(--primary) / 0.3) 0%, 
                    ${final.intensity > 7 ? 'rgb(239 68 68)' : final.intensity > 4 ? 'rgb(251 191 36)' : 'rgb(34 197 94)'} 100%
                  )`,
                }}
              />
            </div>
            <span className="text-lg font-bold w-8 text-right">{final.intensity}</span>
          </div>
        </div>
      </div>

      {/* Additional Metrics (if available and showDetails) */}
      {showDetails && (initial.cognitiveFusion !== undefined || initial.avoidanceUrgency !== undefined) && (
        <div className="pt-4 border-t border-border/30 space-y-4">
          {initial.cognitiveFusion !== undefined && final.cognitiveFusion !== undefined && (
            <MetricRow 
              icon={Brain}
              label="Fusión Cognitiva"
              initial={initial.cognitiveFusion}
              final={final.cognitiveFusion}
            />
          )}
          
          {initial.avoidanceUrgency !== undefined && final.avoidanceUrgency !== undefined && (
            <MetricRow 
              icon={Shield}
              label="Evitación/Urgencia"
              initial={initial.avoidanceUrgency}
              final={final.avoidanceUrgency}
            />
          )}
        </div>
      )}

      {/* Summary Message */}
      {intensityChange > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-4 p-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-sm text-center"
        >
          ¡Has reducido la intensidad en {intensityChange} {intensityChange === 1 ? 'punto' : 'puntos'}! 🎉
        </motion.div>
      )}
    </div>
  );
}

interface MetricRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  initial: number;
  final: number;
}

function MetricRow({ icon: Icon, label, initial, final }: MetricRowProps) {
  const change = initial - final;
  const isPositive = change > 0;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm">{initial}</span>
        <span className="text-muted-foreground">→</span>
        <span className={cn(
          "text-sm font-medium",
          isPositive ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
        )}>
          {final}
        </span>
        {change !== 0 && (
          <span className={cn(
            "text-xs",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            ({isPositive ? '-' : '+'}{Math.abs(change)})
          </span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MINI CHART - For history cards
// ═══════════════════════════════════════════════════════════

interface MiniMetricsProps {
  initial: number;
  final: number;
  className?: string;
}

export function MiniMetrics({ initial, final, className }: MiniMetricsProps) {
  const change = initial - final;
  const percentage = Math.round(((initial - final) / initial) * 100);
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <div 
          className="w-8 h-2 rounded-full bg-muted/50"
          style={{
            background: `linear-gradient(90deg, 
              ${initial > 7 ? 'rgb(239 68 68 / 0.5)' : initial > 4 ? 'rgb(251 191 36 / 0.5)' : 'rgb(34 197 94 / 0.5)'} 0%,
              transparent 100%
            )`,
          }}
        />
        <span className="text-xs text-muted-foreground">{initial}</span>
      </div>
      
      <span className="text-muted-foreground text-xs">→</span>
      
      <div className="flex items-center gap-1">
        <div 
          className="w-8 h-2 rounded-full bg-muted/50"
          style={{
            background: `linear-gradient(90deg, 
              ${final > 7 ? 'rgb(239 68 68 / 0.5)' : final > 4 ? 'rgb(251 191 36 / 0.5)' : 'rgb(34 197 94 / 0.5)'} 0%,
              transparent 100%
            )`,
          }}
        />
        <span className="text-xs font-medium">{final}</span>
      </div>
      
      {change > 0 && (
        <span className="text-xs text-green-500 font-medium">
          -{percentage}%
        </span>
      )}
    </div>
  );
}
