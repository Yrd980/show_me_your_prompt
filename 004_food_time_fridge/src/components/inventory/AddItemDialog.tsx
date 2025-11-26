import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FridgeItem, MasterIngredient, Category, CATEGORY_CONFIG } from '@/types/inventory';
import { generateId, calculateExpiryDate } from '@/lib/game-utils';
import ingredientsData from '@/data/ingredients.json';

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: FridgeItem) => void;
  targetSlotIndex: number;
}

const masterIngredients = ingredientsData.ingredients as MasterIngredient[];
const CATEGORIES: Category[] = ['produce', 'dairy', 'meat', 'frozen', 'pantry', 'spices', 'beverages', 'other'];
const UNITS = ['pcs', 'g', 'kg', 'ml', 'L', 'cups', 'tbsp', 'tsp'];

export function AddItemDialog({ open, onClose, onAdd, targetSlotIndex }: AddItemDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<MasterIngredient | null>(null);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('📦');
  const [category, setCategory] = useState<Category>('other');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [expiryDays, setExpiryDays] = useState('7');
  const [isCustom, setIsCustom] = useState(false);

  // Filter ingredients by search
  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return masterIngredients.slice(0, 12);
    const query = searchQuery.toLowerCase();
    return masterIngredients.filter(ing =>
      ing.name.toLowerCase().includes(query) ||
      ing.category.includes(query)
    ).slice(0, 12);
  }, [searchQuery]);

  // Select an ingredient from the list
  const handleSelectIngredient = (ing: MasterIngredient) => {
    setSelectedIngredient(ing);
    setCategory(ing.category);
    setUnit(ing.defaultUnit);
    setExpiryDays(String(ing.defaultExpiryDays));
    setIsCustom(false);
  };

  // Switch to custom mode
  const handleCustomMode = () => {
    setSelectedIngredient(null);
    setIsCustom(true);
  };

  // Reset form
  const resetForm = () => {
    setSearchQuery('');
    setSelectedIngredient(null);
    setCustomName('');
    setCustomEmoji('📦');
    setCategory('other');
    setQuantity('1');
    setUnit('pcs');
    setExpiryDays('7');
    setIsCustom(false);
  };

  // Handle add
  const handleAdd = () => {
    const name = isCustom ? customName : selectedIngredient?.name || '';
    if (!name.trim()) return;

    const item: FridgeItem = {
      id: generateId(),
      name: name.trim(),
      emoji: isCustom ? customEmoji : selectedIngredient?.emoji || '📦',
      category,
      rarity: selectedIngredient?.rarity || 'common',
      quantity: Math.max(1, parseInt(quantity) || 1),
      unit,
      addedAt: Date.now(),
      expiresAt: parseInt(expiryDays) > 0 ? calculateExpiryDate(parseInt(expiryDays)) : null,
      slotIndex: targetSlotIndex,
    };

    onAdd(item);
    resetForm();
    onClose();
  };

  const canAdd = isCustom ? customName.trim().length > 0 : selectedIngredient !== null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🧊</span>
            Add Item to Fridge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search / Select ingredient */}
          {!isCustom && !selectedIngredient && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {filteredIngredients.map(ing => (
                  <button
                    key={ing.id}
                    onClick={() => handleSelectIngredient(ing)}
                    className="flex flex-col items-center p-2 rounded-lg border hover:bg-gray-50 hover:border-violet-300 transition-colors"
                  >
                    <span className="text-2xl">{ing.emoji}</span>
                    <span className="text-xs truncate w-full text-center">{ing.name}</span>
                  </button>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={handleCustomMode} className="w-full">
                + Add custom item
              </Button>
            </>
          )}

          {/* Selected ingredient display */}
          {selectedIngredient && !isCustom && (
            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
              <span className="text-3xl">{selectedIngredient.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold">{selectedIngredient.name}</p>
                <p className="text-xs text-gray-500 capitalize">{selectedIngredient.category} • {selectedIngredient.rarity}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetForm}>Change</Button>
            </div>
          )}

          {/* Custom item form */}
          {isCustom && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Emoji"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  className="w-16 text-center text-xl"
                  maxLength={2}
                />
                <Input
                  placeholder="Item name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
              </div>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                ← Back to search
              </Button>
            </div>
          )}

          {/* Quantity and details */}
          {(selectedIngredient || isCustom) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Unit</label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isCustom && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Category</label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_CONFIG[cat].icon} {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Expires in (days)</label>
                <Input
                  type="number"
                  min="0"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  placeholder="0 = never"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!canAdd}>
            Add to Fridge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
