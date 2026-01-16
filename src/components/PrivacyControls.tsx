// ═══════════════════════════════════════════════════════════
// PRIVACY CONTROLS - Data management options
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Trash2, 
  Clock, 
  Lock, 
  Unlock,
  AlertTriangle,
  X 
} from 'lucide-react';
import { PrivacyMode } from '@/domain/types';
import { cn } from '@/lib/utils';

interface PrivacyControlsProps {
  currentMode: PrivacyMode;
  hasProgress: boolean;
  onModeChange: (mode: PrivacyMode) => void;
  onDeleteNow: () => void;
  className?: string;
}

export function PrivacyControls({
  currentMode,
  hasProgress,
  onModeChange,
  onDeleteNow,
  className,
}: PrivacyControlsProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeleteNow = () => {
    if (showConfirmDelete) {
      onDeleteNow();
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  const modes = [
    {
      id: 'persist' as PrivacyMode,
      icon: Unlock,
      label: 'Normal',
      description: 'Se guarda hasta 7 días',
    },
    {
      id: 'session' as PrivacyMode,
      icon: Clock,
      label: 'Sesión',
      description: 'Se elimina al cerrar',
    },
    {
      id: 'private' as PrivacyMode,
      icon: Lock,
      label: 'Privado',
      description: 'No se guarda nada',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("", className)}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Privacidad</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 z-50"
          >
            <div className="glass-card p-4 w-64 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">
                  Control de Privacidad
                </h4>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2 mb-4">
                {modes.map(mode => {
                  const Icon = mode.icon;
                  const isActive = currentMode === mode.id;
                  
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onModeChange(mode.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                        isActive 
                          ? "bg-primary/10 border border-primary/30" 
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          isActive ? "text-primary" : "text-foreground"
                        )}>
                          {mode.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mode.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Delete Button */}
              {hasProgress && (
                <div className="pt-3 border-t border-border/30">
                  <Button
                    onClick={handleDeleteNow}
                    variant={showConfirmDelete ? "destructive" : "ghost"}
                    size="sm"
                    className="w-full"
                  >
                    {showConfirmDelete ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Confirmar eliminación
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Borrar datos ahora
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
