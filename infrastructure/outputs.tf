output "dynamodb_tables" {
  description = "DynamoDB table names and ARNs"
  value = {
    profiles              = module.dynamodb.profiles_table_name
    inventory             = module.dynamodb.inventory_table_name
    meal_plans            = module.dynamodb.meal_plans_table_name
    orders                = module.dynamodb.orders_table_name
    budgets               = module.dynamodb.budgets_table_name
    consumption_history   = module.dynamodb.consumption_history_table_name
    consumption_patterns  = module.dynamodb.consumption_patterns_table_name
  }
}

output "lambda_functions" {
  description = "Lambda function ARNs"
  value = {
    profile_manager       = module.lambda.profile_manager_arn
    inventory_manager     = module.lambda.inventory_manager_arn
    calendar_analyzer     = module.lambda.calendar_analyzer_arn
    menu_generator        = module.lambda.menu_generator_arn
    shopping_agent        = module.lambda.shopping_agent_arn
    consumption_learning  = module.lambda.consumption_learning_arn
    budget_tracker        = module.lambda.budget_tracker_arn
  }
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.api_url
}

output "s3_bucket_name" {
  description = "S3 bucket for meal plans and reports"
  value       = module.s3.bucket_name
}

output "step_functions_arn" {
  description = "Step Functions state machine ARN"
  value       = module.step_functions.state_machine_arn
}
