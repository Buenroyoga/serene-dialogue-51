import { cn } from '@/lib/utils';

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  labels?: { low: string; high: string };
}

export function LikertScale({ 
  value, 
  onChange, 
  labels = { low: 'Nunca', high: 'Siempre' } 
}: LikertScaleProps) {
  const options = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{labels.low}</span>
        <span>{labels.high}</span>
      </div>
      <div className="flex justify-between gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "flex-1 py-4 rounded-lg font-semibold text-lg transition-all duration-200",
              "hover:scale-105 hover:bg-primary/20",
              value === opt 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "bg-card border border-border"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
