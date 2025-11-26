import { BedrockClient } from './bedrock-client';
import { MenuRepository } from './repository';
import { MealPlan, MenuGenerationInput, Meal } from './types';
import { v4 as uuidv4 } from 'uuid';

export class MenuGenerator {
  private bedrockClient: BedrockClient;
  private repository: MenuRepository;
  private useBedrock: boolean;

  constructor() {
    this.bedrockClient = new BedrockClient();
    this.repository = new MenuRepository();
    this.useBedrock = process.env.USE_BEDROCK === 'true';
  }

  async generateWeeklyMenu(input: MenuGenerationInput): Promise<MealPlan> {
    console.log('Generating weekly menu with input:', JSON.stringify(input, null, 2));

    // Get data from repository or use provided data
    let profiles = input.profiles || [];
    let inventory = input.inventory || [];
    let expiringItems: any[] = [];

    try {
      if (!input.profiles) {
        profiles = await this.repository.getAllProfiles();
      }
      if (!input.inventory) {
        inventory = await this.repository.getAllInventory();
      }
      expiringItems = await this.repository.getExpiringInventory(3);
    } catch (error) {
      console.warn('Could not fetch from repository, using provided data:', error);
      // Calculate expiring items from provided inventory
      if (inventory.length > 0) {
        const today = new Date();
        const thresholdDate = new Date(today);
        thresholdDate.setDate(today.getDate() + 3);
        expiringItems = inventory.filter((item: any) => {
          const expDate = new Date(item.expirationDate);
          return expDate <= thresholdDate && expDate >= today;
        });
      }
    }

    console.log(`Found ${profiles.length} profiles, ${inventory.length} inventory items, ${expiringItems.length} expiring items`);

    // Generate meal plan
    let meals: Meal[];
    
    if (this.useBedrock) {
      try {
        meals = await this.generateWithBedrock(profiles, inventory, expiringItems, input);
      } catch (error) {
        console.error('Bedrock generation failed, using mock:', error);
        meals = this.generateMockMeals(input.weekStartDate);
      }
    } else {
      console.log('Bedrock disabled, using mock meals');
      meals = this.generateMockMeals(input.weekStartDate);
    }

    // Calculate inventory usage and shopping list
    const { inventoryUsage, shoppingList } = this.buildInventoryAndShoppingList(meals, inventory, expiringItems);

    // Calculate total cost
    const totalCost = shoppingList.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

    // Create meal plan
    const weekStart = input.weekStartDate || this.getNextMonday();
    const weekEnd = this.addDays(weekStart, 6);

    const mealPlan: MealPlan = {
      mealPlanId: uuidv4(),
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      meals,
      inventoryUsage,
      shoppingList,
      totalCost,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    // Save meal plan
    try {
      await this.repository.saveMealPlan(mealPlan);
      console.log(`Saved meal plan ${mealPlan.mealPlanId} to repository`);
    } catch (error) {
      console.warn('Could not save to repository:', error);
    }

    console.log(`Generated meal plan ${mealPlan.mealPlanId} with ${meals.length} meals`);

    return mealPlan;
  }

  private async generateWithBedrock(
    profiles: any[],
    inventory: any[],
    expiringItems: any[],
    input: MenuGenerationInput
  ): Promise<Meal[]> {
    const prompt = this.bedrockClient.buildMealPlanPrompt({
      profiles,
      inventory,
      availability: input.availabilityMatrix,
      budget: input.budget,
      expiringItems
    });

    const response = await this.bedrockClient.generateMealPlan(prompt);

    // Convert AI response to our Meal format
    const weekStart = input.weekStartDate || this.getNextMonday();
    const meals: Meal[] = [];

    // Add dinners
    if (response.dinners && Array.isArray(response.dinners)) {
      response.dinners.forEach((aiMeal: any, index: number) => {
        const mealDate = this.addDays(weekStart, index);
        meals.push({
          date: mealDate,
          mealType: 'dinner',
          recipeName: aiMeal.recipeName,
          servings: aiMeal.servings || 4,
          cookingTime: aiMeal.cookingTime || 30,
          difficulty: aiMeal.difficulty || 'beginner',
          ingredients: aiMeal.ingredients || [],
          instructions: aiMeal.instructions || [],
          cost: aiMeal.estimatedCost
        });
      });
    }

    // Add school lunches
    if (response.schoolLunches && Array.isArray(response.schoolLunches)) {
      response.schoolLunches.forEach((lunch: any) => {
        meals.push({
          date: lunch.day || weekStart,
          mealType: 'school_lunch',
          recipeName: lunch.recipeName,
          servings: 1,
          cookingTime: lunch.prepTime || 10,
          difficulty: 'beginner',
          ingredients: lunch.items || [],
          instructions: lunch.packingInstructions || [],
          cost: lunch.estimatedCost
        });
      });
    }

    return meals;
  }

  private generateMockMeals(weekStartDate?: string): Meal[] {
    const weekStart = weekStartDate || this.getNextMonday();
    const meals: Meal[] = [];

    // Generate 7 dinners
    const dinnerRecipes = [
      { name: 'Spaghetti Carbonara', time: 25, difficulty: 'beginner' as const },
      { name: 'Chicken Stir-Fry', time: 30, difficulty: 'beginner' as const },
      { name: 'Baked Salmon with Vegetables', time: 35, difficulty: 'intermediate' as const },
      { name: 'Beef Tacos', time: 20, difficulty: 'beginner' as const },
      { name: 'Vegetable Curry', time: 40, difficulty: 'intermediate' as const },
      { name: 'Homemade Pizza', time: 45, difficulty: 'intermediate' as const },
      { name: 'Roast Chicken with Potatoes', time: 60, difficulty: 'advanced' as const }
    ];

    dinnerRecipes.forEach((recipe, index) => {
      meals.push({
        date: this.addDays(weekStart, index),
        mealType: 'dinner',
        recipeName: recipe.name,
        servings: 4,
        cookingTime: recipe.time,
        difficulty: recipe.difficulty,
        ingredients: [
          { name: 'ingredient1', quantity: 2, unit: 'cups' },
          { name: 'ingredient2', quantity: 1, unit: 'lb' }
        ],
        instructions: [
          'Prepare ingredients',
          'Cook according to recipe',
          'Serve hot'
        ],
        cost: 100
      });
    });

    // Generate 10 school lunches (5 days x 2 children)
    const lunchRecipes = [
      'Turkey Sandwich with Veggies',
      'Pasta Salad with Chicken',
      'Wraps with Ham and Cheese',
      'Peanut-Free Trail Mix and Crackers',
      'Mini Pizzas'
    ];

    for (let day = 0; day < 5; day++) {
      for (let child = 1; child <= 2; child++) {
        meals.push({
          date: this.addDays(weekStart, day),
          mealType: 'school_lunch',
          recipeName: `${lunchRecipes[day]} (Child ${child})`,
          servings: 1,
          cookingTime: 10,
          difficulty: 'beginner',
          ingredients: [
            { name: 'bread', quantity: 2, unit: 'slices' },
            { name: 'filling', quantity: 1, unit: 'portion' },
            { name: 'fruit', quantity: 1, unit: 'piece' }
          ],
          instructions: [
            'Prepare lunch items',
            'Pack in lunchbox',
            'Include ice pack if needed'
          ],
          cost: 40
        });
      }
    }

    return meals;
  }

  private buildInventoryAndShoppingList(
    meals: Meal[], 
    currentInventory: any[],
    expiringItems: any[]
  ): { inventoryUsage: any[]; shoppingList: any[] } {
    // Aggregate all ingredients from meals
    const ingredientMap = new Map<string, { quantity: number; unit: string; category: string }>();

    meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.quantity += ingredient.quantity;
        } else {
          ingredientMap.set(key, {
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            category: 'other'
          });
        }
      });
    });

    // Build inventory usage list
    const inventoryUsage: any[] = [];
    const inventoryMap = new Map(
      currentInventory.map(item => [item.name.toLowerCase(), item])
    );

    // Calculate what we'll use from inventory
    ingredientMap.forEach((needed, name) => {
      const inventoryItem = inventoryMap.get(name);
      if (inventoryItem) {
        const usedFromInventory = Math.min(needed.quantity, inventoryItem.quantity);
        if (usedFromInventory > 0) {
          const isExpiring = expiringItems.some(exp => 
            exp.name.toLowerCase() === name
          );
          
          inventoryUsage.push({
            name: inventoryItem.name,
            quantityUsed: usedFromInventory,
            unit: inventoryItem.unit,
            category: inventoryItem.category || 'other',
            fromInventory: inventoryItem.quantity,
            expirationDate: inventoryItem.expirationDate,
            isExpiring
          });
          
          // Reduce needed quantity by what we have
          needed.quantity -= usedFromInventory;
        }
      }
    });

    // Build shopping list (only what we still need)
    const shoppingList: any[] = [];
    ingredientMap.forEach((value, name) => {
      if (value.quantity > 0) {
        shoppingList.push({
          name,
          quantity: Math.ceil(value.quantity * 10) / 10, // Round to 1 decimal
          unit: value.unit,
          category: value.category,
          estimatedCost: 50 // Mock cost
        });
      }
    });

    return { inventoryUsage, shoppingList };
  }

  private getNextMonday(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split('T')[0];
  }

  private addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}
