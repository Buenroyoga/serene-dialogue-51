import { motion } from 'framer-motion';
import { Target, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommitmentInputProps {
  commitment: string;
  showInput: boolean;
  onShowInput: () => void;
  onCommitmentChange: (value: string) => void;
}

export function CommitmentInput({
  commitment,
  showInput,
  onShowInput,
  onCommitmentChange
}: CommitmentInputProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
      className="glass-card mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Tu Compromiso 24-48h</h3>
      </div>
      
      {!showInput ? (
        <Button
          variant="outline"
          onClick={onShowInput}
          className="w-full border-dashed border-primary/30 hover:border-primary/60"
        >
          <ChevronRight className="w-4 h-4 mr-2" />
          Definir un compromiso concreto
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            ¿Qué pequeña acción puedes hacer en las próximas 24-48 horas que honre tus valores?
          </p>
          <Textarea
            value={commitment}
            onChange={(e) => onCommitmentChange(e.target.value)}
            placeholder="Ej: Cuando sienta la urgencia de evitar, haré 3 respiraciones conscientes antes de decidir..."
            className="min-h-[100px]"
          />
          {commitment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-emerald-600"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Compromiso guardado</span>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
