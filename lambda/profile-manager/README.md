# Profile Manager Lambda Function

This Lambda function handles CRUD operations for family member and guest profiles.

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

## Package for Deployment

```bash
npm run package
```

This creates `profile-manager.zip` ready for Lambda deployment.

## Deploy to AWS

```bash
npm run deploy
```

Or manually:

```bash
aws lambda update-function-code \
  --function-name thirdshift-dev-profile-manager \
  --zip-file fileb://profile-manager.zip \
  --region us-west-2
```

## API Endpoints

### Create Profile

**POST** `/profiles`

```json
{
  "type": "family_member",
  "name": "John Doe",
  "age": 35,
  "role": "adult",
  "dietaryRestrictions": ["gluten-free"],
  "allergies": ["peanuts"],
  "dislikes": ["mushrooms"],
  "preferences": ["italian", "mexican"],
  "cookingExpertiseLevel": "intermediate",
  "calendarId": "john@example.com"
}
```

Or for a guest:

```json
{
  "type": "guest",
  "name": "Jane Smith",
  "dietaryRestrictions": ["vegetarian"],
  "allergies": [],
  "dislikes": ["olives"],
  "preferences": ["asian"],
  "visitDates": ["2025-12-01", "2025-12-02"]
}
```

### Get Profile

**GET** `/profiles/{id}`

### List Profiles

**GET** `/profiles`

Optional query parameter: `?type=family_member` or `?type=guest`

### Update Profile

**PUT** `/profiles/{id}`

```json
{
  "name": "John Updated",
  "age": 36,
  "cookingExpertiseLevel": "advanced"
}
```

### Delete Profile

**DELETE** `/profiles/{id}`

## Environment Variables

- `PROFILES_TABLE` - DynamoDB table name (default: `thirdshift-dev-profiles`)
- `ENVIRONMENT` - Environment name (dev, staging, prod)
