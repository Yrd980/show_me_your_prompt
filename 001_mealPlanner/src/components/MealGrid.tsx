import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Meal, WeekPlan } from '@/types/meal';
import { X } from 'lucide-react';

interface MealGridProps {
  weekPlan: WeekPlan;
  onRemoveMeal: (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  onSelectSlot: (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];

export function MealGrid({ weekPlan, onRemoveMeal, onSelectSlot }: MealGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Meal Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-muted font-semibold">Day</th>
                <th className="border p-2 bg-muted font-semibold">Breakfast</th>
                <th className="border p-2 bg-muted font-semibold">Lunch</th>
                <th className="border p-2 bg-muted font-semibold">Dinner</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td className="border p-2 font-medium">{day}</td>
                  {MEAL_TYPES.map((mealType) => (
                    <td key={`${day}-${mealType}`} className="border p-2">
                      {weekPlan[day]?.[mealType] ? (
                        <div className="flex items-center justify-between gap-2 bg-secondary p-2 rounded">
                          <span className="text-sm">{weekPlan[day][mealType]?.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onRemoveMeal(day, mealType)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => onSelectSlot(day, mealType)}
                        >
                          Add meal
                        </Button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
