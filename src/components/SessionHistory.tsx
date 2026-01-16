// ═══════════════════════════════════════════════════════════
// SESSION HISTORY - Local library of completed sessions
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Trash2, 
  Calendar, 
  TrendingDown, 
  Sparkles,
  BookOpen,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CompletedSession } from '@/domain/types';
import { actProfiles } from '@/lib/actData';
import { cn } from '@/lib/utils';

interface SessionHistoryProps {
  history: CompletedSession[];
  onSearch: (query: string) => CompletedSession[];
  onDelete: (sessionId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export function SessionHistory({
  history,
  onSearch,
  onDelete,
  isExpanded = false,
  onToggleExpand,
  className,
}: SessionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    return searchQuery.trim() ? onSearch(searchQuery) : history;
  }, [searchQuery, history, onSearch]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = (sessionId: string) => {
    if (confirmDelete === sessionId) {
      onDelete(sessionId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(sessionId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-card", className)}
    >
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <div className="text-left">
            <h3 className="font-semibold text-foreground">
              Tu Biblioteca
            </h3>
            <p className="text-xs text-muted-foreground">
              {history.length} {history.length === 1 ? 'sesión' : 'sesiones'} guardadas
            </p>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por creencia, emoción o etiqueta..."
                  className="pl-10 bg-background/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Sessions List */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No se encontraron sesiones
                  </p>
                ) : (
                  filteredHistory.map((session, index) => {
                    const profileData = actProfiles[session.profile];
                    const intensityDrop = session.initialIntensity - session.finalIntensity;
                    
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">{profileData.emoji}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              "{session.coreBelief}"
                            </p>
                            
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(session.completedAt)}</span>
                              
                              {intensityDrop > 0 && (
                                <>
                                  <span>•</span>
                                  <TrendingDown className="w-3 h-3 text-green-500" />
                                  <span className="text-green-500">-{intensityDrop}</span>
                                </>
                              )}
                              
                              {session.usedAi && (
                                <>
                                  <span>•</span>
                                  <Sparkles className="w-3 h-3 text-primary" />
                                </>
                              )}
                            </div>
                            
                            {session.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {session.tags.slice(0, 3).map(tag => (
                                  <span 
                                    key={tag}
                                    className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleDelete(session.id)}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              confirmDelete === session.id 
                                ? "bg-red-500/20 text-red-500" 
                                : "hover:bg-muted text-muted-foreground"
                            )}
                            title={confirmDelete === session.id ? 'Confirmar eliminación' : 'Eliminar'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {filteredHistory.length > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Los datos se guardan solo en este dispositivo
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
