# Secrets Manager Module

This module creates Secrets Manager secrets for storing API credentials.

## Secrets Created

1. **calendar-credentials** - Google/Microsoft calendar API credentials
2. **oda-credentials** - Oda grocery service credentials
3. **bank-credentials** - Bank/payment API credentials
4. **recipe-api-keys** - Recipe API keys

## Usage

```hcl
module "secrets" {
  source = "./modules/secrets"

  name_prefix = "thirdshift-dev"
  environment = "dev"
  tags        = local.common_tags
}
```

## Setting Secret Values

After deployment, set secret values using AWS CLI:

```bash
aws secretsmanager put-secret-value \
  --secret-id thirdshift-dev-calendar-credentials \
  --secret-string '{"google_client_id":"...","google_client_secret":"..."}'
```
