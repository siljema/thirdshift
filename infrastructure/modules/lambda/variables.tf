variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs18.x"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

variable "profiles_table_name" {
  description = "Profiles DynamoDB table name"
  type        = string
}

variable "inventory_table_name" {
  description = "Inventory DynamoDB table name"
  type        = string
}

variable "meal_plans_table_name" {
  description = "Meal Plans DynamoDB table name"
  type        = string
}

variable "orders_table_name" {
  description = "Orders DynamoDB table name"
  type        = string
}

variable "budgets_table_name" {
  description = "Budgets DynamoDB table name"
  type        = string
}

variable "consumption_history_table_name" {
  description = "Consumption History DynamoDB table name"
  type        = string
}

variable "consumption_patterns_table_name" {
  description = "Consumption Patterns DynamoDB table name"
  type        = string
}

variable "meal_plans_bucket_name" {
  description = "S3 bucket name for meal plans"
  type        = string
}

variable "secrets_arns" {
  description = "Map of Secrets Manager ARNs"
  type        = map(string)
}

variable "enable_bedrock" {
  description = "Enable AWS Bedrock for AI-powered features"
  type        = bool
  default     = true
}

variable "bedrock_region" {
  description = "AWS region for Bedrock (must support Claude 3)"
  type        = string
  default     = "us-east-1"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
