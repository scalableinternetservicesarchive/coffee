resource "aws_kms_key" "db_key" {
  description             = "KMS key for DB encryption for ${var.app_name}"
  deletion_window_in_days = 10
}

resource "aws_db_instance" "db" {
  name                    = var.app_name
  identifier              = var.app_name
  deletion_protection     = false
  skip_final_snapshot     = true
  kms_key_id              = aws_kms_key.db_key.arn
  allocated_storage       = 10
  max_allocated_storage   = 20
  storage_type            = "gp2"
  storage_encrypted       = true
  engine                  = "mysql"
  engine_version          = "8.0.11"
  instance_class          = "db.t3.micro"
  username                = "root"
  password                = "password"
  port                    = 3306
  publicly_accessible     = true
  db_subnet_group_name    = var.subnet_group
  vpc_security_group_ids  = [var.security_group]
  parameter_group_name    = "mysql-8-large-packet"
  multi_az                = false
  backup_retention_period = 7
  backup_window           = "10:30-11:30"
  maintenance_window      = "wed:09:00-wed:10:00"
}
