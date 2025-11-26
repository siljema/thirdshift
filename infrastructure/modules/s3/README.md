# S3 Module

This module creates the S3 bucket for storing meal plans and reports.

## Features

- Server-side encryption enabled
- Versioning enabled
- Lifecycle policies for old reports
- Public access blocked

## Usage

```hcl
module "s3" {
  source = "./modules/s3"

  name_prefix = "thirdshift-dev"
  environment = "dev"
  tags        = local.common_tags
}
```
