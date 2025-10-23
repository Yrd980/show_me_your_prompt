import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Meal } from '@/types/meal';

interface MealLibraryProps {
  meals: Meal[];
  onSelectMeal: (meal: Meal) => void;
  selectedSlot: { day: string; mealType: 'breakfast' | 'lunch' | 'dinner' } | null;
  onClose: () => void;
}

const CATEGORIES = ['all', 'breakfast', 'lunch', 'dinner'] as const;

export function MealLibrary({ meals, onSelectMeal, selectedSlot, onClose }: MealLibraryProps) {
  const [filter, setFilter] = useState<typeof CATEGORIES[number]>('all');

  if (!selectedSlot) return null;

  const filteredMeals = meals.filter(
    (meal) => filter === 'all' || meal.category === filter
  );

  const handleMealClick = (meal: Meal) => {
    onSelectMeal(meal);
    onClose();
  };

  return (
    <Card className="mb-4 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Select meal for {selectedSlot.day} - {selectedSlot.mealType}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
          {filteredMeals.map((meal) => (
            <Button
              key={meal.id}
              variant="outline"
              className="h-auto p-3 flex flex-col items-start text-left"
              onClick={() => handleMealClick(meal)}
            >
              <span className="font-semibold">{meal.name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {meal.category} • {meal.ingredients.length} ingredients
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
