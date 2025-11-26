#!/bin/bash

# Get API Gateway URL from Terraform outputs
API_URL=$(cd ../../infrastructure/environments/dev && terraform output -raw api_gateway_url 2>/dev/null)

if [ -z "$API_URL" ]; then
  echo "Error: Could not get API URL from Terraform outputs"
  echo "Make sure you've deployed the infrastructure first"
  exit 1
fi

echo "Testing Profile Manager API at: $API_URL"
echo ""

# Test 1: Create a family member profile
echo "=== Test 1: Create Family Member Profile ==="
PROFILE1=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "family_member",
    "name": "John Doe",
    "age": 35,
    "role": "adult",
    "dietaryRestrictions": ["gluten-free"],
    "allergies": ["peanuts"],
    "dislikes": ["mushrooms"],
    "preferences": ["italian", "mexican"],
    "cookingExpertiseLevel": "intermediate"
  }')

echo "$PROFILE1" | jq '.'
PROFILE1_ID=$(echo "$PROFILE1" | jq -r '.profileId')
echo "Created profile ID: $PROFILE1_ID"
echo ""

# Test 2: Create a guest profile
echo "=== Test 2: Create Guest Profile ==="
PROFILE2=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "guest",
    "name": "Jane Smith",
    "dietaryRestrictions": ["vegetarian"],
    "allergies": [],
    "dislikes": ["olives"],
    "preferences": ["asian"],
    "visitDates": ["2025-12-01", "2025-12-02"]
  }')

echo "$PROFILE2" | jq '.'
PROFILE2_ID=$(echo "$PROFILE2" | jq -r '.profileId')
echo "Created profile ID: $PROFILE2_ID"
echo ""

# Test 3: Get a profile
echo "=== Test 3: Get Profile ==="
curl -s -X GET "$API_URL/$PROFILE1_ID" | jq '.'
echo ""

# Test 4: List all profiles
echo "=== Test 4: List All Profiles ==="
curl -s -X GET "$API_URL" | jq '.'
echo ""

# Test 5: List only family members
echo "=== Test 5: List Family Members Only ==="
curl -s -X GET "$API_URL?type=family_member" | jq '.'
echo ""

# Test 6: Update a profile
echo "=== Test 6: Update Profile ==="
curl -s -X PUT "$API_URL/$PROFILE1_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "age": 36,
    "cookingExpertiseLevel": "advanced"
  }' | jq '.'
echo ""

# Test 7: Delete a profile
echo "=== Test 7: Delete Profile ==="
curl -s -X DELETE "$API_URL/$PROFILE2_ID" -w "\nHTTP Status: %{http_code}\n"
echo ""

# Test 8: Verify deletion
echo "=== Test 8: Verify Deletion (should return 404) ==="
curl -s -X GET "$API_URL/$PROFILE2_ID" -w "\nHTTP Status: %{http_code}\n" | jq '.'
echo ""

# Test 9: Test validation (should fail)
echo "=== Test 9: Test Validation (should fail) ==="
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "family_member",
    "name": "",
    "age": 200,
    "role": "invalid"
  }' | jq '.'
echo ""

echo "=== All tests complete ==="
