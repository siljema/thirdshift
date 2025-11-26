# IAM Role for Step Functions
resource "aws_iam_role" "step_functions" {
  name = "${var.name_prefix}-step-functions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "states.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "step_functions_invoke_lambda" {
  name = "${var.name_prefix}-step-functions-invoke-lambda"
  role = aws_iam_role.step_functions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "lambda:InvokeFunction"
      ]
      Resource = [
        var.calendar_analyzer_arn,
        var.inventory_manager_arn,
        var.consumption_learning_arn,
        var.menu_generator_arn,
        var.budget_tracker_arn,
        var.shopping_agent_arn
      ]
    }]
  })
}

# CloudWatch Logs permissions for Step Functions
resource "aws_iam_role_policy" "step_functions_logging" {
  name = "${var.name_prefix}-step-functions-logging"
  role = aws_iam_role.step_functions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogDelivery",
          "logs:GetLogDelivery",
          "logs:UpdateLogDelivery",
          "logs:DeleteLogDelivery",
          "logs:ListLogDeliveries",
          "logs:PutResourcePolicy",
          "logs:DescribeResourcePolicies",
          "logs:DescribeLogGroups"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.step_functions.arn}:*"
      }
    ]
  })
}

# Step Functions State Machine
resource "aws_sfn_state_machine" "weekly_planning" {
  name     = "${var.name_prefix}-weekly-planning"
  role_arn = aws_iam_role.step_functions.arn

  definition = jsonencode({
    Comment = "ThirdShift Weekly Planning Cycle"
    StartAt = "AnalyzeCalendar"
    States = {
      AnalyzeCalendar = {
        Type     = "Task"
        Resource = var.calendar_analyzer_arn
        Next     = "CheckInventory"
        Retry = [{
          ErrorEquals     = ["States.ALL"]
          IntervalSeconds = 2
          MaxAttempts     = 3
          BackoffRate     = 2.0
        }]
        Catch = [{
          ErrorEquals = ["States.ALL"]
          Next        = "HandleError"
          ResultPath  = "$.error"
        }]
      }

      CheckInventory = {
        Type     = "Task"
        Resource = var.inventory_manager_arn
        Next     = "LearnPatterns"
        Retry = [{
          ErrorEquals     = ["States.ALL"]
          IntervalSeconds = 2
          MaxAttempts     = 3
          BackoffRate     = 2.0
        }]
        Catch = [{
          ErrorEquals = ["States.ALL"]
          Next        = "HandleError"
          ResultPath  = "$.error"
        }]
      }

      LearnPatterns = {
        Type     = "Task"
        Resource = var.consumption_learning_arn
        Next     = "GenerateMenu"
        Retry = [{
          ErrorEquals     = ["States.ALL"]
          IntervalSeconds = 2
          MaxAttempts     = 3
          BackoffRate     = 2.0
        }]
        Catch = [{
          ErrorEquals = ["States.ALL"]
          Next        = "HandleError"
          ResultPath  = "$.error"
        }]
      }

      GenerateMenu = {
        Type     = "Task"
        Resource = var.menu_generator_arn
        Next     = "ReviewBudget"
        Retry = [{
          ErrorEquals     = ["States.ALL"]
          IntervalSeconds = 2
          MaxAttempts     = 3
          BackoffRate     = 2.0
        }]
        Catch = [{
          ErrorEquals = ["States.ALL"]
          Next        = "HandleError"
          ResultPath  = "$.error"
        }]
      }

      ReviewBudget = {
        Type     = "Task"
        Resource = var.budget_tracker_arn
        Next     = "PlaceOrder"
        Retry = [{
          ErrorEquals     = ["States.ALL"]
          IntervalSeconds = 2
          MaxAttempts     = 3
          BackoffRate     = 2.0
        }]
        Catch = [{
          ErrorEquals = ["States.ALL"]
          Next        = "HandleError"
          ResultPath  = "$.error"
        }]
      }

      PlaceOrder = {
        Type     = "Task"
        Resource = var.shopping_agent_arn
        Next     = "Success"
        Retry = [{
          ErrorEquals     = ["States.ALL"]
          IntervalSeconds = 2
          MaxAttempts     = 3
          BackoffRate     = 2.0
        }]
        Catch = [{
          ErrorEquals = ["States.ALL"]
          Next        = "HandleError"
          ResultPath  = "$.error"
        }]
      }

      Success = {
        Type = "Succeed"
      }

      HandleError = {
        Type = "Fail"
        Error = "WorkflowFailed"
        Cause = "One or more steps in the workflow failed"
      }
    }
  })

  logging_configuration {
    log_destination        = "${aws_cloudwatch_log_group.step_functions.arn}:*"
    include_execution_data = true
    level                  = "ALL"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-weekly-planning"
  })
}

resource "aws_cloudwatch_log_group" "step_functions" {
  name              = "/aws/states/${var.name_prefix}-weekly-planning"
  retention_in_days = 7
  tags              = var.tags
}
