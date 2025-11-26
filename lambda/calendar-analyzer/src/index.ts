import { MockCalendarAdapter } from './mock-calendar-adapter';
import { CalendarAnalyzer } from './analyzer';
import { AvailabilityMatrix } from './types';

interface LambdaEvent {
  action: 'analyze-week';
  weekStartDate?: string; // YYYY-MM-DD, defaults to next Monday
  profiles?: Array<{
    profileId: string;
    name: string;
    role: 'adult' | 'child';
    cookingExpertiseLevel?: string;
  }>;
}

interface LambdaResult {
  statusCode: number;
  body: any;
}

// Initialize calendar adapter (mock for now)
const calendarAdapter = new MockCalendarAdapter();
const analyzer = new CalendarAnalyzer();

export const handler = async (event: LambdaEvent): Promise<LambdaResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    await calendarAdapter.initialize();

    // Determine week start date (next Monday if not specified)
    let weekStartDate: Date;
    if (event.weekStartDate) {
      weekStartDate = new Date(event.weekStartDate);
    } else {
      weekStartDate = getNextMonday();
    }

    // Get week end date
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    // Fetch calendar events
    const events = await calendarAdapter.getEvents(weekStartDate, weekEndDate);
    console.log(`Retrieved ${events.length} calendar events`);

    // Use provided profiles or default family
    const profiles = event.profiles || getDefaultProfiles();

    // Analyze availability
    const availabilityMatrix = analyzer.analyzeWeek(events, profiles, weekStartDate);

    return {
      statusCode: 200,
      body: {
        message: 'Calendar analysis complete',
        availabilityMatrix,
        eventsAnalyzed: events.length
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: { error: 'Internal server error', details: (error as Error).message }
    };
  }
};

function getNextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  
  return nextMonday;
}

function getDefaultProfiles() {
  return [
    {
      profileId: 'mom',
      name: 'Mom',
      role: 'adult' as const,
      cookingExpertiseLevel: 'intermediate'
    },
    {
      profileId: 'dad',
      name: 'Dad',
      role: 'adult' as const,
      cookingExpertiseLevel: 'beginner'
    },
    {
      profileId: 'child1',
      name: 'Child1',
      role: 'child' as const
    },
    {
      profileId: 'child2',
      name: 'Child2',
      role: 'child' as const
    }
  ];
}
