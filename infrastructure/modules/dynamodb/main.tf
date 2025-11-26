# Profiles Table
resource "aws_dynamodb_table" "profiles" {
  name           = "${var.name_prefix}-profiles"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "profileId"
  
  deletion_protection_enabled = var.enable_deletion_protection

  attribute {
    name = "profileId"
    type = "S"
  }

  attribute {
    name = "type"
    type = "S"
  }

  global_secondary_index {
    name            = "type-index"
    hash_key        = "type"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-profiles"
  })
}

# Inventory Table
resource "aws_dynamodb_table" "inventory" {
  name           = "${var.name_prefix}-inventory"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "itemId"
  range_key      = "expirationDate"
  
  deletion_protection_enabled = var.enable_deletion_protection

  attribute {
    name = "itemId"
    type = "S"
  }

  attribute {
    name = "expirationDate"
    type = "S"
  }

  global_secondary_index {
    name            = "expirationDate-index"
    hash_key        = "expirationDate"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-inventory"
  })
}

# Meal Plans Table
resource "aws_dynamodb_table" "meal_plans" {
  name           = "${var.name_prefix}-meal-plans"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "mealPlanId"
  range_key      = "weekStartDate"
  
  deletion_protection_enabled = var.enable_deletion_protection

  attribute {
    name = "mealPlanId"
    type = "S"
  }

  attribute {
    name = "weekStartDate"
    type = "S"
  }

  global_secondary_index {
    name            = "weekStartDate-index"
    hash_key        = "weekStartDate"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-meal-plans"
  })
}

# Orders Table
resource "aws_dynamodb_table" "orders" {
  name           = "${var.name_prefix}-orders"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "orderId"
  range_key      = "orderDate"
  
  deletion_protection_enabled = var.enable_deletion_protection

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "orderDate"
    type = "S"
  }

  attribute {
    name = "deliveryDate"
    type = "S"
  }

  global_secondary_index {
    name            = "deliveryDate-index"
    hash_key        = "deliveryDate"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-orders"
  })
}

# Budgets Table
resource "aws_dynamodb_table" "budgets" {
  name           = "${var.name_prefix}-budgets"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "budgetId"
  range_key      = "startDate"
  
  deletion_protection_enabled = var.enable_deletion_protection

  attribute {
    name = "budgetId"
    type = "S"
  }

  attribute {
    name = "startDate"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-budgets"
  })
}

# Consumption History Table
resource "aws_dynamodb_table" "consumption_history" {
  name           = "${var.name_prefix}-consumption-history"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "historyId"
  range_key      = "date"
  
  deletion_protection_enabled = var.enable_deletion_protection

  attribute {
    name = "historyId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  attribute {
    name = "itemName"
    type = "S"
  }

  global_secondary_index {
    name            = "itemName-date-index"
    hash_key        = "itemName"
    range_key       = "date"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-consumption-history"
  })
}

# Consumption Patterns Table
resource "aws_dynamodb_table" "consumption_patterns" {
  name           = "${var.name_prefix}-consumption-patterns"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "itemName"
  
  deletion_protection_enabled = var.enable_deletion_protection

  attribute {
    name = "itemName"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-consumption-patterns"
  })
}
