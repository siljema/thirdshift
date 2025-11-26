import { CalendarAdapter, CalendarEvent } from './types';

/**
 * Mock Calendar Adapter
 * 
 * This provides realistic mock calendar data for testing.
 * Replace with real Google Calendar or Outlook adapter later.
 */
export class MockCalendarAdapter implements CalendarAdapter {
  async initialize(): Promise<void> {
    console.log('Mock Calendar Adapter initialized');
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    console.log(`Fetching mock events from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const events: CalendarEvent[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dateStr = currentDate.toISOString().split('T')[0];

      // Weekday schedule (Monday-Friday)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Parents work 9-5
        events.push({
          eventId: `work-mom-${dateStr}`,
          title: 'Work',
          startTime: `${dateStr}T09:00:00Z`,
          endTime: `${dateStr}T17:00:00Z`,
          attendees: ['Mom'],
          type: 'work'
        });

        events.push({
          eventId: `work-dad-${dateStr}`,
          title: 'Work',
          startTime: `${dateStr}T09:00:00Z`,
          endTime: `${dateStr}T17:00:00Z`,
          attendees: ['Dad'],
          type: 'work'
        });

        // Kids at school 8-3
        events.push({
          eventId: `school-child1-${dateStr}`,
          title: 'School',
          startTime: `${dateStr}T08:00:00Z`,
          endTime: `${dateStr}T15:00:00Z`,
          attendees: ['Child1'],
          type: 'school'
        });

        events.push({
          eventId: `school-child2-${dateStr}`,
          title: 'School',
          startTime: `${dateStr}T08:00:00Z`,
          endTime: `${dateStr}T15:00:00Z`,
          attendees: ['Child2'],
          type: 'school'
        });

        // Dinner cooking assignments (rotate between parents)
        const cookingPerson = dayOfWeek % 2 === 0 ? 'Mom' : 'Dad';
        events.push({
          eventId: `cooking-${dateStr}`,
          title: `Cooking - ${cookingPerson}`,
          startTime: `${dateStr}T17:30:00Z`,
          endTime: `${dateStr}T18:30:00Z`,
          attendees: [cookingPerson],
          type: 'cooking',
          notes: cookingPerson === 'Mom' ? 'intermediate' : 'beginner'
        });
      }

      // Weekend schedule
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend brunch - Dad cooks
        events.push({
          eventId: `cooking-brunch-${dateStr}`,
          title: 'Cooking - Dad (Brunch)',
          startTime: `${dateStr}T10:00:00Z`,
          endTime: `${dateStr}T11:00:00Z`,
          attendees: ['Dad'],
          type: 'cooking',
          notes: 'beginner'
        });

        // Weekend activities
        if (dayOfWeek === 6) { // Saturday
          events.push({
            eventId: `activity-${dateStr}`,
            title: 'Soccer Practice',
            startTime: `${dateStr}T10:00:00Z`,
            endTime: `${dateStr}T12:00:00Z`,
            attendees: ['Child1', 'Dad'],
            type: 'activity'
          });
        }
      }

      // Special events (example: school trip on first Wednesday)
      if (dayOfWeek === 3 && currentDate.getDate() <= 7) {
        events.push({
          eventId: `trip-${dateStr}`,
          title: 'School Field Trip',
          startTime: `${dateStr}T08:00:00Z`,
          endTime: `${dateStr}T16:00:00Z`,
          attendees: ['Child1'],
          type: 'trip',
          notes: 'needs-packed-lunch'
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  }
}
