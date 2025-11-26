# Consumption Learning Deployment

## Deploy

```bash
cd lambda/consumption-learning
npm install
npm run build
npm run package
npm run deploy
```

## Test

```bash
# Add consumption history
aws lambda invoke \
  --function-name thirdshift-dev-consumption-learning \
  --payload '{"action":"add-history","historyData":{"itemName":"Milk","quantityUsed":2.5,"unit":"liters","wasteAmount":0.2}}' \
  --region us-west-2 \
  response.json && cat response.json | jq '.'

# Learn all patterns
aws lambda invoke \
  --function-name thirdshift-dev-consumption-learning \
  --payload '{"action":"learn-all"}' \
  --region us-west-2 \
  response.json && cat response.json | jq '.'

# Get summary
aws lambda invoke \
  --function-name thirdshift-dev-consumption-learning \
  --payload '{"action":"get-summary"}' \
  --region us-west-2 \
  response.json && cat response.json | jq '.'
```

## View Logs

```bash
aws logs tail /aws/lambda/thirdshift-dev-consumption-learning --follow --region us-west-2
```
