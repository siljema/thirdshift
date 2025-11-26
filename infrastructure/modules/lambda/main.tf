# IAM Role for Lambda Functions
resource "aws_iam_role" "lambda_execution" {
  name = "${var.name_prefix}-lambda-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

# Basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB access policy
resource "aws_iam_role_policy" "dynamodb_access" {
  name = "${var.name_prefix}-lambda-dynamodb"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ]
      Resource = [
        "arn:aws:dynamodb:*:*:table/${var.profiles_table_name}",
        "arn:aws:dynamodb:*:*:table/${var.profiles_table_name}/index/*",
        "arn:aws:dynamodb:*:*:table/${var.inventory_table_name}",
        "arn:aws:dynamodb:*:*:table/${var.inventory_table_name}/index/*",
        "arn:aws:dynamodb:*:*:table/${var.meal_plans_table_name}",
        "arn:aws:dynamodb:*:*:table/${var.meal_plans_table_name}/index/*",
        "arn:aws:dynamodb:*:*:table/${var.orders_table_name}",
        "arn:aws:dynamodb:*:*:table/${var.orders_table_name}/index/*",
        "arn:aws:dynamodb:*:*:table/${var.budgets_table_name}",
        "arn:aws:dynamodb:*:*:table/${var.budgets_table_name}/index/*",
        "arn:aws:dynamodb:*:*:table/${var.consumption_history_table_name}",
        "arn:aws:dynamodb:*:*:table/${var.consumption_history_table_name}/index/*",
        "arn:aws:dynamodb:*:*:table/${var.consumption_patterns_table_name}",
        "arn:aws:dynamodb:*:*:table/${var.consumption_patterns_table_name}/index/*"
      ]
    }]
  })
}

# S3 access policy
resource "aws_iam_role_policy" "s3_access" {
  name = "${var.name_prefix}-lambda-s3"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ]
      Resource = "arn:aws:s3:::${var.meal_plans_bucket_name}/*"
    }]
  })
}

# Secrets Manager access policy
resource "aws_iam_role_policy" "secrets_access" {
  name = "${var.name_prefix}-lambda-secrets"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue"
      ]
      Resource = values(var.secrets_arns)
    }]
  })
}

# Bedrock access policy for AI-powered features
resource "aws_iam_role_policy" "bedrock_access" {
  name = "${var.name_prefix}-lambda-bedrock"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ]
      Resource = [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    }]
  })
}

# Profile Manager Lambda
resource "aws_lambda_function" "profile_manager" {
  filename         = "${path.module}/placeholder.zip"
  function_name    = "${var.name_prefix}-profile-manager"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.runtime
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      PROFILES_TABLE = var.profiles_table_name
      ENVIRONMENT    = var.environment
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-profile-manager"
  })

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "profile_manager" {
  name              = "/aws/lambda/${aws_lambda_function.profile_manager.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# Inventory Manager Lambda
resource "aws_lambda_function" "inventory_manager" {
  filename         = "${path.module}/placeholder.zip"
  function_name    = "${var.name_prefix}-inventory-manager"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.runtime
  timeout         = 60
  memory_size     = 512

  environment {
    variables = {
      INVENTORY_TABLE = var.inventory_table_name
      FRIDGE_SECRET   = var.secrets_arns["fridge"]
      ENVIRONMENT     = var.environment
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-inventory-manager"
  })

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "inventory_manager" {
  name              = "/aws/lambda/${aws_lambda_function.inventory_manager.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# Calendar Analyzer Lambda
resource "aws_lambda_function" "calendar_analyzer" {
  filename         = "${path.module}/placeholder.zip"
  function_name    = "${var.name_prefix}-calendar-analyzer"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.runtime
  timeout         = 60
  memory_size     = 512

  environment {
    variables = {
      PROFILES_TABLE  = var.profiles_table_name
      CALENDAR_SECRET = var.secrets_arns["calendar"]
      ENVIRONMENT     = var.environment
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-calendar-analyzer"
  })

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "calendar_analyzer" {
  name              = "/aws/lambda/${aws_lambda_function.calendar_analyzer.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# Menu Generator Lambda
resource "aws_lambda_function" "menu_generator" {
  filename         = "${path.module}/placeholder.zip"
  function_name    = "${var.name_prefix}-menu-generator"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.runtime
  timeout         = 300
  memory_size     = 1024

  environment {
    variables = {
      MEAL_PLANS_TABLE   = var.meal_plans_table_name
      PROFILES_TABLE     = var.profiles_table_name
      INVENTORY_TABLE    = var.inventory_table_name
      MEAL_PLANS_BUCKET  = var.meal_plans_bucket_name
      RECIPE_SECRET      = var.secrets_arns["recipe"]
      BEDROCK_MODEL_ID   = "anthropic.claude-3-sonnet-20240229-v1:0"
      BEDROCK_REGION     = var.bedrock_region
      USE_BEDROCK        = var.enable_bedrock ? "true" : "false"
      ENVIRONMENT        = var.environment
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-menu-generator"
  })

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "menu_generator" {
  name              = "/aws/lambda/${aws_lambda_function.menu_generator.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# Shopping Agent Lambda
resource "aws_lambda_function" "shopping_agent" {
  filename         = "${path.module}/placeholder.zip"
  function_name    = "${var.name_prefix}-shopping-agent"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.runtime
  timeout         = 120
  memory_size     = 512

  environment {
    variables = {
      ORDERS_TABLE              = var.orders_table_name
      INVENTORY_TABLE           = var.inventory_table_name
      CONSUMPTION_PATTERNS_TABLE = var.consumption_patterns_table_name
      ODA_SECRET                = var.secrets_arns["oda"]
      BANK_SECRET               = var.secrets_arns["bank"]
      ENVIRONMENT               = var.environment
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-shopping-agent"
  })

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "shopping_agent" {
  name              = "/aws/lambda/${aws_lambda_function.shopping_agent.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# Consumption Learning Lambda
resource "aws_lambda_function" "consumption_learning" {
  filename         = "${path.module}/placeholder.zip"
  function_name    = "${var.name_prefix}-consumption-learning"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.runtime
  timeout         = 180
  memory_size     = 512

  environment {
    variables = {
      CONSUMPTION_HISTORY_TABLE  = var.consumption_history_table_name
      CONSUMPTION_PATTERNS_TABLE = var.consumption_patterns_table_name
      ENVIRONMENT                = var.environment
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-consumption-learning"
  })

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "consumption_learning" {
  name              = "/aws/lambda/${aws_lambda_function.consumption_learning.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# Budget Tracker Lambda
resource "aws_lambda_function" "budget_tracker" {
  filename         = "${path.module}/placeholder.zip"
  function_name    = "${var.name_prefix}-budget-tracker"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.runtime
  timeout         = 60
  memory_size     = 256

  environment {
    variables = {
      BUDGETS_TABLE       = var.budgets_table_name
      ORDERS_TABLE        = var.orders_table_name
      MEAL_PLANS_BUCKET   = var.meal_plans_bucket_name
      ENVIRONMENT         = var.environment
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-budget-tracker"
  })

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "budget_tracker" {
  name              = "/aws/lambda/${aws_lambda_function.budget_tracker.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# Create placeholder zip file
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = "exports.handler = async (event) => { return { statusCode: 200, body: 'Placeholder' }; };"
    filename = "index.js"
  }
}
