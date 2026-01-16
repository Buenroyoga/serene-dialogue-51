import { useState } from 'react';
import { Home } from '@/components/Home';
import { ACTProfileTest } from '@/components/ACTProfileTest';
import { DiagnosisForm } from '@/components/DiagnosisForm';
import { SocraticDialogue } from '@/components/SocraticDialogue';
import { RitualComplete } from '@/components/RitualComplete';
import { DisclaimerOverlay } from '@/components/DisclaimerOverlay';
import { SessionHistory } from '@/components/SessionHistory';
import { PrivacyControls } from '@/components/PrivacyControls';
import { RitualSelector } from '@/components/RitualSelector';
import { HowItWorks } from '@/components/HowItWorks';
import { useFlowController } from '@/hooks/useFlowController';
import { 
  ProfileResult, 
  DiagnosisData, 
  DialogueEntry, 
  Session,
  RitualMode,
} from '@/domain/types';
// Extended flow stages to include new screens
type ExtendedStage = 'IDLE' | 'HOW_IT_WORKS' | 'TEST' | 'DIAGNOSIS' | 'SELECT_RITUAL' | 'RITUAL' | 'COMPLETE';

const Index = () => {
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [extendedStage, setExtendedStage] = useState<ExtendedStage>('IDLE');
  const [selectedRitualMode, setSelectedRitualMode] = useState<RitualMode>('full');
  
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

  // Helpers para extraer datos de sesión de forma segura
  const getSessionForHome = (): Session => session;

  const getDiagnosisData = (): DiagnosisData | null => {
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

  const getDialogueEntries = (): DialogueEntry[] => {
    return session.dialogue.map(entry => ({
      phaseId: entry.phaseId || '',
      phaseName: entry.phaseName || '',
      question: entry.question || '',
      answer: entry.answer || '',
      timestamp: entry.timestamp || new Date(),
      isAiGenerated: entry.isAiGenerated || false,
    }));
  };

  const handleProfileComplete = (result: ProfileResult) => {
    setActProfile(result);
    setExtendedStage('IDLE');
  };

  const handleDiagnosisComplete = (diagnosis: DiagnosisData) => {
    setDiagnosis(diagnosis);
    setExtendedStage('IDLE');
  };

  const handleDialogueComplete = (intensity: number) => {
    setFinalIntensity(intensity);
    completeRitual(intensity);
    setExtendedStage('COMPLETE');
  };

  const handleNewRitual = () => {
    startNewRitual();
    setExtendedStage('DIAGNOSIS');
    goToStage('DIAGNOSIS');
  };

  const handleStartDialogue = () => {
    // Show ritual selector before starting
    setExtendedStage('SELECT_RITUAL');
  };

  const handleRitualModeSelect = (mode: RitualMode) => {
    setSelectedRitualMode(mode);
    startRitual();
    setExtendedStage('RITUAL');
  };

  const handleSaveAndExit = () => {
    pauseCurrentRitual();
    setExtendedStage('IDLE');
  };

  // Sync extended stage with flow controller stage
  const getEffectiveStage = (): ExtendedStage => {
    // If we're in a special extended stage, use it
    if (extendedStage === 'HOW_IT_WORKS' || extendedStage === 'SELECT_RITUAL') {
      return extendedStage;
    }
    
    switch (currentStage) {
      case 'TEST':
        return 'TEST';
      case 'DIAGNOSIS':
        return 'DIAGNOSIS';
      case 'RITUAL':
        return 'RITUAL';
      case 'COMPLETE':
        return 'COMPLETE';
      default:
        return extendedStage === 'IDLE' ? 'IDLE' : extendedStage;
    }
  };

  const effectiveStage = getEffectiveStage();

  const renderView = () => {
    switch (effectiveStage) {
      case 'HOW_IT_WORKS':
        return (
          <HowItWorks 
            onBack={() => setExtendedStage('IDLE')}
            onStart={() => {
              setExtendedStage('TEST');
              goToStage('TEST');
            }}
          />
        );
      case 'TEST':
        return (
          <ACTProfileTest 
            onComplete={handleProfileComplete}
            onBack={() => {
              setExtendedStage('IDLE');
              goToStage('IDLE');
            }}
          />
        );
      case 'DIAGNOSIS':
        if (!session.actProfile) {
          setExtendedStage('IDLE');
          goToStage('IDLE');
          return null;
        }
        return (
          <DiagnosisForm
            actProfile={session.actProfile as ProfileResult}
            onComplete={handleDiagnosisComplete}
            onBack={() => {
              setExtendedStage('IDLE');
              goToStage('IDLE');
            }}
          />
        );
      case 'SELECT_RITUAL':
        return (
          <RitualSelector
            onSelect={handleRitualModeSelect}
            onBack={() => setExtendedStage('IDLE')}
          />
        );
      case 'RITUAL':
        if (!session.actProfile || !session.diagnosis) {
          setExtendedStage('IDLE');
          goToStage('IDLE');
          return null;
        }
        return (
          <SocraticDialogue
            actProfile={session.actProfile as ProfileResult}
            diagnosis={getDiagnosisData()!}
            ritualMode={selectedRitualMode}
            onAddEntry={addDialogueEntry}
            onComplete={handleDialogueComplete}
            onBack={() => {
              pauseCurrentRitual();
              setExtendedStage('IDLE');
            }}
            onSaveAndExit={handleSaveAndExit}
          />
        );
      case 'COMPLETE':
        if (!session.actProfile || !session.diagnosis) {
          setExtendedStage('IDLE');
          goToStage('IDLE');
          return null;
        }
        return (
          <RitualComplete
            actProfile={session.actProfile as ProfileResult}
            diagnosis={getDiagnosisData()!}
            dialogueEntries={getDialogueEntries()}
            finalIntensity={finalIntensity}
            onHome={() => {
              setExtendedStage('IDLE');
              goToStage('IDLE');
            }}
            onNewRitual={handleNewRitual}
          />
        );
      default:
        return (
          <>
            <Home
              session={getSessionForHome()}
              onStartProfile={() => {
                setExtendedStage('TEST');
                goToStage('TEST');
              }}
              onStartDiagnosis={() => {
                setExtendedStage('DIAGNOSIS');
                goToStage('DIAGNOSIS');
              }}
              onStartDialogue={handleStartDialogue}
              onViewHistory={() => setHistoryExpanded(true)}
              onHowItWorks={() => setExtendedStage('HOW_IT_WORKS')}
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
      <div className="fixed top-4 right-4 z-40">
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
