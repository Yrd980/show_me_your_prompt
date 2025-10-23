import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeekPlan, Ingredient, ShoppingItem } from '@/types/meal';
import { Check, Square } from 'lucide-react';

interface ShoppingListProps {
  weekPlan: WeekPlan;
}

const CATEGORY_ORDER = ['produce', 'meat', 'dairy', 'pantry', 'spices', 'other'] as const;

export function ShoppingList({ weekPlan }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const shoppingList = useMemo(() => {
    const itemsMap = new Map<string, ShoppingItem>();

    Object.values(weekPlan).forEach((day) => {
      ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
        const meal = day[mealType as keyof typeof day];
        if (meal) {
          meal.ingredients.forEach((ingredient) => {
            const key = `${ingredient.item.toLowerCase()}-${ingredient.category}`;
            if (itemsMap.has(key)) {
              const existing = itemsMap.get(key)!;
              existing.amount = `${existing.amount}, ${ingredient.amount}`;
            } else {
              itemsMap.set(key, {
                ...ingredient,
                checked: checkedItems.has(key),
              });
            }
          });
        }
      });
    });

    const grouped = CATEGORY_ORDER.reduce((acc, category) => {
      acc[category] = Array.from(itemsMap.values()).filter(
        (item) => item.category === category
      );
      return acc;
    }, {} as Record<string, ShoppingItem[]>);

    return grouped;
  }, [weekPlan, checkedItems]);

  const toggleItem = (item: ShoppingItem) => {
    const key = `${item.item.toLowerCase()}-${item.category}`;
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const totalItems = Object.values(shoppingList).reduce(
    (sum, items) => sum + items.length,
    0
  );

  const checkedCount = checkedItems.size;

  if (totalItems === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shopping List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Add meals to your weekly plan to generate a shopping list.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Shopping List</span>
          <span className="text-sm font-normal text-muted-foreground">
            {checkedCount} / {totalItems} items
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {CATEGORY_ORDER.map((category) => {
            const items = shoppingList[category];
            if (items.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                  {category}
                </h3>
                <div className="space-y-1">
                  {items.map((item, index) => {
                    const key = `${item.item.toLowerCase()}-${item.category}`;
                    const isChecked = checkedItems.has(key);
                    return (
                      <Button
                        key={`${key}-${index}`}
                        variant="ghost"
                        className="w-full justify-start h-auto py-2 px-2"
                        onClick={() => toggleItem(item)}
                      >
                        {isChecked ? (
                          <Check className="h-4 w-4 mr-2 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 mr-2" />
                        )}
                        <span className={isChecked ? 'line-through text-muted-foreground' : ''}>
                          {item.item} - {item.amount}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
