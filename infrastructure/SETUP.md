# ThirdShift Infrastructure Setup Guide

## Prerequisites

1. **Install Terraform**
   ```bash
   brew install terraform  # macOS
   ```

2. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and default region (eu-west-1)
   ```

3. **Verify AWS credentials**
   ```bash
   aws sts get-caller-identity
   ```

4. **Enable AWS Bedrock**
   - Go to AWS Bedrock console (us-east-1 region)
   - Request access to Anthropic Claude 3 models
   - Approval is usually instant
   - Required for AI-powered meal planning

## Quick Start

### 1. Initialize Terraform (Dev Environment)

```bash
cd infrastructure/environments/dev
terraform init
```

### 2. Review the plan

```bash
terraform plan
```

### 3. Deploy infrastructure

```bash
terraform apply
```

Type `yes` when prompted to confirm.

### 4. Configure Secrets

After deployment, you need to set the secret values for API credentials:

```bash
# Calendar credentials (Google/Microsoft)
aws secretsmanager put-secret-value \
  --secret-id thirdshift-dev-calendar-credentials \
  --secret-string '{
    "google_client_id": "your-client-id",
    "google_client_secret": "your-client-secret",
    "microsoft_client_id": "your-client-id",
    "microsoft_client_secret": "your-client-secret"
  }'

# Oda credentials
aws secretsmanager put-secret-value \
  --secret-id thirdshift-dev-oda-credentials \
  --secret-string '{
    "api_key": "your-oda-api-key",
    "customer_id": "your-customer-id"
  }'

# Bank/Payment credentials
aws secretsmanager put-secret-value \
  --secret-id thirdshift-dev-bank-credentials \
  --secret-string '{
    "vipps_client_id": "your-client-id",
    "vipps_client_secret": "your-client-secret"
  }'

# Recipe API keys
aws secretsmanager put-secret-value \
  --secret-id thirdshift-dev-recipe-api-keys \
  --secret-string '{
    "spoonacular_key": "your-spoonacular-key",
    "edamam_app_id": "your-edamam-app-id",
    "edamam_app_key": "your-edamam-key"
  }'

# Fridge inventory credentials
aws secretsmanager put-secret-value \
  --secret-id thirdshift-dev-fridge-credentials \
  --secret-string '{
    "api_key": "your-fridge-api-key",
    "device_id": "your-device-id"
  }'
```

## What Gets Created

### DynamoDB Tables
- `thirdshift-dev-profiles` - Family member and guest profiles
- `thirdshift-dev-inventory` - Food inventory with expiration dates
- `thirdshift-dev-meal-plans` - Weekly meal plans
- `thirdshift-dev-orders` - Grocery orders
- `thirdshift-dev-budgets` - Budget tracking
- `thirdshift-dev-consumption-history` - Historical consumption data
- `thirdshift-dev-consumption-patterns` - Learned patterns

### Lambda Functions
- `thirdshift-dev-profile-manager` - Profile CRUD operations
- `thirdshift-dev-inventory-manager` - Inventory tracking
- `thirdshift-dev-calendar-analyzer` - Calendar integration
- `thirdshift-dev-menu-generator` - Meal plan generation
- `thirdshift-dev-shopping-agent` - Grocery ordering
- `thirdshift-dev-consumption-learning` - Pattern learning
- `thirdshift-dev-budget-tracker` - Budget monitoring

### Other Resources
- S3 bucket for meal plans and reports
- API Gateway for profile management
- Step Functions state machine for workflow orchestration
- EventBridge rule for weekly scheduling (Sunday 20:00)
- CloudWatch dashboards and alarms
- Secrets Manager secrets for API credentials

## Outputs

After deployment, Terraform will output:

```
dynamodb_tables = {
  profiles = "thirdshift-dev-profiles"
  inventory = "thirdshift-dev-inventory"
  ...
}

api_gateway_url = "https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/profiles"

s3_bucket_name = "thirdshift-dev-meal-plans"

step_functions_arn = "arn:aws:states:eu-west-1:xxxxx:stateMachine:thirdshift-dev-weekly-planning"
```

## Testing the Deployment

### 1. Test API Gateway

```bash
# Get the API URL from outputs
API_URL=$(terraform output -raw api_gateway_url)

# Create a test profile
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "type": "family_member",
    "age": 35,
    "role": "adult",
    "dietaryRestrictions": [],
    "allergies": [],
    "dislikes": [],
    "preferences": ["italian"],
    "cookingExpertiseLevel": "intermediate"
  }'
```

### 2. Manually Trigger Step Functions

```bash
# Get the state machine ARN
STATE_MACHINE_ARN=$(terraform output -raw step_functions_arn)

# Start execution
aws stepfunctions start-execution \
  --state-machine-arn $STATE_MACHINE_ARN \
  --input '{"trigger":"manual_test"}'
```

### 3. View CloudWatch Dashboard

```bash
# Open in browser
open "https://console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=thirdshift-dev-dashboard"
```

## Deploying to Other Environments

### Staging
```bash
cd infrastructure/environments/staging
terraform init
terraform apply
```

### Production
```bash
cd infrastructure/environments/prod
terraform init
terraform apply
```

## Cleanup

To destroy all resources:

```bash
cd infrastructure/environments/dev
terraform destroy
```

**Warning**: This will delete all data in DynamoDB tables and S3 buckets!

## Next Steps

1. Deploy Lambda function code (currently using placeholder)
2. Configure calendar API OAuth flows
3. Set up Oda API integration
4. Test end-to-end workflow
5. Configure SNS email subscriptions for alerts

## Troubleshooting

### Terraform init fails
- Ensure AWS credentials are configured
- Check internet connectivity

### Apply fails with permission errors
- Verify IAM user has necessary permissions
- Check AWS account limits

### Lambda functions not working
- Lambda code needs to be deployed (currently placeholder)
- Check CloudWatch Logs for errors

## Cost Estimation

Expected monthly costs for dev environment (single family):
- DynamoDB: ~$10 (on-demand)
- Lambda: ~$20 (1000 invocations/month)
- **Bedrock (Claude 3)**: ~$0.60 (AI-powered meal planning)
- S3: ~$2
- API Gateway: ~$5
- Other services: ~$20
- **Total: ~$57-62/month**

Production costs will scale with number of families using the service.

**Note**: Bedrock costs are minimal (~$0.15/week per family) but provide significant value through intelligent, personalized meal planning.
