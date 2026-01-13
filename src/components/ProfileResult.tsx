import { ProfileResult as ProfileResultType, actProfiles } from '@/lib/actData';
import { Button } from '@/components/ui/button';
import { BreathAnchor } from './BreathAnchor';

interface ProfileResultProps {
  result: ProfileResultType;
  onContinue: () => void;
}

export function ProfileResultDisplay({ result, onContinue }: ProfileResultProps) {
  const primaryProfile = actProfiles[result.profile];
  const secondaryProfile = result.secondaryProfile ? actProfiles[result.secondaryProfile] : null;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center mb-8">
        <BreathAnchor />
        <h2 className="text-2xl font-bold mt-6 mb-2">Tu Perfil ACT</h2>
        <p className="text-muted-foreground">Resultado de tu evaluación interior</p>
      </div>

      {/* Primary Profile */}
      <div className="contemplative-card text-center pulse-glow">
        <div className="text-6xl mb-4">{primaryProfile.emoji}</div>
        <h3 className="text-2xl font-bold mb-2">Perfil {primaryProfile.name}</h3>
        <p className="text-muted-foreground mb-4">{primaryProfile.description}</p>
        <p className="text-sm leading-relaxed">{primaryProfile.fullDescription}</p>
      </div>

      {/* Mixed Profile */}
      {result.mixedProfile && secondaryProfile && (
        <div className="contemplative-card animate-fade-in-delay-1">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{result.mixedProfile.emoji}</span>
            <div>
              <h4 className="font-semibold">{result.mixedProfile.name}</h4>
              <p className="text-sm text-muted-foreground">{result.mixedProfile.description}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            También muestras características del perfil {secondaryProfile.name} ({secondaryProfile.emoji})
          </p>
        </div>
      )}

      {/* Scores */}
      <div className="contemplative-card animate-fade-in-delay-2">
        <h4 className="font-semibold mb-4">Distribución de tu perfil</h4>
        <div className="space-y-3">
          {(Object.entries(result.scores) as [keyof typeof actProfiles, number][]).map(([key, score]) => {
            const profile = actProfiles[key];
            const maxScore = 30; // 6 questions * 5 max
            const percentage = (score / maxScore) * 100;
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{profile.emoji} {profile.name}</span>
                  <span className="text-muted-foreground">{score}/30</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-700 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACT Micro-intervention */}
      <div className="contemplative-card animate-fade-in-delay-3 border-l-4 border-primary">
        <h4 className="font-semibold mb-2">🌟 Microintervención ACT recomendada</h4>
        <p className="text-primary font-medium">{primaryProfile.actMicro}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Tono recomendado: <span className="text-foreground">{primaryProfile.tone}</span>
        </p>
      </div>

      <Button 
        onClick={onContinue}
        className="w-full py-6 text-lg"
        size="lg"
      >
        Continuar al Diagnóstico Profundo →
      </Button>
    </div>
  );
}
