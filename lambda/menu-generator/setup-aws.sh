#!/bin/bash

# Quick setup script for Menu Generator Lambda
# This script helps you deploy the Lambda to AWS

set -e

echo "========================================="
echo "ThirdShift Menu Generator - AWS Setup"
echo "========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it:"
    echo "   brew install awscli  # macOS"
    echo "   https://aws.amazon.com/cli/"
    exit 1
fi
echo "✓ AWS CLI installed"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run:"
    echo "   aws configure"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-west-2")
echo "✓ AWS credentials configured"
echo "  Account: $AWS_ACCOUNT"
echo "  Region: $AWS_REGION"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js installed: $NODE_VERSION"
echo ""

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo "⚠️  Terraform not found. You'll need it to create infrastructure."
    echo "   Install: brew install terraform"
    echo ""
    read -p "Continue without Terraform? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ Terraform installed"
    echo ""
fi

# Ask about environment
echo "========================================="
echo "Configuration"
echo "========================================="
echo ""

read -p "Environment name (default: dev): " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-dev}

read -p "AWS Region (default: $AWS_REGION): " REGION
REGION=${REGION:-$AWS_REGION}

read -p "Enable AWS Bedrock AI? (y/n, default: n): " -n 1 -r ENABLE_BEDROCK
echo ""
if [[ $ENABLE_BEDROCK =~ ^[Yy]$ ]]; then
    USE_BEDROCK="true"
    echo "⚠️  Note: You need Bedrock access in us-east-1"
    echo "   Go to AWS Console → Bedrock → Model access"
    echo "   Request access to Claude 3 Sonnet"
    echo ""
else
    USE_BEDROCK="false"
fi

FUNCTION_NAME="thirdshift-${ENVIRONMENT}-menu-generator"

echo ""
echo "Configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Region: $REGION"
echo "  Function: $FUNCTION_NAME"
echo "  Bedrock AI: $USE_BEDROCK"
echo ""

read -p "Proceed with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "========================================="
echo "Step 1: Check Infrastructure"
echo "========================================="
echo ""

# Check if Lambda exists
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
    echo "✓ Lambda function exists: $FUNCTION_NAME"
else
    echo "❌ Lambda function not found: $FUNCTION_NAME"
    echo ""
    echo "You need to create infrastructure first using Terraform:"
    echo ""
    echo "  cd ../../infrastructure"
    echo "  terraform init"
    echo "  terraform apply"
    echo ""
    echo "Or create the Lambda manually in AWS Console."
    exit 1
fi

# Check DynamoDB tables
echo ""
echo "Checking DynamoDB tables..."
TABLES=(
    "thirdshift-${ENVIRONMENT}-profiles"
    "thirdshift-${ENVIRONMENT}-inventory"
    "thirdshift-${ENVIRONMENT}-meal-plans"
)

for TABLE in "${TABLES[@]}"; do
    if aws dynamodb describe-table --table-name "$TABLE" --region "$REGION" &> /dev/null 2>&1; then
        echo "✓ Table exists: $TABLE"
    else
        echo "⚠️  Table not found: $TABLE (will be created by Terraform)"
    fi
done

echo ""
echo "========================================="
echo "Step 2: Build and Deploy Lambda"
echo "========================================="
echo ""

# Build
echo "Building Lambda..."
npm install --silent
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✓ Build successful"
echo ""

# Package
echo "Packaging Lambda..."
rm -f menu-generator.zip
cd dist
zip -r ../menu-generator.zip . -q
cd ..
zip -r menu-generator.zip node_modules -q -x "node_modules/@types/*" "node_modules/typescript/*"

PACKAGE_SIZE=$(du -h menu-generator.zip | cut -f1)
echo "✓ Package created: $PACKAGE_SIZE"
echo ""

# Deploy
echo "Deploying to AWS..."
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://menu-generator.zip \
    --region "$REGION" \
    --output json > /dev/null

echo "✓ Code deployed"
echo ""

# Update configuration
echo "Updating configuration..."
aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment "Variables={
        MEAL_PLANS_TABLE=thirdshift-${ENVIRONMENT}-meal-plans,
        PROFILES_TABLE=thirdshift-${ENVIRONMENT}-profiles,
        INVENTORY_TABLE=thirdshift-${ENVIRONMENT}-inventory,
        MEAL_PLANS_BUCKET=thirdshift-${ENVIRONMENT}-meal-plans,
        BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0,
        BEDROCK_REGION=us-east-1,
        USE_BEDROCK=${USE_BEDROCK},
        ENVIRONMENT=${ENVIRONMENT}
    }" \
    --region "$REGION" \
    --output json > /dev/null

echo "✓ Configuration updated"
echo ""

echo "========================================="
echo "Step 3: Test Lambda"
echo "========================================="
echo ""

echo "Testing Lambda function..."
aws lambda invoke \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --payload file://test-events/generate-menu.json \
    response.json \
    --log-type Tail \
    --query 'LogResult' \
    --output text | base64 -d

echo ""
echo "Response saved to response.json"
echo ""

if grep -q '"statusCode":200' response.json; then
    echo "✅ Test successful!"
    
    # Parse response
    MEALS=$(cat response.json | grep -o '"meals":\[' | wc -l)
    if [ $MEALS -gt 0 ]; then
        echo "✓ Meal plan generated"
    fi
else
    echo "⚠️  Test returned an error. Check response.json"
fi

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Function ARN:"
aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" --query 'Configuration.FunctionArn' --output text
echo ""
echo "Next steps:"
echo ""
echo "1. View logs:"
echo "   aws logs tail /aws/lambda/$FUNCTION_NAME --region $REGION --follow"
echo ""
echo "2. Test again:"
echo "   aws lambda invoke --function-name $FUNCTION_NAME --region $REGION --payload file://test-events/generate-menu.json response.json"
echo ""
echo "3. View response:"
echo "   cat response.json | jq ."
echo ""

if [ "$USE_BEDROCK" = "false" ]; then
    echo "4. Enable Bedrock AI:"
    echo "   - Request access in AWS Console → Bedrock → Model access"
    echo "   - Rerun this script and enable Bedrock"
    echo ""
fi

echo "For more details, see DEPLOYMENT.md"
echo ""
