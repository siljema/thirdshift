# Implementation Plan: ThirdShift

## Overview
This implementation plan breaks down the development of ThirdShift into discrete, manageable coding tasks. Each task builds incrementally on previous work, with all code integrated into the system by the end.

---

- [x] 1. Set up AWS infrastructure foundation and project structure
  - Create CDK/Terraform project with TypeScript configuration
  - Define DynamoDB table schemas for all 7 tables (Profiles, Inventory, MealPlans, Orders, Budgets, ConsumptionHistory, ConsumptionPatterns)
  - Configure IAM roles and policies for Lambda functions with least privilege access
  - Set up Secrets Manager for storing API credentials (calendar, Oda, bank, recipe APIs)
  - Create S3 bucket with encryption for meal plan documents and reports
  - Deploy infrastructure to AWS dev environment
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 2. Implement Profile Manager component
- [x] 2.1 Create profile data models and DynamoDB operations
  - Write TypeScript interfaces for FamilyMemberProfile and GuestProfile
  - Implement DynamoDB repository class with CRUD operations (create, read, update, delete, list)
  - Add data validation functions for profile fields (dietary restrictions, allergies, cooking expertise)
  - _Requirements: 7.1, 7.3_

- [x] 2.2 Build Profile Manager Lambda function
  - Implement Lambda handler with routing for profile operations
  - Add input validation and error handling
  - Integrate with DynamoDB repository
  - Configure Lambda function in infrastructure code
  - _Requirements: 7.1, 7.3_

- [x] 2.3 Create API Gateway endpoints for profile management
  - Define REST API with Cognito authorizer
  - Create endpoints: POST /profiles, GET /profiles/{id}, PUT /profiles/{id}, DELETE /profiles/{id}, GET /profiles
  - Configure CORS for web UI access
  - Deploy API Gateway and test endpoints
  - _Requirements: 7.1_

- [ ]* 2.4 Write integration tests for Profile Manager
  - Test profile creation with valid and invalid data
  - Test profile retrieval, update, and deletion
  - Test list profiles with filtering
  - Verify DynamoDB operations
  - _Requirements: 7.1, 7.3_

- [x] 3. Implement Inventory Manager component
- [x] 3.1 Create inventory data models and DynamoDB operations
  - Write TypeScript interfaces for InventoryItem
  - Implement DynamoDB repository with operations for add, update, remove, query by expiration
  - Add GSI query functions for expiration date lookups
  - _Requirements: 2.1, 2.4_

- [x] 3.2 Build Inventory Manager Lambda function
  - Implement sync logic with fridge inventory device API
  - Add expiration date tracking and alerting (items within 3 days)
  - Implement inventory update logic when meals are consumed
  - Add inventory update logic when grocery orders arrive
  - Configure Lambda function in infrastructure code
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 12.2_

- [x] 3.3 Implement fridge inventory integration
  - Create adapter for fridge device API or IoT Core integration
  - Implement data synchronization logic
  - Add error handling for device connectivity issues
  - _Requirements: 2.1, 12.2_

- [ ]* 3.4 Write integration tests for Inventory Manager
  - Test inventory sync with mock fridge device
  - Test expiration date queries and alerts
  - Test inventory updates from meal consumption
  - Verify waste event logging
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Implement Calendar Analyzer component
- [x] 4.1 Create calendar integration adapters
  - Implement Google Calendar API adapter with OAuth authentication
  - Implement Microsoft Graph API adapter for Outlook Calendar
  - Create unified calendar interface for multiple providers
  - Add credential management using Secrets Manager
  - _Requirements: 1.1, 12.1_

- [x] 4.2 Build Calendar Analyzer Lambda function
  - Implement event retrieval for upcoming week
  - Add availability analysis logic to determine who is present for each meal
  - Implement special event detection (school trips, activities)
  - Add cooking assignment extraction from calendar events
  - Store availability matrix in DynamoDB
  - Configure Lambda function in infrastructure code
  - _Requirements: 1.1, 1.2, 4.1, 4.3, 8.1, 9.1_

