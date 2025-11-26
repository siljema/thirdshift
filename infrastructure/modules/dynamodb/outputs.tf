output "profiles_table_name" {
  description = "Profiles table name"
  value       = aws_dynamodb_table.profiles.name
}

output "profiles_table_arn" {
  description = "Profiles table ARN"
  value       = aws_dynamodb_table.profiles.arn
}

output "inventory_table_name" {
  description = "Inventory table name"
  value       = aws_dynamodb_table.inventory.name
}

output "inventory_table_arn" {
  description = "Inventory table ARN"
  value       = aws_dynamodb_table.inventory.arn
}

output "meal_plans_table_name" {
  description = "Meal Plans table name"
  value       = aws_dynamodb_table.meal_plans.name
}

output "meal_plans_table_arn" {
  description = "Meal Plans table ARN"
  value       = aws_dynamodb_table.meal_plans.arn
}

output "orders_table_name" {
  description = "Orders table name"
  value       = aws_dynamodb_table.orders.name
}

output "orders_table_arn" {
  description = "Orders table ARN"
  value       = aws_dynamodb_table.orders.arn
}

output "budgets_table_name" {
  description = "Budgets table name"
  value       = aws_dynamodb_table.budgets.name
}

output "budgets_table_arn" {
  description = "Budgets table ARN"
  value       = aws_dynamodb_table.budgets.arn
}

output "consumption_history_table_name" {
  description = "Consumption History table name"
  value       = aws_dynamodb_table.consumption_history.name
}

output "consumption_history_table_arn" {
  description = "Consumption History table ARN"
  value       = aws_dynamodb_table.consumption_history.arn
}

output "consumption_patterns_table_name" {
  description = "Consumption Patterns table name"
  value       = aws_dynamodb_table.consumption_patterns.name
}

output "consumption_patterns_table_arn" {
  description = "Consumption Patterns table ARN"
  value       = aws_dynamodb_table.consumption_patterns.arn
}

output "table_names" {
  description = "List of all table names"
  value = [
    aws_dynamodb_table.profiles.name,
    aws_dynamodb_table.inventory.name,
    aws_dynamodb_table.meal_plans.name,
    aws_dynamodb_table.orders.name,
    aws_dynamodb_table.budgets.name,
    aws_dynamodb_table.consumption_history.name,
    aws_dynamodb_table.consumption_patterns.name,
  ]
}

output "table_arns" {
  description = "List of all table ARNs"
  value = [
    aws_dynamodb_table.profiles.arn,
    aws_dynamodb_table.inventory.arn,
    aws_dynamodb_table.meal_plans.arn,
    aws_dynamodb_table.orders.arn,
    aws_dynamodb_table.budgets.arn,
    aws_dynamodb_table.consumption_history.arn,
    aws_dynamodb_table.consumption_patterns.arn,
  ]
}
