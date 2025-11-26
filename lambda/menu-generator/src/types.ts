// Menu Generator Types

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'school_lunch';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Meal {
  date: string;
  mealType: MealType;
  recipeName: string;
  recipeUrl?: string;
  servings: number;
  cookingTime: number;
  difficulty: Difficulty;
  assignedCook?: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutritionInfo?: NutritionInfo;
  cost?: number;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface InventoryUsage {
  name: string;
  quantityUsed: number;
  unit: string;
  category: string;
  fromInventory: number;
  expirationDate?: string;
  isExpiring?: boolean;
}

export interface MealPlan {
  mealPlanId: string;
  weekStartDate: string;
  weekEndDate: string;
  meals: Meal[];
  inventoryUsage: InventoryUsage[];
  shoppingList: ShoppingItem[];
  totalCost: number;
  status: 'draft' | 'approved' | 'active';
  createdAt: string;
}

export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedCost?: number;
}

export interface MenuGenerationInput {
  profiles: any[];
  inventory: any[];
  availabilityMatrix: any;
  budget?: number;
  weekStartDate?: string;
}

export interface BudgetInfo {
  totalBudget: number;
  spent: number;
  remaining: number;
  period: 'weekly' | 'monthly';
}
