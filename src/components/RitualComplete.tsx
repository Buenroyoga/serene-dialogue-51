import { Button } from '@/components/ui/button';
import { DiagnosisData, DialogueEntry } from '@/hooks/useSession';
import { ProfileResult, actProfiles, socraticRitual } from '@/lib/actData';
import { Home, RotateCcw, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RitualCompleteProps {
  actProfile: ProfileResult;
  diagnosis: DiagnosisData;
  dialogueEntries: DialogueEntry[];
  finalIntensity: number;
  onHome: () => void;
  onNewRitual: () => void;
}

export function RitualComplete({
  actProfile,
  diagnosis,
  dialogueEntries,
  finalIntensity,
  onHome,
  onNewRitual
}: RitualCompleteProps) {
  const profile = actProfiles[actProfile.profile];
  const intensityDrop = diagnosis.intensity - finalIntensity;
  const percentDrop = Math.round((intensityDrop / diagnosis.intensity) * 100);

  const getTransformationMessage = () => {
    if (percentDrop >= 70) {
      return {
        emoji: '🌟',
        title: 'Transformación Profunda',
        message: 'Has logrado una liberación significativa de esta creencia. El espacio interior que has creado es valioso.'
      };
    } else if (percentDrop >= 40) {
      return {
        emoji: '✨',
        title: 'Cambio Notable',
        message: 'La creencia ha perdido fuerza. Cada paso hacia la consciencia cuenta.'
      };
    } else if (percentDrop > 0) {
      return {
        emoji: '🌱',
        title: 'Semilla de Cambio',
        message: 'Has comenzado el proceso. A veces las transformaciones más profundas necesitan tiempo y repetición.'
      };
    } else {
      return {
        emoji: '💎',
        title: 'Proceso en Curso',
        message: 'La intensidad permanece, pero la consciencia que has traído es el primer paso. Este trabajo requiere paciencia y compasión.'
      };
    }
  };

  const transformation = getTransformationMessage();

  return (
    <div className="w-full max-w-2xl mx-auto p-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-7xl mb-4 animate-pulse-slow">{transformation.emoji}</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {transformation.title}
        </h1>
        <p className="text-muted-foreground">
          {transformation.message}
        </p>
      </div>

      {/* Intensity Comparison */}
      <div className="contemplative-card mb-6">
        <h3 className="font-semibold mb-4 text-center">Tu Recorrido</h3>
        
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-muted-foreground">
              {diagnosis.intensity}/10
            </div>
            <div className="text-xs text-muted-foreground">Antes</div>
          </div>
          
          <div className="text-2xl text-primary">→</div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {finalIntensity}/10
            </div>
            <div className="text-xs text-muted-foreground">Ahora</div>
          </div>
        </div>

        {intensityDrop > 0 && (
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <span className="text-primary font-semibold">
              -{intensityDrop} puntos ({percentDrop}% de reducción)
            </span>
          </div>
        )}
      </div>

      {/* Belief Summary */}
      <div className="contemplative-card mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{profile.emoji}</span>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Creencia trabajada (Perfil {profile.name})
            </p>
            <p className="text-foreground font-medium italic">
              "{diagnosis.coreBelief}"
            </p>
          </div>
        </div>
      </div>

      {/* Phases Completed */}
      <div className="contemplative-card mb-6">
        <h3 className="font-semibold mb-4">Fases Completadas</h3>
        <div className="space-y-3">
          {socraticRitual.map((phase, i) => {
            const entry = dialogueEntries.find(e => e.phaseId === phase.id);
            return (
              <div 
                key={phase.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all",
                  entry ? "bg-primary/5" : "opacity-50"
                )}
              >
                <span className="text-xl">{phase.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{phase.name}</p>
                </div>
                {entry && (
                  <span className="text-primary text-sm">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ACT Micro-intervention Reminder */}
      <div className="contemplative-card mb-8 border-primary/30">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <span>🧘</span>
          Tu Práctica ACT
        </h3>
        <p className="text-sm text-muted-foreground">
          {profile.actMicro}
        </p>
        <p className="text-xs text-muted-foreground mt-2 italic">
          Usa esta técnica cuando la creencia resurja en tu día a día.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-auto">
        <Button 
          onClick={onHome}
          className="w-full py-6"
          size="lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Volver al Inicio
        </Button>
        
        <Button 
          onClick={onNewRitual}
          variant="outline"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Trabajar Otra Creencia
        </Button>
      </div>
    </div>
  );
}