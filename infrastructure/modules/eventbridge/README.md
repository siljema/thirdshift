# EventBridge Module

This module creates EventBridge rules for scheduling the weekly planning cycle.

## Rules Created

1. **Weekly Planning Cycle** - Triggers every Sunday evening
2. **Consumption Learning** - Runs weekly to update patterns

## Usage

```hcl
module "eventbridge" {
  source = "./modules/eventbridge"

  name_prefix           = "thirdshift-dev"
  environment           = "dev"
  state_machine_arn     = module.step_functions.state_machine_arn
  state_machine_role_arn = module.step_functions.execution_role_arn
  
  tags = local.common_tags
}
```
