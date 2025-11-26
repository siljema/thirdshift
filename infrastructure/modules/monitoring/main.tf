# SNS Topic for Alarms
resource "aws_sns_topic" "alarms" {
  name = "${var.name_prefix}-alarms"
  tags = var.tags
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "thirdshift" {
  dashboard_name = "${var.name_prefix}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            for fn in var.lambda_function_names : [
              "AWS/Lambda",
              "Invocations",
              { stat = "Sum", label = fn }
            ]
          ]
          period = 300
          stat   = "Sum"
          region = data.aws_region.current.name
          title  = "Lambda Invocations"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            for fn in var.lambda_function_names : [
              "AWS/Lambda",
              "Errors",
              { stat = "Sum", label = fn }
            ]
          ]
          period = 300
          stat   = "Sum"
          region = data.aws_region.current.name
          title  = "Lambda Errors"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/States", "ExecutionsFailed", { stat = "Sum" }],
            [".", "ExecutionsSucceeded", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Sum"
          region = data.aws_region.current.name
          title  = "Step Functions Executions"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            for table in var.dynamodb_table_names : [
              "AWS/DynamoDB",
              "UserErrors",
              { stat = "Sum", label = table }
            ]
          ]
          period = 300
          stat   = "Sum"
          region = data.aws_region.current.name
          title  = "DynamoDB Errors"
        }
      }
    ]
  })
}

# Lambda Error Rate Alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = toset(var.lambda_function_names)

  alarm_name          = "${var.name_prefix}-${each.key}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Lambda function ${each.key} error rate is too high"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    FunctionName = each.key
  }

  tags = var.tags
}

# Step Functions Failure Alarm
resource "aws_cloudwatch_metric_alarm" "step_functions_failures" {
  alarm_name          = "${var.name_prefix}-step-functions-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ExecutionsFailed"
  namespace           = "AWS/States"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Step Functions execution failed"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    StateMachineArn = var.state_machine_arn
  }

  tags = var.tags
}

# DynamoDB Throttling Alarms
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  for_each = toset(var.dynamodb_table_names)

  alarm_name          = "${var.name_prefix}-${each.key}-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "DynamoDB table ${each.key} is being throttled"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    TableName = each.key
  }

  tags = var.tags
}

data "aws_region" "current" {}
