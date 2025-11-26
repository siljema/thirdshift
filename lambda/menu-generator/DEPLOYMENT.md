# Menu Generator Lambda - Deployment Guide

## Prerequisites

1. **AWS CLI** configured with credentials
   ```bash
   aws configure
   ```

2. **Terraform** installed (for infrastructure setup)
   ```bash
   brew install terraform  # macOS
   ```

3. **Node.js 18+** and npm installed
   ```bash
   node --version  # Should be 18.x or higher
   ```

## Step 1: Deploy Infrastructure (First Time Only)

The Lambda function must be created via Terraform before you can deploy code.

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply infrastructure
terraform apply
```

This creates:
- Lambda function: `thirdshift-dev-menu-generator`
- IAM roles and policies
- CloudWatch log group
- DynamoDB tables
- S3 bucket for meal plans

## Step 2: Deploy Lambda Code

### Quick Deploy

```bash
cd lambda/menu-generator
./deploy.sh
```

This will:
1. Install dependencies
2. Build TypeScript code
3. Package into zip file
4. Upload to AWS Lambda
5. Update environment variables

### Custom Environment/Region

```bash
./deploy.sh prod us-east-1
```

### Manual Deployment

If you prefer manual steps:

```bash
# Build
npm install
npm run build

# Package
cd dist
zip -r ../menu-generator.zip .
cd ..
zip -r menu-generator.zip node_modules

# Deploy
aws lambda update-function-code \
  --function-name thirdshift-dev-menu-generator \
  --zip-file fileb://menu-generator.zip \
  --region us-west-2
```

## Step 3: Configure Environment Variables

The Lambda needs these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `MEAL_PLANS_TABLE` | DynamoDB table for meal plans | `thirdshift-dev-meal-plans` |
| `PROFILES_TABLE` | DynamoDB table for profiles | `thirdshift-dev-profiles` |
| `INVENTORY_TABLE` | DynamoDB table for inventory | `thirdshift-dev-inventory` |
| `MEAL_PLANS_BUCKET` | S3 bucket for detailed plans | `thirdshift-dev-meal-plans` |
| `BEDROCK_MODEL_ID` | Bedrock model to use | `anthropic.claude-3-sonnet-20240229-v1:0` |
| `BEDROCK_REGION` | Region for Bedrock | `us-east-1` |
| `USE_BEDROCK` | Enable AI features | `false` (set to `true` for AI) |
| `ENVIRONMENT` | Environment name | `dev` |

These are set automatically by the deploy script.

## Step 4: Enable AWS Bedrock (Optional)

To use AI-powered meal planning:

### 4.1 Request Bedrock Access

1. Go to AWS Console → Bedrock
2. Navigate to "Model access"
3. Request access to "Claude 3 Sonnet"
4. Wait for approval (usually instant)

### 4.2 Enable in Lambda

```bash
aws lambda update-function-configuration \
  --function-name thirdshift-dev-menu-generator \
  --environment Variables="{
    MEAL_PLANS_TABLE=thirdshift-dev-meal-plans,
    PROFILES_TABLE=thirdshift-dev-profiles,
    INVENTORY_TABLE=thirdshift-dev-inventory,
    MEAL_PLANS_BUCKET=thirdshift-dev-meal-plans,
    BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0,
    BEDROCK_REGION=us-east-1,
    USE_BEDROCK=true,
    ENVIRONMENT=dev
  }" \
  --region us-west-2
```

Or redeploy with Bedrock enabled:
```bash
# Edit deploy.sh and change USE_BEDROCK=true
./deploy.sh
```

## Step 5: Test the Lambda

### Test with AWS CLI

```bash
aws lambda invoke \
  --function-name thirdshift-dev-menu-generator \
  --region us-west-2 \
  --payload file://test-events/generate-menu.json \
  response.json

