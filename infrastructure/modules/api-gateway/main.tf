# API Gateway REST API
resource "aws_api_gateway_rest_api" "thirdshift" {
  name        = "${var.name_prefix}-api"
  description = "ThirdShift Profile Management API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.tags
}

# /profiles resource
resource "aws_api_gateway_resource" "profiles" {
  rest_api_id = aws_api_gateway_rest_api.thirdshift.id
  parent_id   = aws_api_gateway_rest_api.thirdshift.root_resource_id
  path_part   = "profiles"
}

# /profiles/{id} resource
resource "aws_api_gateway_resource" "profile_id" {
  rest_api_id = aws_api_gateway_rest_api.thirdshift.id
  parent_id   = aws_api_gateway_resource.profiles.id
  path_part   = "{id}"
}

# POST /profiles
resource "aws_api_gateway_method" "create_profile" {
  rest_api_id   = aws_api_gateway_rest_api.thirdshift.id
  resource_id   = aws_api_gateway_resource.profiles.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "create_profile" {
  rest_api_id             = aws_api_gateway_rest_api.thirdshift.id
  resource_id             = aws_api_gateway_resource.profiles.id
  http_method             = aws_api_gateway_method.create_profile.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${var.profile_manager_arn}/invocations"
}

# GET /profiles
resource "aws_api_gateway_method" "list_profiles" {
  rest_api_id   = aws_api_gateway_rest_api.thirdshift.id
  resource_id   = aws_api_gateway_resource.profiles.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "list_profiles" {
  rest_api_id             = aws_api_gateway_rest_api.thirdshift.id
  resource_id             = aws_api_gateway_resource.profiles.id
  http_method             = aws_api_gateway_method.list_profiles.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${var.profile_manager_arn}/invocations"
}

# GET /profiles/{id}
resource "aws_api_gateway_method" "get_profile" {
  rest_api_id   = aws_api_gateway_rest_api.thirdshift.id
  resource_id   = aws_api_gateway_resource.profile_id.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_profile" {
  rest_api_id             = aws_api_gateway_rest_api.thirdshift.id
  resource_id             = aws_api_gateway_resource.profile_id.id
  http_method             = aws_api_gateway_method.get_profile.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${var.profile_manager_arn}/invocations"
}

# PUT /profiles/{id}
resource "aws_api_gateway_method" "update_profile" {
  rest_api_id   = aws_api_gateway_rest_api.thirdshift.id
  resource_id   = aws_api_gateway_resource.profile_id.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "update_profile" {
  rest_api_id             = aws_api_gateway_rest_api.thirdshift.id
  resource_id             = aws_api_gateway_resource.profile_id.id
  http_method             = aws_api_gateway_method.update_profile.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${var.profile_manager_arn}/invocations"
}

# DELETE /profiles/{id}
resource "aws_api_gateway_method" "delete_profile" {
  rest_api_id   = aws_api_gateway_rest_api.thirdshift.id
  resource_id   = aws_api_gateway_resource.profile_id.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "delete_profile" {
  rest_api_id             = aws_api_gateway_rest_api.thirdshift.id
  resource_id             = aws_api_gateway_resource.profile_id.id
  http_method             = aws_api_gateway_method.delete_profile.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${var.profile_manager_arn}/invocations"
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.profile_manager_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.thirdshift.execution_arn}/*/*"
}

# Deployment
resource "aws_api_gateway_deployment" "thirdshift" {
  rest_api_id = aws_api_gateway_rest_api.thirdshift.id

  depends_on = [
    aws_api_gateway_integration.create_profile,
    aws_api_gateway_integration.list_profiles,
    aws_api_gateway_integration.get_profile,
    aws_api_gateway_integration.update_profile,
    aws_api_gateway_integration.delete_profile,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# Stage
resource "aws_api_gateway_stage" "thirdshift" {
  deployment_id = aws_api_gateway_deployment.thirdshift.id
  rest_api_id   = aws_api_gateway_rest_api.thirdshift.id
  stage_name    = var.environment

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      caller         = "$context.identity.caller"
      user           = "$context.identity.user"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  # Ensure account settings are configured before creating stage with logging
  depends_on = [
    aws_api_gateway_account.main
  ]

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.name_prefix}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# IAM Role for API Gateway to write to CloudWatch Logs
resource "aws_iam_role" "api_gateway_cloudwatch" {
  name = "${var.name_prefix}-api-gateway-cloudwatch"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "apigateway.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch" {
  role       = aws_iam_role.api_gateway_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# Set the CloudWatch role for API Gateway account settings
resource "aws_api_gateway_account" "main" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn
}

data "aws_region" "current" {}
