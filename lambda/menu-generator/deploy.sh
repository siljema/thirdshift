#!/bin/bash

# Deploy Menu Generator Lambda to AWS
# Usage: ./deploy.sh [environment] [region]

set -e

ENVIRONMENT=${1:-dev}
REGION=${2:-us-west-2}
FUNCTION_NAME="thirdshift-${ENVIRONMENT}-menu-generator"

echo "========================================="
echo "Deploying Menu Generator Lambda"
echo "========================================="
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "Function: $FUNCTION_NAME"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✓ AWS CLI configured"
echo ""

# Build the Lambda
echo "📦 Building Lambda..."
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✓ Build successful"
echo ""

# Package the Lambda
echo "📦 Packaging Lambda..."
rm -f menu-generator.zip

# Create deployment package
cd dist
zip -r ../menu-generator.zip . -q
cd ..

# Add node_modules (only production dependencies)
zip -r menu-generator.zip node_modules -q -x "node_modules/@types/*" "node_modules/typescript/*"

PACKAGE_SIZE=$(du -h menu-generator.zip | cut -f1)
echo "✓ Package created: menu-generator.zip ($PACKAGE_SIZE)"
echo ""

# Check if Lambda function exists
echo "🔍 Checking if Lambda function exists..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
    echo "✓ Function exists, updating code..."
    
    # Update function code
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://menu-generator.zip \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "✓ Function code updated"
    
    # Update environment variables
    echo "🔧 Updating environment variables..."
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --environment "Variables={
            MEAL_PLANS_TABLE=thirdshift-${ENVIRONMENT}-meal-plans,
            PROFILES_TABLE=thirdshift-${ENVIRONMENT}-profiles,
            INVENTORY_TABLE=thirdshift-${ENVIRONMENT}-inventory,
            MEAL_PLANS_BUCKET=thirdshift-${ENVIRONMENT}-meal-plans,
            BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0,
            BEDROCK_REGION=us-east-1,
            USE_BEDROCK=false,
            ENVIRONMENT=${ENVIRONMENT}
        }" \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "✓ Environment variables updated"
else
    echo "❌ Function does not exist. Please create it using Terraform first:"
    echo ""
    echo "  cd infrastructure"
    echo "  terraform init"
    echo "  terraform apply"
    echo ""
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "Function ARN:"
aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" --query 'Configuration.FunctionArn' --output text
echo ""
echo "To test the function:"
echo "  aws lambda invoke --function-name $FUNCTION_NAME --region $REGION --payload file://test-events/generate-menu.json response.json"
echo ""
echo "To view logs:"
echo "  aws logs tail /aws/lambda/$FUNCTION_NAME --region $REGION --follow"
echo ""
echo "To enable Bedrock AI:"
echo "  1. Ensure you have Bedrock access in us-east-1"
echo "  2. Update USE_BEDROCK=true in environment variables"
echo "  3. Redeploy: ./deploy.sh $ENVIRONMENT $REGION"
echo ""
