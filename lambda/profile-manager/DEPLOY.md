# Profile Manager Deployment Guide

## Step 1: Install Dependencies

```bash
cd lambda/profile-manager
npm install
```

## Step 2: Build the Lambda Function

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

## Step 3: Package for Lambda

```bash
npm run package
```

This creates `profile-manager.zip` containing all code and dependencies.

## Step 4: Deploy to AWS Lambda

### Option A: Using npm script

```bash
npm run deploy
```

### Option B: Manual deployment

```bash
aws lambda update-function-code \
  --function-name thirdshift-dev-profile-manager \
  --zip-file fileb://profile-manager.zip \
  --region us-west-2
```

## Step 5: Test the API

### Make the test script executable

```bash
chmod +x test-api.sh
```

### Run all tests

```bash
./test-api.sh
```

This will:
1. Create a family member profile
2. Create a guest profile
3. Get a profile by ID
4. List all profiles
5. List only family members
6. Update a profile
7. Delete a profile
8. Verify deletion
9. Test validation errors

## Manual Testing with curl

### Get the API URL

```bash
cd ../../infrastructure/environments/dev
terraform output api_gateway_url
```

### Create a profile

```bash
curl -X POST https://YOUR_API_URL/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "type": "family_member",
    "name": "John Doe",
    "age": 35,
    "role": "adult",
    "cookingExpertiseLevel": "intermediate"
  }'
```

### List profiles

```bash
curl https://YOUR_API_URL/profiles
```

### Get a specific profile

```bash
curl https://YOUR_API_URL/profiles/{profileId}
```

### Update a profile

```bash
curl -X PUT https://YOUR_API_URL/profiles/{profileId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "age": 36
  }'
```

### Delete a profile

```bash
curl -X DELETE https://YOUR_API_URL/profiles/{profileId}
```

## Troubleshooting

### Lambda function not updating

If changes aren't reflected, wait a few seconds and try again. Lambda can take time to propagate updates.

### Permission errors

Make sure your AWS credentials have permission to update Lambda functions:

```bash
aws sts get-caller-identity
```

### DynamoDB errors

Verify the table exists:

```bash
aws dynamodb describe-table \
  --table-name thirdshift-dev-profiles \
  --region us-west-2
```

### View Lambda logs

```bash
aws logs tail /aws/lambda/thirdshift-dev-profile-manager --follow
```

## Development Workflow

1. Make code changes in `src/`
2. Run `npm run build` to compile
3. Run `npm run package` to create zip
4. Run `npm run deploy` to update Lambda
5. Test with `./test-api.sh` or manual curl commands

## Next Steps

After verifying the Profile Manager works:
- Move on to Task 3: Implement Inventory Manager
- Or continue building other Lambda functions
