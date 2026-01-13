import { cn } from '@/lib/utils';

interface JourneyCardProps {
  emoji: string;
  title: string;
  description: string;
  onClick?: () => void;
  active?: boolean;
  completed?: boolean;
  className?: string;
}

export function JourneyCard({ 
  emoji, 
  title, 
  description, 
  onClick, 
  active = false,
  completed = false,
  className 
}: JourneyCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "contemplative-card scale-hover cursor-pointer relative overflow-hidden",
        active && "pulse-glow ring-2 ring-primary",
        completed && "opacity-80",
        className
      )}
    >
      {completed && (
        <div className="absolute top-3 right-3 text-xl">✓</div>
      )}
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
