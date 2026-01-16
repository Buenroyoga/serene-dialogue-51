// ═══════════════════════════════════════════════════════════
// AUTOSAVE INDICATOR - Discrete feedback for autosave
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Cloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutosaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  className?: string;
  showTimestamp?: boolean;
}

export function AutosaveIndicator({ 
  isSaving = false, 
  lastSaved,
  className,
  showTimestamp = false,
}: AutosaveIndicatorProps) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (isSaving) {
      setStatus('saving');
      setShowSaved(false);
    } else if (lastSaved) {
      setStatus('saved');
      setShowSaved(true);
      
      // Hide after 2 seconds
      const timer = setTimeout(() => {
        setShowSaved(false);
        setStatus('idle');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <AnimatePresence mode="wait">
      {(status === 'saving' || showSaved) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "flex items-center gap-1.5 text-xs",
            status === 'saving' ? 'text-muted-foreground' : 'text-primary',
            className
          )}
        >
          {status === 'saving' ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="w-3 h-3" />
              </motion.div>
              <span>Guardado</span>
              {showTimestamp && lastSaved && (
                <span className="text-muted-foreground">
                  {formatTime(lastSaved)}
                </span>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing autosave state
export function useAutosave(
  saveFunction: () => void | Promise<void>,
  dependencies: unknown[],
  debounceMs: number = 1500
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveFunction();
        setLastSaved(new Date());
      } catch (error) {
        console.error('Autosave failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { isSaving, lastSaved };
}
