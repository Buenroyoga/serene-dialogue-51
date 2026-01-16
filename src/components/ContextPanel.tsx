// ═══════════════════════════════════════════════════════════
// CONTEXT PANEL - Collapsible summary of current session
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Target, Heart, Zap, User } from 'lucide-react';
import { DiagnosisData, ProfileResult } from '@/domain/types';
import { actProfiles, socraticRitual } from '@/lib/actData';
import { cn } from '@/lib/utils';

interface ContextPanelProps {
  profile: ProfileResult;
  diagnosis: DiagnosisData;
  currentPhaseIndex: number;
  className?: string;
}

export function ContextPanel({ 
  profile, 
  diagnosis, 
  currentPhaseIndex,
  className 
}: ContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const profileData = actProfiles[profile.profile];
  const currentPhase = socraticRitual[currentPhaseIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-4 mb-6",
        className
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">{profileData.emoji}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Fase {currentPhaseIndex + 1}: {currentPhase?.name || 'Preparación'}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              "{diagnosis.coreBelief}"
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

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border/30 space-y-4">
              {/* Core Belief */}
              <div className="flex items-start gap-3">
                <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Creencia Nuclear
                  </p>
                  <p className="text-sm text-foreground italic">
                    "{diagnosis.coreBelief}"
                  </p>
                </div>
              </div>

              {/* Emotions */}
              <div className="flex items-start gap-3">
                <Heart className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Emociones
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {diagnosis.emotionalHistory.slice(0, 4).map(emotion => (
                      <span 
                        key={emotion}
                        className="px-2 py-0.5 text-xs rounded-full bg-rose-500/10 text-rose-500"
                      >
                        {emotion}
                      </span>
                    ))}
                    {diagnosis.emotionalHistory.length > 4 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                        +{diagnosis.emotionalHistory.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Triggers */}
              <div className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Disparadores
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {diagnosis.triggers.slice(0, 3).map(trigger => (
                      <span 
                        key={trigger}
                        className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-500"
                      >
                        {trigger}
                      </span>
                    ))}
                    {diagnosis.triggers.length > 3 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                        +{diagnosis.triggers.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile */}
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Perfil ACT
                  </p>
                  <p className="text-sm text-foreground">
                    {profileData.emoji} {profileData.name}
                    {profile.mixedProfile && (
                      <span className="text-muted-foreground">
                        {' '}• {profile.mixedProfile.emoji} {profile.mixedProfile.name}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Intensity */}
              <div className="p-3 rounded-xl bg-primary/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Intensidad inicial</span>
                  <span className="text-lg font-bold text-primary">{diagnosis.intensity}/10</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
