import { useState } from 'react';
import { Home } from '@/components/Home';
import { ACTProfileTest } from '@/components/ACTProfileTest';
import { DiagnosisForm } from '@/components/DiagnosisForm';
import { SocraticDialogue } from '@/components/SocraticDialogue';
import { RitualComplete } from '@/components/RitualComplete';
import { DisclaimerOverlay } from '@/components/DisclaimerOverlay';
import { SessionHistory } from '@/components/SessionHistory';
import { PrivacyControls } from '@/components/PrivacyControls';
import { useFlowController } from '@/hooks/useFlowController';
import { ProfileResult } from '@/lib/actData';
import { DiagnosisData as DomainDiagnosisData } from '@/domain/types';
import { Session as LegacySession, DiagnosisData, DialogueEntry } from '@/hooks/useSession';

const Index = () => {
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const {
    session,
    currentStage,
    history,
    showDisclaimer,
    hasProgress,
    goToStage,
    setActProfile,
    setDiagnosis,
    addDialogueEntry,
    startRitual,
    pauseCurrentRitual,
    completeRitual,
    resetSession,
    startNewRitual,
    setPrivacyMode,
    searchInHistory,
    deleteHistoryEntry,
    dismissDisclaimer,
  } = useFlowController();

  const [finalIntensity, setFinalIntensity] = useState<number>(0);

  // Convert domain session to legacy session format for Home component
  const toLegacySession = (): LegacySession => ({
    id: session.id,
    actProfile: session.actProfile as ProfileResult | null,
    diagnosis: session.diagnosis ? {
      coreBelief: session.diagnosis.coreBelief || '',
      emotionalHistory: session.diagnosis.emotionalHistory || [],
      triggers: session.diagnosis.triggers || [],
      narrative: session.diagnosis.narrative || '',
      origin: session.diagnosis.origin || '',
      intensity: session.diagnosis.intensity || 5,
      subcategory: session.diagnosis.subcategory || '',
    } : null,
    dialogue: session.dialogue.map(entry => ({
      phaseId: entry.phaseId || '',
      phaseName: entry.phaseName || '',
      question: entry.question || '',
      answer: entry.answer || '',
      timestamp: entry.timestamp || new Date(),
    })),
    createdAt: session.createdAt,
    completedAt: session.completedAt,
  });

  // Convert domain diagnosis to legacy format
  const toLegacyDiagnosis = (): DiagnosisData | null => {
    if (!session.diagnosis) return null;
    return {
      coreBelief: session.diagnosis.coreBelief || '',
      emotionalHistory: session.diagnosis.emotionalHistory || [],
      triggers: session.diagnosis.triggers || [],
      narrative: session.diagnosis.narrative || '',
      origin: session.diagnosis.origin || '',
      intensity: session.diagnosis.intensity || 5,
      subcategory: session.diagnosis.subcategory || '',
    };
  };

  // Convert domain dialogue entries to legacy format
  const toLegacyDialogue = (): DialogueEntry[] => {
    return session.dialogue.map(entry => ({
      phaseId: entry.phaseId || '',
      phaseName: entry.phaseName || '',
      question: entry.question || '',
      answer: entry.answer || '',
      timestamp: entry.timestamp || new Date(),
    }));
  };

  const handleProfileComplete = (result: ProfileResult) => {
    setActProfile(result);
  };

  const handleDiagnosisComplete = (diagnosis: DomainDiagnosisData) => {
    setDiagnosis(diagnosis);
  };

  const handleDialogueComplete = (intensity: number) => {
    setFinalIntensity(intensity);
    completeRitual(intensity);
  };

  const handleNewRitual = () => {
    startNewRitual();
    goToStage('DIAGNOSIS');
  };

  const handleStartDialogue = () => {
    startRitual();
  };

  const renderView = () => {
    switch (currentStage) {
      case 'TEST':
        return (
          <ACTProfileTest 
            onComplete={handleProfileComplete}
            onBack={() => goToStage('IDLE')}
          />
        );
      case 'DIAGNOSIS':
        if (!session.actProfile) {
          goToStage('IDLE');
          return null;
        }
        return (
          <DiagnosisForm
            actProfile={session.actProfile as ProfileResult}
            onComplete={handleDiagnosisComplete}
            onBack={() => goToStage('IDLE')}
          />
        );
      case 'RITUAL':
        if (!session.actProfile || !session.diagnosis) {
          goToStage('IDLE');
          return null;
        }
        return (
          <SocraticDialogue
            actProfile={session.actProfile as ProfileResult}
            diagnosis={toLegacyDiagnosis()!}
            onAddEntry={addDialogueEntry}
            onComplete={handleDialogueComplete}
            onBack={() => pauseCurrentRitual()}
          />
        );
      case 'COMPLETE':
        if (!session.actProfile || !session.diagnosis) {
          goToStage('IDLE');
          return null;
        }
        return (
          <RitualComplete
            actProfile={session.actProfile as ProfileResult}
            diagnosis={toLegacyDiagnosis()!}
            dialogueEntries={toLegacyDialogue()}
            finalIntensity={finalIntensity}
            onHome={() => goToStage('IDLE')}
            onNewRitual={handleNewRitual}
          />
        );
      default:
        return (
          <>
            <Home
              session={toLegacySession()}
              onStartProfile={() => goToStage('TEST')}
              onStartDiagnosis={() => goToStage('DIAGNOSIS')}
              onStartDialogue={handleStartDialogue}
              onViewHistory={() => setHistoryExpanded(true)}
            />
            
            {/* Session History */}
            {history.length > 0 && (
              <div className="max-w-2xl mx-auto px-4 pb-8">
                <SessionHistory
                  history={history}
                  onSearch={searchInHistory}
                  onDelete={deleteHistoryEntry}
                  isExpanded={historyExpanded}
                  onToggleExpand={() => setHistoryExpanded(!historyExpanded)}
                />
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Disclaimer Overlay */}
      <DisclaimerOverlay 
        isVisible={showDisclaimer} 
        onDismiss={dismissDisclaimer} 
      />
      
      {/* Privacy Controls - Fixed position */}
      <div className="fixed top-4 right-4 z-40 relative">
        <PrivacyControls
          currentMode={session.privacyMode}
          hasProgress={hasProgress}
          onModeChange={setPrivacyMode}
          onDeleteNow={() => resetSession()}
        />
      </div>

      {renderView()}
    </div>
  );
};

export default Index;
