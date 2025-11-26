# Consumption Learning Lambda Function

Analyzes consumption patterns and provides recommendations for optimizing shopping quantities.

## Features

- Track consumption history
- Learn weekly usage patterns using exponential moving average
- Detect trends (increasing, decreasing, stable)
- Calculate confidence scores
- Detect and exclude anomalies (vacation weeks)
- Generate shopping recommendations
- Track waste percentages

## Actions

### Add Consumption History

```json
{
  "action": "add-history",
  "historyData": {
    "itemName": "Milk",
    "quantityUsed": 2.5,
    "unit": "liters",
    "date": "2025-11-26",
    "wasteAmount": 0.2,
    "actualServings": 10
  }
}
```

### Learn Pattern for Single Item

```json
{
  "action": "learn-item",
  "itemName": "Milk"
}
```

### Learn All Patterns

```json
{
  "action": "learn-all"
}
```

### Get Pattern

```json
{
  "action": "get-pattern",
  "itemName": "Milk"
}
```

### Get Summary

```json
{
  "action": "get-summary"
}
```

## Learning Algorithm

1. **Exponential Moving Average**: Recent 4 weeks weighted 60%, older data 40%
2. **Trend Detection**: Compares recent vs older averages (>15% change)
3. **Confidence Score**: Based on data consistency and quantity
4. **Anomaly Detection**: Excludes values >2 standard deviations from mean
5. **Waste Tracking**: Calculates waste percentage for optimization

## Output Example

```json
{
  "pattern": {
    "itemName": "Milk",
    "averageWeeklyUsage": 2.5,
    "unit": "liters",
    "wastePercentage": 5.2,
    "confidenceScore": 0.85,
    "trend": "stable",
    "dataPoints": 12,
    "weeklyHistory": [2.0, 2.5, 2.3, 2.7, 2.4, 2.6, 2.5, 2.4, 2.6, 2.5, 2.5, 2.6]
  },
  "recommendation": "Maintain current quantity (2.5 liters/week); Low waste - good quantity management"
}
```

## Integration

Used by Shopping Agent to optimize grocery quantities:
- High confidence patterns → adjust order quantities
- Increasing trend → order 15-20% more
- Decreasing trend → order 15-20% less
- High waste → reduce quantity
