variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "reports_retention_days" {
  description = "Number of days to retain reports"
  type        = number
  default     = 365
}

variable "meal_plans_retention_days" {
  description = "Number of days to retain meal plans"
  type        = number
  default     = 730
}

variable "allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
