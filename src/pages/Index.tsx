import { useState } from 'react';
import { Home } from '@/components/Home';
import { ACTProfileTest } from '@/components/ACTProfileTest';
import { DiagnosisForm } from '@/components/DiagnosisForm';
import { DialogueView } from '@/components/DialogueView';
import { HistoryView } from '@/components/HistoryView';
import { useSession } from '@/hooks/useSession';
import { ProfileResult } from '@/lib/actData';
import { DiagnosisData } from '@/hooks/useSession';
import { toast } from 'sonner';

type View = 'home' | 'profile' | 'diagnosis' | 'dialogue' | 'history';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const {
    session,
    history,
    setActProfile,
    setDiagnosis,
    addDialogueEntry,
    completeSession,
    clearHistory
  } = useSession();

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
        if (!session.actProfile || !session.diagnosis) {
          setCurrentView('home');
          return null;
        }
        return (
          <DialogueView
            actProfile={session.actProfile}
            diagnosis={session.diagnosis}
            dialogue={session.dialogue}
            onAddEntry={addDialogueEntry}
            onComplete={() => {
              completeSession();
              toast.success('Sesión guardada en tu historial');
              setCurrentView('home');
            }}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'history':
        return (
          <HistoryView
            history={history}
            onClear={() => {
              clearHistory();
              toast.success('Historial limpiado');
            }}
            onBack={() => setCurrentView('home')}
          />
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
