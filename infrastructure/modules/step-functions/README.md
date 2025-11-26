# Step Functions Module

This module creates the Step Functions state machine for orchestrating the weekly planning cycle.

## Workflow

1. Analyze Calendar
2. Check Inventory
3. Learn Patterns
4. Generate Menu
5. Review Budget
6. Place Order
7. Send Notification

## Usage

```hcl
module "step_functions" {
  source = "./modules/step-functions"

  name_prefix                    = "thirdshift-dev"
  environment                    = "dev"
  calendar_analyzer_arn          = module.lambda.calendar_analyzer_arn
  inventory_manager_arn          = module.lambda.inventory_manager_arn
  # ... other Lambda ARNs
  
  tags = local.common_tags
}
```
