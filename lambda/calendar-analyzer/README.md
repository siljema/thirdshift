# Calendar Analyzer Lambda Function

Analyzes family calendar to determine meal availability and cooking assignments.

## Features

- Mock calendar integration (replace with real Google/Outlook later)
- Analyzes who is present for each meal
- Detects cooking assignments
- Identifies special events (school trips, etc.)
- Generates availability matrix for the week

## Setup

```bash
npm install
npm run build
npm run package
npm run deploy
```

## Usage

```bash
aws lambda invoke \
  --function-name thirdshift-dev-calendar-analyzer \
  --payload file://test-events/analyze-week.json \
  --region us-west-2 \
  response.json && cat response.json | jq '.'
```

## Mock Calendar Data

The mock adapter generates realistic calendar events:
- **Weekdays**: Parents work 9-5, kids at school 8-3
- **Weekends**: Family activities, brunch
- **Cooking**: Rotates between Mom (intermediate) and Dad (beginner)
- **Special Events**: School trips with packed lunch requirements

## Output

```json
{
  "availabilityMatrix": {
    "weekStartDate": "2025-12-02",
    "weekEndDate": "2025-12-08",
    "meals": [
      {
        "date": "2025-12-02",
        "mealType": "dinner",
        "adultsPresent": 2,
        "childrenPresent": 2,
        "totalPeople": 4,
        "presentProfiles": ["Mom", "Dad", "Child1", "Child2"],
        "cookingPerson": "Mom",
        "cookingExpertise": "intermediate"
      }
    ],
    "specialEvents": [
      {
        "date": "2025-12-04",
        "eventType": "school-trip",
        "affectedPeople": ["Child1"],
        "mealImpact": {
          "mealType": "lunch",
          "requiresPackedLunch": true
        }
      }
    ],
    "summary": {
      "totalMeals": 21,
      "mealsWithFullFamily": 14,
      "packedLunchesNeeded": 1
    }
  }
}
```

## Replacing with Real Calendar

To integrate with Google Calendar or Outlook:

1. Create `google-calendar-adapter.ts` or `outlook-adapter.ts`
2. Implement OAuth authentication
3. Use Google Calendar API or Microsoft Graph API
4. Replace `MockCalendarAdapter` in `index.ts`

See design document for OAuth implementation details.
