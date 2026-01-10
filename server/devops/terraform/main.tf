# Terraform Configuration for AWS Infrastructure (PreExam V2.2)

provider "aws" {
  region = "ap-southeast-1" # Singapore
}

resource "aws_vpc" "preexam_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "PreExamVPC"
  }
}

# --- Database (RDS for PostgreSQL) ---
resource "aws_db_instance" "postgres_master" {
  identifier           = "preexam-db-master"
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "14.1"
  instance_class       = "db.t3.medium"
  username             = "admin"
  password             = "securepassword123" # In production, use AWS Secrets Manager
  parameter_group_name = "default.postgres14"
  skip_final_snapshot  = true
}

# --- Cache (ElastiCache Redis) ---
resource "aws_elasticache_cluster" "redis_cluster" {
  cluster_id           = "preexam-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  engine_version       = "6.2"
  port                 = 6379
}

# --- Application Clusters (ECS Fargate) ---
resource "aws_ecs_cluster" "preexam_cluster" {
  name = "preexam-api-cluster"
}

# Note: This is a simplified scaffold. A full production setup would include 
# Security Groups, Subnets, Load Balancer (ALB), and IAM Roles.