# View response
cat response.json | jq .
```

### Test via AWS Console

1. Go to Lambda → Functions → `thirdshift-dev-menu-generator`
2. Click "Test" tab
3. Create new test event with content from `test-events/generate-menu.json`
4. Click "Test"
5. View execution results

### Expected Response

```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "mealPlan": {
      "mealPlanId": "uuid",
      "weekStartDate": "2025-12-02",
      "weekEndDate": "2025-12-08",
      "meals": [
        // 7 dinners + 10 school lunches
      ],
      "shoppingList": [...],
      "totalCost": 850
    }
  }
}
```

## Step 6: Monitor and Debug

### View Logs

```bash
# Tail logs in real-time
aws logs tail /aws/lambda/thirdshift-dev-menu-generator \
  --region us-west-2 \
  --follow

# View recent logs
aws logs tail /aws/lambda/thirdshift-dev-menu-generator \
  --region us-west-2 \
  --since 1h
```

### Check Metrics

```bash
# Get function info
aws lambda get-function \
  --function-name thirdshift-dev-menu-generator \
  --region us-west-2

# Get function configuration
aws lambda get-function-configuration \
  --function-name thirdshift-dev-menu-generator \
  --region us-west-2
```

### Common Issues

#### 1. "Function not found"
- Run Terraform first: `cd infrastructure && terraform apply`
- Check function name matches environment

#### 2. "Access Denied" for DynamoDB
- Verify IAM role has DynamoDB permissions
- Check table names in environment variables

#### 3. "Bedrock access denied"
- Request model access in Bedrock console
- Verify IAM role has `bedrock:InvokeModel` permission
- Check `BEDROCK_REGION` is `us-east-1`

#### 4. "Timeout"
- Increase Lambda timeout (currently 300s)
- Check if Bedrock is responding slowly
- Try with `USE_BEDROCK=false` first

## Step 7: Integration with API Gateway

To expose via HTTP API:

```bash
# Get API Gateway endpoint from Terraform
cd infrastructure
terraform output api_gateway_url

# Test via HTTP
curl -X POST https://your-api-id.execute-api.us-west-2.amazonaws.com/dev/menu/generate \
  -H "Content-Type: application/json" \
  -d @test-events/generate-menu.json
```

## Cost Estimates

### Without Bedrock (Mock Mode)
- Lambda execution: ~$0.01 per 1000 invocations
- DynamoDB: ~$0.25/month (on-demand)
- S3: ~$0.02/month
- **Total: ~$0.30/month**

### With Bedrock (AI Mode)
- Lambda execution: ~$0.01 per 1000 invocations
- Bedrock (Claude 3 Sonnet): ~$0.015 per request
- DynamoDB: ~$0.25/month
- S3: ~$0.02/month
- **Total: ~$1.50/month** (assuming 100 meal plans/month)

## Updating the Lambda

### Code Changes

```bash
# Make changes to src/*.ts files
# Then redeploy
./deploy.sh
```

### Configuration Changes

```bash
# Update via AWS CLI
aws lambda update-function-configuration \
  --function-name thirdshift-dev-menu-generator \
  --timeout 600 \
  --memory-size 2048 \
  --region us-west-2
```

### Rollback

```bash
# List versions
aws lambda list-versions-by-function \
  --function-name thirdshift-dev-menu-generator \
  --region us-west-2

# Rollback to previous version
aws lambda update-alias \
  --function-name thirdshift-dev-menu-generator \
  --name PROD \
  --function-version 2 \
  --region us-west-2
```

## Production Checklist

Before going to production:

- [ ] Enable Bedrock for AI features
- [ ] Set up CloudWatch alarms for errors
- [ ] Configure Lambda reserved concurrency
- [ ] Enable X-Ray tracing
- [ ] Set up proper IAM roles (least privilege)
- [ ] Configure VPC if needed
- [ ] Set up proper backup for DynamoDB
- [ ] Enable S3 versioning for meal plans
- [ ] Configure proper log retention
- [ ] Set up monitoring dashboard
- [ ] Test with real data
- [ ] Load test with expected traffic

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review `IMPLEMENTATION.md` for architecture details
3. See `ENHANCED-PROMPT-EXAMPLE.md` for AI prompt details
4. Test locally first: `npm run build && ./test.sh`
