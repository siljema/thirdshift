# Lambda Module

This module creates all Lambda functions for ThirdShift.

## Functions Created

1. **Profile Manager** - CRUD operations for profiles
2. **Inventory Manager** - Inventory tracking and sync
3. **Calendar Analyzer** - Calendar integration and availability analysis
4. **Menu Generator** - Meal plan generation
5. **Shopping Agent** - Grocery ordering
6. **Consumption Learning** - Pattern learning
7. **Budget Tracker** - Budget monitoring

## Usage

```hcl
module "lambda" {
  source = "./modules/lambda"

  name_prefix         = "thirdshift-dev"
  environment         = "dev"
  runtime             = "nodejs18.x"
  log_retention_days  = 7
  
  profiles_table_name = module.dynamodb.profiles_table_name
  # ... other table names
  
  tags = local.common_tags
}
```
