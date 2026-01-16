import { motion } from 'framer-motion';
import { Lightbulb, Heart, Shield, Zap } from 'lucide-react';
import { DiagnosisData } from '@/domain/types';

interface SummaryCardProps {
  findings: string[];
  underlyingValue: string;
  diagnosis: DiagnosisData;
  actMicro: string;
}

export function SummaryCard({ 
  findings, 
  underlyingValue, 
  diagnosis, 
  actMicro 
}: SummaryCardProps) {
  return (
    <>
      {/* Key Findings Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Hallazgos Clave</h3>
        </div>
        <div className="space-y-3">
          {findings.slice(0, 2).map((finding, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-primary/5">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-sm text-muted-foreground">{finding.slice(0, 100)}...</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Underlying Value */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-card mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-rose-500" />
          <h3 className="font-semibold">Valor Subyacente</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Lo que realmente te importa debajo de esta lucha:
        </p>
        <p className="text-xl font-semibold text-primary">
          {underlyingValue}
        </p>
      </motion.div>

      {/* If-Then Plan Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold">Plan Si-Entonces</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Para cuando la creencia resurja:
        </p>
        {diagnosis.triggers.slice(0, 2).map((trigger, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-2">
            <div className="px-2 py-1 rounded bg-rose-500/10 text-rose-600 text-xs font-medium">
              SI
            </div>
            <span className="text-sm flex-1">{trigger}</span>
            <Zap className="w-4 h-4 text-primary" />
            <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 text-xs font-medium">
              ENTONCES
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          → Aplicar: {actMicro.slice(0, 50)}...
        </p>
      </motion.div>
    </>
  );
}
