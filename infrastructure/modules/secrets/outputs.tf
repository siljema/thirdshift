output "calendar_credentials_arn" {
  description = "Calendar credentials secret ARN"
  value       = aws_secretsmanager_secret.calendar_credentials.arn
}

output "oda_credentials_arn" {
  description = "Oda credentials secret ARN"
  value       = aws_secretsmanager_secret.oda_credentials.arn
}

output "bank_credentials_arn" {
  description = "Bank credentials secret ARN"
  value       = aws_secretsmanager_secret.bank_credentials.arn
}

output "recipe_api_keys_arn" {
  description = "Recipe API keys secret ARN"
  value       = aws_secretsmanager_secret.recipe_api_keys.arn
}

output "fridge_credentials_arn" {
  description = "Fridge credentials secret ARN"
  value       = aws_secretsmanager_secret.fridge_credentials.arn
}

output "secret_arns" {
  description = "Map of all secret ARNs"
  value = {
    calendar = aws_secretsmanager_secret.calendar_credentials.arn
    oda      = aws_secretsmanager_secret.oda_credentials.arn
    bank     = aws_secretsmanager_secret.bank_credentials.arn
    recipe   = aws_secretsmanager_secret.recipe_api_keys.arn
    fridge   = aws_secretsmanager_secret.fridge_credentials.arn
  }
}

output "secret_names" {
  description = "Map of all secret names"
  value = {
    calendar = aws_secretsmanager_secret.calendar_credentials.name
    oda      = aws_secretsmanager_secret.oda_credentials.name
    bank     = aws_secretsmanager_secret.bank_credentials.name
    recipe   = aws_secretsmanager_secret.recipe_api_keys.name
    fridge   = aws_secretsmanager_secret.fridge_credentials.name
  }
}
