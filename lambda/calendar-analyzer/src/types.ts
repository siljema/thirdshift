// Calendar Types

export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type EventType = 'work' | 'school' | 'trip' | 'activity' | 'cooking' | 'other';

export interface CalendarEvent {
  eventId: string;
  title: string;
  startTime: string; // ISO timestamp
  endTime: string;   // ISO timestamp
  attendees: string[]; // Profile IDs or names
  location?: string;
  type: EventType;
  notes?: string;
}

export interface MealAvailability {
  date: string; // YYYY-MM-DD
  mealType: MealType;
  adultsPresent: number;
  childrenPresent: number;
  totalPeople: number;
  presentProfiles: string[]; // Profile IDs
  absentProfiles: string[];  // Profile IDs
  cookingPerson?: string;    // Profile ID
  cookingExpertise?: string; // beginner, intermediate, advanced
  specialRequirements?: string[]; // e.g., "packed-lunch", "quick-meal"
}

export interface AvailabilityMatrix {
  weekStartDate: string; // YYYY-MM-DD (Monday)
  weekEndDate: string;   // YYYY-MM-DD (Sunday)
  meals: MealAvailability[];
  specialEvents: SpecialEvent[];
  summary: {
    totalMeals: number;
    mealsWithFullFamily: number;
    mealsWithGuests: number;
    packedLunchesNeeded: number;
  };
}

export interface SpecialEvent {
  date: string;
  eventType: 'school-trip' | 'vacation' | 'guest-visit' | 'party' | 'other';
  affectedPeople: string[]; // Profile IDs
  mealImpact: {
    mealType: MealType;
    requiresPackedLunch?: boolean;
    skipMeal?: boolean;
    extraPeople?: number;
  };
  notes?: string;
}

export interface CalendarAdapter {
  initialize(): Promise<void>;
  getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
}
