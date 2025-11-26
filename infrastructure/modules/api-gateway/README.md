# API Gateway Module

This module creates the REST API for ThirdShift profile management.

## Endpoints

- `POST /profiles` - Create profile
- `GET /profiles/{id}` - Get profile
- `PUT /profiles/{id}` - Update profile
- `DELETE /profiles/{id}` - Delete profile
- `GET /profiles` - List profiles

## Usage

```hcl
module "api_gateway" {
  source = "./modules/api-gateway"

  name_prefix              = "thirdshift-dev"
  environment              = "dev"
  profile_manager_arn      = module.lambda.profile_manager_arn
  profile_manager_name     = module.lambda.profile_manager_name
  
  tags = local.common_tags
}
```
