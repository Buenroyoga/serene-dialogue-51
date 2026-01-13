import { useState } from 'react';
import { Home } from '@/components/Home';
import { ACTProfileTest } from '@/components/ACTProfileTest';
import { DiagnosisForm } from '@/components/DiagnosisForm';
import { useSession } from '@/hooks/useSession';
import { ProfileResult } from '@/lib/actData';
import { DiagnosisData } from '@/hooks/useSession';
import { toast } from 'sonner';

type View = 'home' | 'profile' | 'diagnosis' | 'dialogue' | 'history';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const { session, setActProfile, setDiagnosis, resetSession } = useSession();

  const handleProfileComplete = (result: ProfileResult) => {
    setActProfile(result);
    toast.success('Perfil ACT identificado');
    setCurrentView('home');
  };

  const handleDiagnosisComplete = (diagnosis: DiagnosisData) => {
    setDiagnosis(diagnosis);
    toast.success('Diagnóstico completado');
    setCurrentView('home');
  };

  const renderView = () => {
    switch (currentView) {
      case 'profile':
        return (
          <ACTProfileTest 
            onComplete={handleProfileComplete}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'diagnosis':
        if (!session.actProfile) {
          setCurrentView('home');
          return null;
        }
        return (
          <DiagnosisForm
            actProfile={session.actProfile}
            onComplete={handleDiagnosisComplete}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'dialogue':
        // TODO: Implement dialogue view
        return (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="contemplative-card text-center max-w-md">
              <div className="text-5xl mb-4">💭</div>
              <h2 className="text-xl font-bold mb-2">Diálogo Socrático</h2>
              <p className="text-muted-foreground mb-6">
                El ritual de transformación está en desarrollo.
              </p>
              <button 
                onClick={() => setCurrentView('home')}
                className="text-primary hover:underline"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        );
      default:
        return (
          <Home
            session={session}
            onStartProfile={() => setCurrentView('profile')}
            onStartDiagnosis={() => setCurrentView('diagnosis')}
            onStartDialogue={() => setCurrentView('dialogue')}
            onViewHistory={() => setCurrentView('history')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderView()}
    </div>
  );
};

export default Index;
