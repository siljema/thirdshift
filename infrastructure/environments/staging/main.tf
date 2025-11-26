module "thirdshift" {
  source = "../.."

  environment                = "staging"
  aws_region                 = "eu-west-1"
  project_name               = "thirdshift"
  lambda_runtime             = "nodejs18.x"
  enable_deletion_protection = false
  log_retention_days         = 14
  enable_bedrock             = true
  bedrock_region             = "us-east-1"
}
