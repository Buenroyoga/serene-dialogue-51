import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressIndicator({ current, total, className }: ProgressIndicatorProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Pregunta {current} de {total}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
