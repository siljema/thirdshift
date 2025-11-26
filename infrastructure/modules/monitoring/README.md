# Monitoring Module

This module creates CloudWatch dashboards and alarms for ThirdShift.

## Features

- CloudWatch dashboard with key metrics
- Alarms for Lambda errors
- Alarms for Step Functions failures
- Alarms for DynamoDB throttling
- SNS notifications for critical alerts

## Usage

```hcl
module "monitoring" {
  source = "./modules/monitoring"

  name_prefix           = "thirdshift-dev"
  environment           = "dev"
  lambda_function_names = module.lambda.function_names
  state_machine_arn     = module.step_functions.state_machine_arn
  
  tags = local.common_tags
}
```
