module "thirdshift" {
  source = "../.."

  environment                = "dev"
  aws_region                 = "us-west-2"
  project_name               = "thirdshift"
  lambda_runtime             = "nodejs18.x"
  enable_deletion_protection = false
  log_retention_days         = 7
  enable_bedrock             = true
  bedrock_region             = "us-east-1"
}
