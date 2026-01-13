import { Button } from '@/components/ui/button';
import { JourneyCard } from './JourneyCard';
import { BreathAnchor } from './BreathAnchor';
import { Session } from '@/hooks/useSession';

interface HomeProps {
  session: Session;
  onStartProfile: () => void;
  onStartDiagnosis: () => void;
  onStartDialogue: () => void;
  onViewHistory: () => void;
}

export function Home({ 
  session, 
  onStartProfile, 
  onStartDiagnosis, 
  onStartDialogue,
  onViewHistory 
}: HomeProps) {
  const hasProfile = session.actProfile !== null;
  const hasDiagnosis = session.diagnosis !== null;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="text-6xl mb-6">🧘</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Diálogo Socrático Interior
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforma tus creencias pesadas con conciencia
          </p>
          <div className="mt-6">
            <BreathAnchor />
          </div>
        </div>

        {/* Journey Overview */}
        <div className="contemplative-card mb-12 animate-fade-in-delay-1">
          <h3 className="font-semibold mb-6 text-center text-xl">El Camino de Transformación</h3>
          <div className="grid md:grid-cols-5 gap-4 items-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🧠</div>
              <div className="font-semibold text-sm">1. Perfil ACT</div>
              <div className="text-xs text-muted-foreground">Descubre tu peso</div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="text-2xl text-primary flow-arrow">→</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="font-semibold text-sm">2. Diagnóstico</div>
              <div className="text-xs text-muted-foreground">Creencia nuclear</div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="text-2xl text-primary flow-arrow">→</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💭</div>
              <div className="font-semibold text-sm">3. Diálogo</div>
              <div className="text-xs text-muted-foreground">Transformación</div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <JourneyCard
            emoji="🧠"
            title="Descubre tu Perfil ACT"
            description="Test de 24 preguntas para identificar tu perfil A-B-C-D y microintervención ACT recomendada"
            onClick={onStartProfile}
            active={!hasProfile}
            completed={hasProfile}
            className="animate-fade-in-delay-2"
          />
          <JourneyCard
            emoji="🔍"
            title="Diagnóstico Profundo"
            description="Identifica tu creencia nuclear, emociones asociadas, disparadores y origen"
            onClick={hasProfile ? onStartDiagnosis : undefined}
            active={hasProfile && !hasDiagnosis}
            completed={hasDiagnosis}
            className={`animate-fade-in-delay-2 ${!hasProfile ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Dialogue Action */}
        <div className="mb-8 animate-fade-in-delay-3">
          <JourneyCard
            emoji="💭"
            title="Transformar Creencia"
            description="Ritual socrático de 6 fases para disolver el peso de tu creencia nuclear"
            onClick={hasDiagnosis ? onStartDialogue : undefined}
            active={hasDiagnosis}
            className={`${!hasDiagnosis ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Current Session Info */}
        {hasProfile && (
          <div className="contemplative-card animate-fade-in">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>📋</span> Tu sesión actual
            </h4>
            <div className="space-y-2 text-sm">
              {session.actProfile && (
                <p className="text-muted-foreground">
                  <span className="text-foreground">Perfil:</span> {session.actProfile.profile} - {session.actProfile.mixedProfile?.name || 'Puro'}
                </p>
              )}
              {session.diagnosis && (
                <p className="text-muted-foreground">
                  <span className="text-foreground">Creencia:</span> "{session.diagnosis.coreBelief}"
                </p>
              )}
              {session.dialogue.length > 0 && (
                <p className="text-muted-foreground">
                  <span className="text-foreground">Progreso:</span> {session.dialogue.length} fases completadas
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 mt-12 animate-fade-in-delay-3">
          <Button variant="outline" onClick={onViewHistory}>
            Ver historial de sesiones
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Un espacio seguro para la introspección y transformación
          </p>
        </div>
      </div>
    </div>
  );
}
