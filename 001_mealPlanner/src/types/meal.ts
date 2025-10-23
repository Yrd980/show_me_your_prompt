export interface Ingredient {
  item: string;
  amount: string;
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'spices' | 'other';
}

export interface Meal {
  id: number;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: Ingredient[];
}

export interface MealSlot {
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  meal: Meal | null;
}

export interface WeekPlan {
  [key: string]: {
    breakfast: Meal | null;
    lunch: Meal | null;
    dinner: Meal | null;
  };
}

export interface ShoppingItem extends Ingredient {
  checked: boolean;
}
