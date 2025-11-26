# DynamoDB Module

This module creates all DynamoDB tables for ThirdShift.

## Tables Created

1. **Profiles** - Family member and guest profiles
2. **Inventory** - Food inventory with expiration dates
3. **MealPlans** - Weekly meal plans
4. **Orders** - Grocery orders
5. **Budgets** - Budget tracking
6. **ConsumptionHistory** - Historical consumption data
7. **ConsumptionPatterns** - Learned consumption patterns

## Usage

```hcl
module "dynamodb" {
  source = "./modules/dynamodb"

  name_prefix                = "thirdshift-dev"
  environment                = "dev"
  enable_deletion_protection = false
  tags                       = local.common_tags
}
```
