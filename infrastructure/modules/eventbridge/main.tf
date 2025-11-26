# IAM Role for EventBridge to invoke Step Functions
resource "aws_iam_role" "eventbridge" {
  name = "${var.name_prefix}-eventbridge"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "events.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "eventbridge_invoke_sfn" {
  name = "${var.name_prefix}-eventbridge-invoke-sfn"
  role = aws_iam_role.eventbridge.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "states:StartExecution"
      ]
      Resource = var.state_machine_arn
    }]
  })
}

# Weekly Planning Cycle Rule (Sunday evening at 20:00)
resource "aws_cloudwatch_event_rule" "weekly_planning" {
  name                = "${var.name_prefix}-weekly-planning"
  description         = "Trigger weekly meal planning cycle"
  schedule_expression = "cron(0 20 ? * SUN *)"
  
  tags = merge(var.tags, {
    Name = "${var.name_prefix}-weekly-planning"
  })
}

resource "aws_cloudwatch_event_target" "weekly_planning" {
  rule      = aws_cloudwatch_event_rule.weekly_planning.name
  target_id = "StepFunctionsTarget"
  arn       = var.state_machine_arn
  role_arn  = aws_iam_role.eventbridge.arn

  input = jsonencode({
    trigger = "weekly_planning"
    timestamp = "$${aws.events.event.time}"
  })
}

# Optional: Manual trigger rule for testing
resource "aws_cloudwatch_event_rule" "manual_trigger" {
  name                = "${var.name_prefix}-manual-trigger"
  description         = "Manual trigger for testing"
  event_pattern = jsonencode({
    source      = ["thirdshift.manual"]
    detail-type = ["Manual Trigger"]
  })
  
  tags = merge(var.tags, {
    Name = "${var.name_prefix}-manual-trigger"
  })
}

resource "aws_cloudwatch_event_target" "manual_trigger" {
  rule      = aws_cloudwatch_event_rule.manual_trigger.name
  target_id = "StepFunctionsTarget"
  arn       = var.state_machine_arn
  role_arn  = aws_iam_role.eventbridge.arn
}
