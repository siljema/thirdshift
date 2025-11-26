# ThirdShift Infrastructure

This directory contains Terraform configuration for deploying ThirdShift to AWS.

## Structure

```
infrastructure/
├── environments/          # Environment-specific configurations
│   ├── dev/
│   ├── staging/
│   └── prod/
├── modules/              # Reusable Terraform modules
│   ├── dynamodb/
│   ├── lambda/
│   ├── api-gateway/
│   ├── step-functions/
│   ├── s3/
│   ├── secrets/
│   └── monitoring/
├── main.tf               # Main Terraform configuration
├── variables.tf          # Input variables
├── outputs.tf            # Output values
├── providers.tf          # Provider configuration
└── backend.tf            # Remote state configuration

## Prerequisites

- Terraform >= 1.5.0
- AWS CLI configured with appropriate credentials
- AWS account with necessary permissions

## Usage

### Initialize Terraform

```bash
cd infrastructure/environments/dev
terraform init
```

### Plan deployment

```bash
terraform plan
```

### Apply configuration

```bash
terraform apply
```

### Destroy resources

```bash
terraform destroy
```

## Environments

- **dev**: Development environment for testing
- **staging**: Pre-production environment
- **prod**: Production environment

## Module Documentation

Each module in the `modules/` directory contains its own README with usage examples and variable documentation.