- [ ]* 4.3 Write integration tests for Calendar Analyzer
  - Test calendar event retrieval with mock calendar API
  - Test availability matrix generation
  - Test special event detection
  - Test cooking assignment extraction
  - _Requirements: 1.1, 1.2, 8.1, 9.1_

- [x] 5. Implement Consumption Learning component
- [x] 5.1 Create consumption data models and DynamoDB operations
  - Write TypeScript interfaces for ConsumptionHistory and ConsumptionPattern
  - Implement DynamoDB repository for consumption data
  - Add GSI query functions for item-based consumption lookups
  - _Requirements: 6.1, 6.2_

- [x] 5.2 Build Consumption Learning Lambda function
  - Implement consumption data aggregation logic (weekly rollups)
  - Add exponential moving average calculation for consumption patterns
  - Implement trend detection (increasing, decreasing, stable)
  - Add anomaly detection to exclude vacation weeks
  - Calculate confidence scores based on data consistency
  - Store learned patterns in ConsumptionPatterns table
  - Configure Lambda function in infrastructure code
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 5.3 Write unit tests for consumption learning algorithms
  - Test exponential moving average calculations
  - Test trend detection logic
  - Test confidence score calculations
  - Test anomaly detection
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 6. Implement Menu Generator component
- [x] 6.1 Create recipe API integrations
  - Implement Spoonacular API adapter
  - Implement Edamam API adapter as fallback
  - Create unified recipe interface
  - Add recipe search with filters (dietary restrictions, cooking time, difficulty)
  - Store API credentials in Secrets Manager
  - _Requirements: 1.4, 7.4_

- [x] 6.2 Build recipe scoring and selection logic
  - Implement scoring algorithm for recipes based on multiple criteria
  - Add logic to prioritize expiring ingredients
  - Add logic to match cooking expertise levels
  - Add logic to respect dietary restrictions and allergies
  - Add logic to ensure recipe variety (no repeats within 2 weeks)
  - Add nutritional balance scoring
  - _Requirements: 2.2, 2.3, 7.4, 7.5, 9.2, 9.3, 9.4_

- [x] 6.3 Implement school lunch menu generation
  - Create school lunch recipe database with portable, child-friendly options
  - Implement school day detection from calendar
  - Add age-appropriate meal selection logic
  - Ensure nutritional requirements for children
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 6.4 Build Menu Generator Lambda function
  - Implement main menu generation workflow
  - Integrate availability matrix from Calendar Analyzer
  - Integrate inventory and expiring items from Inventory Manager
  - Integrate dietary profiles from Profile Manager
  - Integrate budget constraints from Budget Tracker
  - Generate 21 meals (breakfast, lunch, dinner) + 10 school lunches per week
  - Calculate total ingredient requirements
  - Store meal plan in DynamoDB and detailed version in S3
  - Configure Lambda function with higher memory and timeout
  - _Requirements: 1.3, 1.4, 1.5, 2.2, 2.3, 7.4, 7.5, 8.2, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3_

- [ ]* 6.5 Write integration tests for Menu Generator
  - Test menu generation with various constraint combinations
  - Test recipe scoring and selection
  - Test school lunch generation
  - Test dietary restriction enforcement
  - Test cooking expertise matching
  - _Requirements: 1.3, 7.4, 9.2, 10.2_

- [ ] 7. Implement Budget Tracker component
- [ ] 7.1 Create budget data models and DynamoDB operations
  - Write TypeScript interfaces for Budget and spending records
  - Implement DynamoDB repository for budget data
  - Add query functions for budget period lookups
  - _Requirements: 11.1, 11.4_

