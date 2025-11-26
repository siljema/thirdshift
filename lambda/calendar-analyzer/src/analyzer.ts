import { CalendarEvent, MealAvailability, AvailabilityMatrix, SpecialEvent, MealType } from './types';

interface Profile {
  profileId: string;
  name: string;
  role: 'adult' | 'child';
  cookingExpertiseLevel?: string;
}

export class CalendarAnalyzer {
  analyzeWeek(
    events: CalendarEvent[],
    profiles: Profile[],
    weekStartDate: Date
  ): AvailabilityMatrix {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    const meals: MealAvailability[] = [];
    const specialEvents: SpecialEvent[] = [];

    // Generate meals for each day
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Breakfast, Lunch, Dinner for each day
      meals.push(this.analyzeMeal(dateStr, 'breakfast', events, profiles));
      meals.push(this.analyzeMeal(dateStr, 'lunch', events, profiles));
      meals.push(this.analyzeMeal(dateStr, 'dinner', events, profiles));
    }

    // Detect special events
    specialEvents.push(...this.detectSpecialEvents(events, weekStartDate, weekEndDate));

    // Calculate summary
    const summary = {
      totalMeals: meals.length,
      mealsWithFullFamily: meals.filter(m => m.totalPeople === profiles.length).length,
      mealsWithGuests: 0, // TODO: detect guests from calendar
      packedLunchesNeeded: specialEvents.filter(e => e.mealImpact.requiresPackedLunch).length
    };

    return {
      weekStartDate: weekStartDate.toISOString().split('T')[0],
      weekEndDate: weekEndDate.toISOString().split('T')[0],
      meals,
      specialEvents,
      summary
    };
  }

  private analyzeMeal(
    date: string,
    mealType: MealType,
    events: CalendarEvent[],
    profiles: Profile[]
  ): MealAvailability {
    const mealTimes = this.getMealTimeRange(date, mealType);
    
    // Check who is available (not in conflicting events)
    const presentProfiles: string[] = [];
    const absentProfiles: string[] = [];

    for (const profile of profiles) {
      const isAvailable = this.isPersonAvailable(
        profile.name,
        mealTimes.start,
        mealTimes.end,
        events
      );

      if (isAvailable) {
        presentProfiles.push(profile.name);
      } else {
        absentProfiles.push(profile.name);
      }
    }

    // Find who is cooking
    const cookingEvent = this.findCookingAssignment(date, mealType, events);
    let cookingPerson: string | undefined;
    let cookingExpertise: string | undefined;

    if (cookingEvent) {
      cookingPerson = cookingEvent.attendees[0];
      cookingExpertise = cookingEvent.notes || 'beginner';
    } else if (mealType === 'dinner' && presentProfiles.length > 0) {
      // Default: first available adult cooks
      const availableAdult = profiles.find(
        p => p.role === 'adult' && presentProfiles.includes(p.name)
      );
      if (availableAdult) {
        cookingPerson = availableAdult.name;
        cookingExpertise = availableAdult.cookingExpertiseLevel || 'beginner';
      }
    }

    // Check for special requirements
    const specialRequirements: string[] = [];
    const tripEvents = events.filter(
      e => e.type === 'trip' && 
      e.startTime.startsWith(date) &&
      e.notes?.includes('packed-lunch')
    );
    if (tripEvents.length > 0) {
      specialRequirements.push('packed-lunch');
    }

    const adultsPresent = presentProfiles.filter(name => 
      profiles.find(p => p.name === name && p.role === 'adult')
    ).length;

    const childrenPresent = presentProfiles.filter(name =>
      profiles.find(p => p.name === name && p.role === 'child')
    ).length;

    return {
      date,
      mealType,
      adultsPresent,
      childrenPresent,
      totalPeople: presentProfiles.length,
      presentProfiles,
      absentProfiles,
      cookingPerson,
      cookingExpertise,
      specialRequirements: specialRequirements.length > 0 ? specialRequirements : undefined
    };
  }

  private getMealTimeRange(date: string, mealType: MealType): { start: Date; end: Date } {
    const start = new Date(`${date}T00:00:00Z`);
    const end = new Date(`${date}T00:00:00Z`);

    switch (mealType) {
      case 'breakfast':
        start.setHours(6, 0, 0);
        end.setHours(9, 0, 0);
        break;
      case 'lunch':
        start.setHours(11, 0, 0);
        end.setHours(14, 0, 0);
        break;
      case 'dinner':
        start.setHours(17, 0, 0);
        end.setHours(20, 0, 0);
        break;
    }

    return { start, end };
  }

  private isPersonAvailable(
    personName: string,
    mealStart: Date,
    mealEnd: Date,
    events: CalendarEvent[]
  ): boolean {
    // Check if person has any conflicting events
    const conflictingEvents = events.filter(event => {
      if (!event.attendees.includes(personName)) return false;

      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      // Check for overlap
      return (eventStart < mealEnd && eventEnd > mealStart);
    });

    return conflictingEvents.length === 0;
  }

  private findCookingAssignment(
    date: string,
    mealType: MealType,
    events: CalendarEvent[]
  ): CalendarEvent | undefined {
    return events.find(
      e => e.type === 'cooking' &&
      e.startTime.startsWith(date) &&
      this.matchesMealTime(e.startTime, mealType)
    );
  }

  private matchesMealTime(eventTime: string, mealType: MealType): boolean {
    const hour = new Date(eventTime).getHours();

    switch (mealType) {
      case 'breakfast':
        return hour >= 6 && hour < 9;
      case 'lunch':
        return hour >= 10 && hour < 14;
      case 'dinner':
        return hour >= 17 && hour < 20;
      default:
        return false;
    }
  }

  private detectSpecialEvents(
    events: CalendarEvent[],
    weekStart: Date,
    weekEnd: Date
  ): SpecialEvent[] {
    const specialEvents: SpecialEvent[] = [];

    const tripEvents = events.filter(e => e.type === 'trip');
    
    for (const event of tripEvents) {
      const eventDate = new Date(event.startTime);
      if (eventDate >= weekStart && eventDate <= weekEnd) {
        specialEvents.push({
          date: eventDate.toISOString().split('T')[0],
          eventType: 'school-trip',
          affectedPeople: event.attendees,
          mealImpact: {
            mealType: 'lunch',
            requiresPackedLunch: event.notes?.includes('packed-lunch') || false
          },
          notes: event.title
        });
      }
    }

    return specialEvents;
  }
}
