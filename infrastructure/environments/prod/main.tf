module "thirdshift" {
  source = "../.."

  environment                = "prod"
  aws_region                 = "eu-west-1"
  project_name               = "thirdshift"
  lambda_runtime             = "nodejs18.x"
  enable_deletion_protection = true
  log_retention_days         = 30
  enable_bedrock             = true
  bedrock_region             = "us-east-1"
}
