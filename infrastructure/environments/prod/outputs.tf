output "dynamodb_tables" {
  value = module.thirdshift.dynamodb_tables
}

output "lambda_functions" {
  value = module.thirdshift.lambda_functions
}

output "api_gateway_url" {
  value = module.thirdshift.api_gateway_url
}

output "s3_bucket_name" {
  value = module.thirdshift.s3_bucket_name
}

output "step_functions_arn" {
  value = module.thirdshift.step_functions_arn
}
