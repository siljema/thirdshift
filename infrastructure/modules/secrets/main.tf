# Calendar API Credentials
resource "aws_secretsmanager_secret" "calendar_credentials" {
  name        = "${var.name_prefix}-calendar-credentials"
  description = "Calendar API credentials (Google, Microsoft)"
  
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-calendar-credentials"
  })
}

resource "aws_secretsmanager_secret_rotation" "calendar_credentials" {
  count = var.enable_rotation ? 1 : 0
  
  secret_id           = aws_secretsmanager_secret.calendar_credentials.id
  rotation_lambda_arn = var.rotation_lambda_arn

  rotation_rules {
    automatically_after_days = 90
  }
}

# Oda Grocery Service Credentials
resource "aws_secretsmanager_secret" "oda_credentials" {
  name        = "${var.name_prefix}-oda-credentials"
  description = "Oda grocery service API credentials"
  
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-oda-credentials"
  })
}

# Bank/Payment API Credentials
resource "aws_secretsmanager_secret" "bank_credentials" {
  name        = "${var.name_prefix}-bank-credentials"
  description = "Bank and payment API credentials"
  
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-bank-credentials"
  })
}

# Recipe API Keys
resource "aws_secretsmanager_secret" "recipe_api_keys" {
  name        = "${var.name_prefix}-recipe-api-keys"
  description = "Recipe API keys (Spoonacular, Edamam)"
  
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-recipe-api-keys"
  })
}

# Fridge Inventory Device Credentials
resource "aws_secretsmanager_secret" "fridge_credentials" {
  name        = "${var.name_prefix}-fridge-credentials"
  description = "Fridge inventory device API credentials"
  
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-fridge-credentials"
  })
}