- [ ] 7.2 Build Budget Tracker Lambda function
  - Implement budget validation logic
  - Add spending tracking against budget limits
  - Implement cost estimation for shopping lists
  - Add budget alert generation (50%, 80%, 100% thresholds)
  - Generate weekly and monthly spending reports
  - Store reports in S3
  - Configure Lambda function in infrastructure code
  - _Requirements: 11.1, 11.2, 11.4, 11.5_

- [ ]* 7.3 Write unit tests for budget calculations
  - Test budget validation logic
  - Test spending tracking
  - Test alert threshold calculations
  - Test report generation
  - _Requirements: 11.1, 11.4, 11.5_

- [ ] 8. Implement Shopping Agent component
- [ ] 8.1 Create Oda API integration
  - Implement Oda API adapter with authentication
  - Add product search functionality
  - Add shopping cart management
  - Add order placement and scheduling
  - Store Oda credentials in Secrets Manager
  - _Requirements: 3.2, 3.4, 12.3_

- [ ] 8.2 Create bank payment integration
  - Implement bank API adapter or Vipps integration
  - Add payment authorization and execution logic
  - Add transaction confirmation handling
  - Store payment credentials securely in Secrets Manager
  - _Requirements: 3.3, 12.4_

- [ ] 8.3 Build shopping list optimization logic
  - Implement ingredient-to-product mapping
  - Integrate learned consumption patterns for quantity optimization
  - Add logic to adjust quantities based on number of people present
  - Implement budget-based optimization (find cheaper alternatives)
  - Add logic to prioritize essential items when over budget
  - _Requirements: 3.1, 6.2, 8.4, 11.3_

- [ ] 8.4 Build Shopping Agent Lambda function
  - Implement main shopping workflow
  - Calculate net ingredient requirements (meal plan - inventory)
  - Apply learned consumption patterns to optimize quantities
  - Build Oda shopping cart with optimized items
  - Validate against budget constraints
  - Place order with Monday morning delivery slot
  - Process payment through bank integration
  - Update inventory with expected items
  - Store order confirmation in DynamoDB
  - Configure Lambda function in infrastructure code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.5, 6.2, 8.4, 10.4, 11.3_

- [ ]* 8.5 Write integration tests for Shopping Agent
  - Test shopping list generation with mock meal plan
  - Test Oda product mapping
  - Test budget optimization logic
  - Test order placement with test Oda account
  - Test payment processing with test bank account
  - _Requirements: 3.1, 3.2, 3.3, 11.3_

- [ ] 9. Implement Step Functions workflow orchestration
- [ ] 9.1 Create Step Functions state machine definition
  - Define workflow states for all components
  - Add error handling with catch blocks
  - Configure retry logic with exponential backoff
  - Add fallback logic for API failures
  - Deploy state machine in infrastructure code
  - _Requirements: 5.2, 5.4, 5.5_

- [ ] 9.2 Build error handler Lambda function
  - Implement error logging to CloudWatch
  - Add user notification logic for critical failures
  - Implement fallback strategies for different error types
  - Configure Lambda function in infrastructure code
  - _Requirements: 5.4, 5.5, 12.5_

- [ ] 9.3 Configure EventBridge scheduler
  - Create EventBridge rule for weekly trigger (Sunday evening)
  - Configure rule to invoke Step Functions state machine
  - Add rule for consumption learning (weekly)
  - Deploy scheduler in infrastructure code
  - _Requirements: 5.1_

- [ ]* 9.4 Write integration tests for workflow orchestration
  - Test complete workflow execution end-to-end
  - Test error handling and retry logic
  - Test fallback strategies
  - Verify state transitions
  - _Requirements: 5.2, 5.4, 5.5_

- [ ] 10. Implement notification system
- [ ] 10.1 Create SNS topics and SES configuration
  - Create SNS topics for different notification types (meal plan ready, order placed, budget alerts, errors)
  - Configure SES for email delivery
  - Add email templates for different notification types
  - Deploy notification infrastructure
  - _Requirements: 5.3, 10.5_

