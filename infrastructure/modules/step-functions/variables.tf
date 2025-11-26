variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "calendar_analyzer_arn" {
  description = "Calendar Analyzer Lambda ARN"
  type        = string
}

variable "inventory_manager_arn" {
  description = "Inventory Manager Lambda ARN"
  type        = string
}

variable "consumption_learning_arn" {
  description = "Consumption Learning Lambda ARN"
  type        = string
}

variable "menu_generator_arn" {
  description = "Menu Generator Lambda ARN"
  type        = string
}

variable "budget_tracker_arn" {
  description = "Budget Tracker Lambda ARN"
  type        = string
}

variable "shopping_agent_arn" {
  description = "Shopping Agent Lambda ARN"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
