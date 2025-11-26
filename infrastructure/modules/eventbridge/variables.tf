variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "state_machine_arn" {
  description = "Step Functions state machine ARN"
  type        = string
}

variable "state_machine_role_arn" {
  description = "Step Functions execution role ARN"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
