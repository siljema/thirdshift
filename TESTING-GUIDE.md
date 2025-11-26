# ThirdShift Testing Guide

## Profile Manager API Testing

### Quick Start

1. **Deploy the Lambda function**:
```bash
cd lambda/profile-manager
npm install
npm run package
npm run deploy
```

2. **Run automated tests**:
```bash
chmod +x test-api.sh
./test-api.sh
```

### Manual Testing

#### Get your API URL

```bash
cd infrastructure/environments/dev
terraform output api_gateway_url
```

Example output: `https://abc123.execute-api.us-west-2.amazonaws.com/dev/profiles`

#### Test 1: Create a Family Member

```bash
curl -X POST https://YOUR_API_URL/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "type": "family_member",
    "name": "Mom",
    "age": 38,
    "role": "adult",
    "dietaryRestrictions": ["gluten-free"],
    "allergies": ["shellfish"],
    "dislikes": ["mushrooms"],
    "preferences": ["italian", "mexican"],
    "cookingExpertiseLevel": "intermediate"
  }'
```

Expected response (201 Created):
```json
{
  "profileId": "uuid-here",
  "type": "family_member",
  "name": "Mom",
  "age": 38,
  "role": "adult",
  "dietaryRestrictions": ["gluten-free"],
  "allergies": ["shellfish"],
  "dislikes": ["mushrooms"],
  "preferences": ["italian", "mexican"],
  "cookingExpertiseLevel": "intermediate",
  "createdAt": "2025-11-26T...",
  "updatedAt": "2025-11-26T..."
}
```

#### Test 2: Create a Guest

```bash
curl -X POST https://YOUR_API_URL/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "type": "guest",
    "name": "Grandma",
    "dietaryRestrictions": ["low-sodium"],
    "allergies": [],
    "dislikes": ["spicy-food"],
    "preferences": ["comfort-food"],
    "visitDates": ["2025-12-24", "2025-12-25"]
  }'
```

#### Test 3: List All Profiles

```bash
curl https://YOUR_API_URL/profiles
```

Expected response:
```json
{
  "profiles": [
    { "profileId": "...", "name": "Mom", ... },
    { "profileId": "...", "name": "Grandma", ... }
  ],
  "count": 2
}
```

#### Test 4: Get a Specific Profile

```bash
curl https://YOUR_API_URL/profiles/{profileId}
```

#### Test 5: Update a Profile

```bash
curl -X PUT https://YOUR_API_URL/profiles/{profileId} \
  -H "Content-Type: application/json" \
  -d '{
    "age": 39,
    "cookingExpertiseLevel": "advanced"
  }'
```

#### Test 6: Delete a Profile

```bash
curl -X DELETE https://YOUR_API_URL/profiles/{profileId}
```

Expected response: 204 No Content

#### Test 7: Filter by Type

```bash
# Only family members
curl https://YOUR_API_URL/profiles?type=family_member

# Only guests
curl https://YOUR_API_URL/profiles?type=guest
```

### Validation Testing

#### Test Invalid Data

```bash
# Missing required field
curl -X POST https://YOUR_API_URL/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "type": "family_member",
    "age": 35,
    "role": "adult"
  }'
```

Expected: 400 Bad Request with error message

```bash
# Invalid age
curl -X POST https://YOUR_API_URL/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "type": "family_member",
    "name": "Test",
    "age": 200,
    "role": "adult"
  }'
```

Expected: 400 Bad Request - "Age must be a number between 0 and 150"

```bash
# Invalid cooking level
curl -X POST https://YOUR_API_URL/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "type": "family_member",
    "name": "Test",
    "age": 35,
    "role": "adult",
    "cookingExpertiseLevel": "expert"
  }'
```

Expected: 400 Bad Request - "Cooking expertise level must be one of: beginner, intermediate, advanced"

### Using Postman

1. Import the API URL as a new request
2. Set method to POST, PUT, GET, or DELETE
3. Add header: `Content-Type: application/json`
4. Add request body (for POST/PUT)
5. Send request

### View Lambda Logs

```bash
aws logs tail /aws/lambda/thirdshift-dev-profile-manager --follow
```

This shows real-time logs from the Lambda function.

### Check DynamoDB Data

```bash
# Scan all profiles
aws dynamodb scan \
  --table-name thirdshift-dev-profiles \
  --region us-west-2

# Get specific profile
aws dynamodb get-item \
  --table-name thirdshift-dev-profiles \
  --key '{"profileId": {"S": "your-profile-id"}}' \
  --region us-west-2
```

## Common Issues

### 1. API returns 403 Forbidden

The Lambda function doesn't have permission to access DynamoDB. Check IAM roles in Terraform.

### 2. API returns 500 Internal Server Error

Check Lambda logs:
```bash
aws logs tail /aws/lambda/thirdshift-dev-profile-manager --follow
```

### 3. Changes not reflected

Lambda code is cached. Wait 10-30 seconds after deployment, or force a new version:
```bash
aws lambda update-function-configuration \
  --function-name thirdshift-dev-profile-manager \
  --description "Updated $(date)" \
  --region us-west-2
```

### 4. CORS errors in browser

The API includes CORS headers. If you still get errors, check that the API Gateway CORS is configured correctly.

## Success Criteria

✅ Can create family member profiles
✅ Can create guest profiles  
✅ Can retrieve profiles by ID
✅ Can list all profiles
✅ Can filter profiles by type
✅ Can update profiles
✅ Can delete profiles
✅ Validation errors return 400 with clear messages
✅ Non-existent profiles return 404

## Next Steps

Once Profile Manager is working:
1. Test with the automated script: `./test-api.sh`
2. Create some test profiles for your family
3. Move on to Task 3: Inventory Manager
4. Eventually, all Lambda functions will work together in the Step Functions workflow