- [ ] 10.2 Integrate notifications into workflow
  - Add SNS publish calls in Step Functions workflow
  - Implement notification Lambda for formatting messages
  - Add daily reminder for school lunch preparation
  - Add weekly meal plan summary email
  - Add budget alert emails
  - _Requirements: 5.3, 10.5, 11.4_

- [ ]* 10.3 Write tests for notification delivery
  - Test SNS topic publishing
  - Test email template rendering
  - Test notification triggers
  - _Requirements: 5.3, 10.5_

- [ ] 11. Implement monitoring and logging
- [ ] 11.1 Configure CloudWatch dashboards
  - Create dashboard for system health metrics
  - Add Lambda execution metrics (duration, errors, throttles)
  - Add DynamoDB metrics (read/write capacity, throttles)
  - Add Step Functions execution metrics
  - Add custom metrics for business logic (meal plans generated, orders placed)
  - _Requirements: 5.4_

- [ ] 11.2 Set up CloudWatch alarms
  - Create alarms for Lambda error rates
  - Create alarms for Step Functions failures
  - Create alarms for DynamoDB throttling
  - Create alarms for API Gateway errors
  - Configure SNS notifications for alarms
  - _Requirements: 5.4, 5.5, 12.5_

- [ ] 11.3 Implement structured logging
  - Add structured logging to all Lambda functions
  - Include correlation IDs for request tracing
  - Add X-Ray tracing for distributed tracing
  - Configure log retention policies
  - _Requirements: 5.4_

- [ ] 12. Build Profile Management UI
- [ ] 12.1 Create web UI project structure
  - Set up React or Vue.js project with TypeScript
  - Configure build pipeline
  - Set up S3 bucket and CloudFront for hosting
  - Configure Cognito authentication
  - _Requirements: 7.1, 7.2_

- [ ] 12.2 Implement profile management pages
  - Create family member profile form with all fields
  - Create guest profile form
  - Implement profile list view
  - Add profile edit and delete functionality
  - Integrate with API Gateway endpoints
  - Add form validation
  - _Requirements: 7.1, 7.2_

- [ ] 12.3 Implement budget configuration UI
  - Create budget settings page
  - Add weekly/monthly budget input
  - Display current spending and remaining budget
  - Show spending history charts
  - _Requirements: 11.1, 11.4_

- [ ] 12.4 Implement meal plan viewer
  - Create weekly meal plan display
  - Show recipes with links
  - Display school lunch menus
  - Add daily view with preparation instructions
  - Show who is cooking and who is present
  - _Requirements: 1.5, 10.5_

- [ ]* 12.5 Write UI component tests
  - Test profile form validation
  - Test profile CRUD operations
  - Test budget configuration
  - Test meal plan display
  - _Requirements: 7.1, 11.1_

- [ ] 13. Deploy and configure production environment
- [ ] 13.1 Set up production AWS environment
  - Deploy infrastructure to production account
  - Configure production Secrets Manager with real API credentials
  - Set up production DynamoDB tables with backup enabled
  - Configure production S3 buckets with versioning
  - Set up CloudWatch log groups with appropriate retention
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 13.2 Configure external service integrations
  - Set up production calendar API credentials (Google, Microsoft)
  - Configure production Oda account and API access
  - Set up production bank/payment integration
  - Configure production recipe API keys
  - Test all integrations in production
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 13.3 Deploy web UI to production
  - Build production web UI bundle
  - Deploy to S3 and CloudFront
  - Configure custom domain (optional)
  - Set up SSL certificate
  - Test UI in production
  - _Requirements: 7.1, 7.2_

- [ ] 13.4 Perform end-to-end production validation
  - Create test family profiles
  - Add test inventory items
  - Trigger manual workflow execution
  - Verify meal plan generation
  - Verify shopping list creation (do not place real order)
  - Verify notifications
  - Verify budget tracking
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 3.1, 5.1, 5.2, 5.3_
