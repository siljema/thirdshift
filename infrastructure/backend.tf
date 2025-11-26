# Backend configuration for Terraform state
# Uncomment and configure for remote state storage

# terraform {
#   backend "s3" {
#     bucket         = "thirdshift-terraform-state"
#     key            = "thirdshift/terraform.tfstate"
#     region         = "eu-west-1"
#     encrypt        = true
#     dynamodb_table = "thirdshift-terraform-locks"
#   }
# }
