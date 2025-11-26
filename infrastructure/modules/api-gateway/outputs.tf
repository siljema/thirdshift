output "api_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.thirdshift.id
}

output "api_url" {
  description = "API Gateway endpoint URL"
  value       = "${aws_api_gateway_stage.thirdshift.invoke_url}/profiles"
}

output "api_arn" {
  description = "API Gateway ARN"
  value       = aws_api_gateway_rest_api.thirdshift.arn
}

output "stage_name" {
  description = "API Gateway stage name"
  value       = aws_api_gateway_stage.thirdshift.stage_name
}
