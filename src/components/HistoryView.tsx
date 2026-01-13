import { Button } from '@/components/ui/button';
import { Session } from '@/hooks/useSession';
import { t } from '@/lib/i18n';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  history: Session[];
  onBack: () => void;
  onClear: () => void;
}

export function HistoryView({ history, onBack, onClear }: HistoryViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 min-h-screen flex flex-col">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('history.back')}
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">{t('history.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('history.subtitle')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {t('history.count', { count: history.length })}
        </p>
        <Button variant="outline" onClick={onClear} disabled={history.length === 0}>
          <Trash2 className="w-4 h-4 mr-2" />
          {t('history.clear')}
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="contemplative-card text-center flex-1 flex flex-col items-center justify-center">
          <div className="text-4xl mb-4">📜</div>
          <p className="text-muted-foreground">
            {t('history.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {history.map(session => (
            <div key={session.id} className="contemplative-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {session.completedAt ? new Date(session.completedAt).toLocaleString() : new Date(session.createdAt).toLocaleString()}
                  </p>
                  <h3 className="text-lg font-semibold mt-1">
                    {t('history.profileLabel')} {session.actProfile?.profile ?? '—'} · {session.actProfile?.mixedProfile?.name ?? t('history.pureLabel')}
                  </h3>
                  {session.diagnosis && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('history.beliefLabel')}: "{session.diagnosis.coreBelief}"
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('history.phaseCount', { count: session.dialogue.length })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
