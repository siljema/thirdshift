output "weekly_planning_rule_arn" {
  description = "Weekly planning EventBridge rule ARN"
  value       = aws_cloudwatch_event_rule.weekly_planning.arn
}

output "manual_trigger_rule_arn" {
  description = "Manual trigger EventBridge rule ARN"
  value       = aws_cloudwatch_event_rule.manual_trigger.arn
}

output "eventbridge_role_arn" {
  description = "EventBridge IAM role ARN"
  value       = aws_iam_role.eventbridge.arn
}
