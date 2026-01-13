import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  id: string;
  label: string;
  description?: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  inputPlaceholder: string;
  inputAriaLabel: string;
  hint?: string;
  className?: string;
}

export function TagSelector({
  id,
  label,
  description,
  options,
  selected,
  onChange,
  inputPlaceholder,
  inputAriaLabel,
  hint,
  className
}: TagSelectorProps) {
  const handleToggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((value) => value !== option)
      : [...selected, option];
    onChange(next);
  };

  const handleAddCustom = (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    const exists = selected.some(
      (item) => item.toLowerCase() === normalized.toLowerCase()
    );
    if (!exists) {
      onChange([...selected, normalized]);
    }
  };

  return (
    <div className={cn('contemplative-card', className)}>
      <Label htmlFor={id} className="text-lg font-semibold">
        {label}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          {description}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              className={cn(
                'p-3 rounded-lg text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              )}
              onClick={() => handleToggle(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground mt-3">
          {hint}
        </p>
      )}
      <Input
        id={id}
        className="mt-4"
        placeholder={inputPlaceholder}
        aria-label={inputAriaLabel}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target as HTMLInputElement;
            handleAddCustom(input.value);
            input.value = '';
          }
        }}
      />
    </div>
  );
}
