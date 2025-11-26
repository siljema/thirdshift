locals {
  name_prefix = "${var.project_name}-${var.environment}"
  
  common_tags = {
    Project     = "ThirdShift"
    Environment = var.environment
  }
}

# DynamoDB Tables
module "dynamodb" {
  source = "./modules/dynamodb"

  name_prefix                = local.name_prefix
  environment                = var.environment
  enable_deletion_protection = var.enable_deletion_protection
  tags                       = local.common_tags
}

# S3 Bucket for meal plans and reports
module "s3" {
  source = "./modules/s3"

  name_prefix = local.name_prefix
  environment = var.environment
  tags        = local.common_tags
}

# Secrets Manager for API credentials
module "secrets" {
  source = "./modules/secrets"

  name_prefix = local.name_prefix
  environment = var.environment
  tags        = local.common_tags
}

# Lambda Functions
module "lambda" {
  source = "./modules/lambda"

  name_prefix         = local.name_prefix
  environment         = var.environment
  runtime             = var.lambda_runtime
  log_retention_days  = var.log_retention_days
  
  # DynamoDB table names
  profiles_table_name             = module.dynamodb.profiles_table_name
  inventory_table_name            = module.dynamodb.inventory_table_name
  meal_plans_table_name           = module.dynamodb.meal_plans_table_name
  orders_table_name               = module.dynamodb.orders_table_name
  budgets_table_name              = module.dynamodb.budgets_table_name
  consumption_history_table_name  = module.dynamodb.consumption_history_table_name
  consumption_patterns_table_name = module.dynamodb.consumption_patterns_table_name
  
  # S3 bucket
  meal_plans_bucket_name = module.s3.bucket_name
  
  # Secrets Manager ARNs
  secrets_arns = module.secrets.secret_arns
  
  # Bedrock configuration
  enable_bedrock = var.enable_bedrock
  bedrock_region = var.bedrock_region
  
  tags = local.common_tags
}

# API Gateway
module "api_gateway" {
  source = "./modules/api-gateway"

  name_prefix              = local.name_prefix
  environment              = var.environment
  profile_manager_arn      = module.lambda.profile_manager_arn
  profile_manager_name     = module.lambda.profile_manager_name
  log_retention_days       = var.log_retention_days
  
  tags = local.common_tags
}

# Step Functions
module "step_functions" {
  source = "./modules/step-functions"

  name_prefix                    = local.name_prefix
  environment                    = var.environment
  calendar_analyzer_arn          = module.lambda.calendar_analyzer_arn
  inventory_manager_arn          = module.lambda.inventory_manager_arn
  consumption_learning_arn       = module.lambda.consumption_learning_arn
  menu_generator_arn             = module.lambda.menu_generator_arn
  budget_tracker_arn             = module.lambda.budget_tracker_arn
  shopping_agent_arn             = module.lambda.shopping_agent_arn
  
  tags = local.common_tags
}

# EventBridge Scheduler
module "eventbridge" {
  source = "./modules/eventbridge"

  name_prefix           = local.name_prefix
  environment           = var.environment
  state_machine_arn     = module.step_functions.state_machine_arn
  state_machine_role_arn = module.step_functions.execution_role_arn
  
  tags = local.common_tags
}

# Monitoring and Alarms
module "monitoring" {
  source = "./modules/monitoring"

  name_prefix           = local.name_prefix
  environment           = var.environment
  lambda_function_names = module.lambda.function_names
  state_machine_arn     = module.step_functions.state_machine_arn
  dynamodb_table_names  = module.dynamodb.table_names
  
  tags = local.common_tags
}
