# Calendar Analyzer Deployment Guide

## Deploy

```bash
cd lambda/calendar-analyzer
npm install
npm run build
npm run package
npm run deploy
```

## Test

```bash
aws lambda invoke \
  --function-name thirdshift-dev-calendar-analyzer \
  --payload file://test-events/analyze-week.json \
  --region us-west-2 \
  response.json && cat response.json | jq '.'
```

## View Logs

```bash
aws logs tail /aws/lambda/thirdshift-dev-calendar-analyzer --follow --region us-west-2
```

## What It Does

1. Generates mock calendar events for a typical week
2. Analyzes availability for 21 meals (7 days × 3 meals)
3. Determines who is present for each meal
4. Identifies cooking assignments
5. Detects special events (school trips, etc.)
6. Returns availability matrix for Menu Generator

## Next Steps

The availability matrix is used by the Menu Generator (Task 6) to:
- Adjust portion sizes based on who's present
- Select recipes matching cook's expertise
- Plan packed lunches for special events
- Optimize meal planning for the family's schedule
