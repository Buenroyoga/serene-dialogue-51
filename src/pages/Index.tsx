import { useState } from 'react';
import { Home } from '@/components/Home';
import { ACTProfileTest } from '@/components/ACTProfileTest';
import { DiagnosisForm } from '@/components/DiagnosisForm';
import { SocraticDialogue } from '@/components/SocraticDialogue';
import { RitualComplete } from '@/components/RitualComplete';
import { useSession } from '@/hooks/useSession';
import { ProfileResult } from '@/lib/actData';
import { DiagnosisData } from '@/hooks/useSession';
import { toast } from 'sonner';

type View = 'home' | 'profile' | 'diagnosis' | 'dialogue' | 'complete' | 'history';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [finalIntensity, setFinalIntensity] = useState<number>(0);
  const { session, setActProfile, setDiagnosis, addDialogueEntry, resetSession } = useSession();

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

  const handleDialogueComplete = (intensity: number) => {
    setFinalIntensity(intensity);
    toast.success('Ritual completado');
    setCurrentView('complete');
  };

  const handleNewRitual = () => {
    // Reset diagnosis to start fresh
    setDiagnosis({
      coreBelief: '',
      emotionalHistory: [],
      triggers: [],
      narrative: '',
      origin: '',
      intensity: 5,
      subcategory: ''
    });
    setCurrentView('diagnosis');
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
          <SocraticDialogue
            actProfile={session.actProfile}
            diagnosis={session.diagnosis}
            onAddEntry={addDialogueEntry}
            onComplete={handleDialogueComplete}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'complete':
        if (!session.actProfile || !session.diagnosis) {
          setCurrentView('home');
          return null;
        }
        return (
          <RitualComplete
            actProfile={session.actProfile}
            diagnosis={session.diagnosis}
            dialogueEntries={session.dialogue}
            finalIntensity={finalIntensity}
            onHome={() => setCurrentView('home')}
            onNewRitual={handleNewRitual}
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
