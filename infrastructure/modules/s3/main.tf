# S3 Bucket for meal plans and reports
resource "aws_s3_bucket" "meal_plans" {
  bucket = "${var.name_prefix}-meal-plans"

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-meal-plans"
  })
}

# Enable versioning
resource "aws_s3_bucket_versioning" "meal_plans" {
  bucket = aws_s3_bucket.meal_plans.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "meal_plans" {
  bucket = aws_s3_bucket.meal_plans.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "meal_plans" {
  bucket = aws_s3_bucket.meal_plans.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle policy for old reports
resource "aws_s3_bucket_lifecycle_configuration" "meal_plans" {
  bucket = aws_s3_bucket.meal_plans.id

  rule {
    id     = "delete-old-reports"
    status = "Enabled"

    filter {
      prefix = "reports/"
    }

    expiration {
      days = var.reports_retention_days
    }
  }

  rule {
    id     = "transition-old-meal-plans"
    status = "Enabled"

    filter {
      prefix = "meal-plans/"
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = var.meal_plans_retention_days
    }
  }
}

# CORS configuration for web UI access
resource "aws_s3_bucket_cors_configuration" "meal_plans" {
  bucket = aws_s3_bucket.meal_plans.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
