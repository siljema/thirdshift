output "profile_manager_arn" {
  description = "Profile Manager Lambda ARN"
  value       = aws_lambda_function.profile_manager.arn
}

output "profile_manager_name" {
  description = "Profile Manager Lambda name"
  value       = aws_lambda_function.profile_manager.function_name
}

output "inventory_manager_arn" {
  description = "Inventory Manager Lambda ARN"
  value       = aws_lambda_function.inventory_manager.arn
}

output "calendar_analyzer_arn" {
  description = "Calendar Analyzer Lambda ARN"
  value       = aws_lambda_function.calendar_analyzer.arn
}

output "menu_generator_arn" {
  description = "Menu Generator Lambda ARN"
  value       = aws_lambda_function.menu_generator.arn
}

output "shopping_agent_arn" {
  description = "Shopping Agent Lambda ARN"
  value       = aws_lambda_function.shopping_agent.arn
}

output "consumption_learning_arn" {
  description = "Consumption Learning Lambda ARN"
  value       = aws_lambda_function.consumption_learning.arn
}

output "budget_tracker_arn" {
  description = "Budget Tracker Lambda ARN"
  value       = aws_lambda_function.budget_tracker.arn
}

output "function_names" {
  description = "List of all Lambda function names"
  value = [
    aws_lambda_function.profile_manager.function_name,
    aws_lambda_function.inventory_manager.function_name,
    aws_lambda_function.calendar_analyzer.function_name,
    aws_lambda_function.menu_generator.function_name,
    aws_lambda_function.shopping_agent.function_name,
    aws_lambda_function.consumption_learning.function_name,
    aws_lambda_function.budget_tracker.function_name,
  ]
}

output "execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution.arn
}
