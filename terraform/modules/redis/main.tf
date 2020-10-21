resource "aws_elasticache_cluster" "redis" {
  cluster_id           = var.app_name
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis5.0"
  engine_version       = "5.0.6"
  port                 = 6379
  subnet_group_name    = var.subnet_group
  security_group_ids   = [var.security_group]
  apply_immediately    = true
}
