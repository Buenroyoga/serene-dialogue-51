// ═══════════════════════════════════════════════════════════
// SUGGESTED CHIPS - Suggested and favorite chips for emotions/triggers
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChipItem {
  name: string;
  emoji: string;
}

interface SuggestedChipsProps {
  type: 'emotions' | 'triggers';
  selected: string[];
  onToggle: (item: string) => void;
  onRemove: (item: string) => void;
  className?: string;
}

const STORAGE_KEY_FAVORITES = 'chip_favorites';

// Default suggestions
const defaultEmotions: ChipItem[] = [
  { name: 'Tristeza', emoji: '😢' },
  { name: 'Ansiedad', emoji: '😰' },
  { name: 'Rabia', emoji: '😠' },
  { name: 'Vergüenza', emoji: '😳' },
  { name: 'Miedo', emoji: '😨' },
  { name: 'Culpa', emoji: '😔' },
  { name: 'Frustración', emoji: '😤' },
  { name: 'Soledad', emoji: '🥺' },
  { name: 'Desesperanza', emoji: '😞' },
  { name: 'Confusión', emoji: '😵' },
  { name: 'Vacío', emoji: '🫥' },
  { name: 'Agotamiento', emoji: '😩' },
];

const defaultTriggers: ChipItem[] = [
  { name: 'Trabajo', emoji: '💼' },
  { name: 'Relaciones', emoji: '💑' },
  { name: 'Familia', emoji: '👨‍👩‍👧' },
  { name: 'Soledad', emoji: '🚶' },
  { name: 'Evaluaciones', emoji: '📋' },
  { name: 'Conflictos', emoji: '⚔️' },
  { name: 'Errores', emoji: '❌' },
  { name: 'Comparación', emoji: '⚖️' },
  { name: 'Redes sociales', emoji: '📱' },
  { name: 'Dinero', emoji: '💰' },
  { name: 'Salud', emoji: '🏥' },
  { name: 'Futuro', emoji: '🔮' },
];

// Load favorites from localStorage
function loadFavorites(type: 'emotions' | 'triggers'): string[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_FAVORITES}_${type}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save favorites to localStorage
function saveFavorites(type: 'emotions' | 'triggers', favorites: string[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_FAVORITES}_${type}`, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
}

export function SuggestedChips({
  type,
  selected,
  onToggle,
  onRemove,
  className,
}: SuggestedChipsProps) {
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites(type));
  const [showAll, setShowAll] = useState(false);
  
  const defaultItems = type === 'emotions' ? defaultEmotions : defaultTriggers;

  // Update favorites in storage
  useEffect(() => {
    saveFavorites(type, favorites);
  }, [type, favorites]);

  const toggleFavorite = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(item) 
        ? prev.filter(f => f !== item)
        : [...prev, item]
    );
  };

  // Sort items: favorites first, then rest
  const sortedItems = [...defaultItems].sort((a, b) => {
    const aFav = favorites.includes(a.name);
    const bFav = favorites.includes(b.name);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const displayItems = showAll ? sortedItems : sortedItems.slice(0, 9);
  const hasMore = sortedItems.length > 9;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2"
        >
          <AnimatePresence mode="popLayout">
            {selected.map(item => {
              const itemData = defaultItems.find(i => i.name === item);
              return (
                <motion.span 
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2"
                >
                  {itemData?.emoji && <span>{itemData.emoji}</span>}
                  <span>{item}</span>
                  <button 
                    onClick={() => onRemove(item)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Chip grid */}
      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {displayItems.map((item, index) => {
            const isSelected = selected.includes(item.name);
            const isFavorite = favorites.includes(item.name);
            
            return (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.02 }}
                layout
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onToggle(item.name)}
                className={cn(
                  "relative p-3 rounded-xl text-sm transition-all flex flex-col items-center gap-1 border",
                  isSelected
                    ? 'bg-primary/20 border-primary text-primary-foreground shadow-lg'
                    : 'bg-background/50 border-border/50 hover:border-primary/50 hover:bg-background/80'
                )}
              >
                {/* Favorite star */}
                <button
                  onClick={(e) => toggleFavorite(item.name, e)}
                  className={cn(
                    "absolute top-1 right-1 p-0.5 rounded-full transition-colors",
                    isFavorite 
                      ? 'text-amber-400' 
                      : 'text-muted-foreground/30 hover:text-muted-foreground'
                  )}
                >
                  <Star 
                    className={cn(
                      "w-3 h-3",
                      isFavorite && "fill-current"
                    )} 
                  />
                </button>

                <span className="text-xl">{item.emoji}</span>
                <span className="font-medium text-xs">{item.name}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show more/less button */}
      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
        >
          <Plus className={cn("w-4 h-4 transition-transform", showAll && "rotate-45")} />
          {showAll ? 'Ver menos' : `Ver ${sortedItems.length - 9} más`}
        </motion.button>
      )}

      {/* Favorites hint */}
      {favorites.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          <Star className="w-3 h-3 inline-block mr-1" />
          Marca tus favoritos para acceso rápido
        </p>
      )}
    </div>
  );
}
