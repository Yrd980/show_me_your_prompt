import { useState } from 'react';
import { MealGrid } from '@/components/MealGrid';
import { MealLibrary } from '@/components/MealLibrary';
import { ShoppingList } from '@/components/ShoppingList';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeekPlan, Meal } from '@/types/meal';
import mealsData from '@/data/meals.json';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const initialWeekPlan: WeekPlan = DAYS.reduce((acc, day) => {
  acc[day] = { breakfast: null, lunch: null, dinner: null };
  return acc;
}, {} as WeekPlan);

function App() {
  const [weekPlan, setWeekPlan] = useLocalStorage<WeekPlan>('mealPlan', initialWeekPlan);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
  } | null>(null);

  const meals = mealsData.meals as Meal[];

  const handleSelectSlot = (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedSlot({ day, mealType });
  };

  const handleSelectMeal = (meal: Meal) => {
    if (!selectedSlot) return;

    setWeekPlan((prev) => ({
      ...prev,
      [selectedSlot.day]: {
        ...prev[selectedSlot.day],
        [selectedSlot.mealType]: meal,
      },
    }));
  };

  const handleRemoveMeal = (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null,
      },
    }));
  };

  const handleCloseLibrary = () => {
    setSelectedSlot(null);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="text-center py-6">
          <h1 className="text-4xl font-bold mb-2">Weekly Meal Planner</h1>
          <p className="text-muted-foreground">
            Plan your meals for the week and generate a shopping list
          </p>
        </header>

        {selectedSlot && (
          <MealLibrary
            meals={meals}
            onSelectMeal={handleSelectMeal}
            selectedSlot={selectedSlot}
            onClose={handleCloseLibrary}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MealGrid
              weekPlan={weekPlan}
              onRemoveMeal={handleRemoveMeal}
              onSelectSlot={handleSelectSlot}
            />
          </div>
          <div className="lg:col-span-1">
            <ShoppingList weekPlan={weekPlan} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
