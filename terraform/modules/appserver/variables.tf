variable "ecr_repository" {}
variable "ecs_cluster" {}
variable "honeycomb_key" {}
variable "mysql_host" {}
variable "redis_host" {
  default = ""
}
variable "ws_url" {
  default = ""
}
variable "cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = "1024"
}
variable "memory" {
  description = "Fargate instance memory to provision (in MiB)"
  default     = "4096"
}

variable "services" {
  description = "Comma separated list of services to run on the appserver"
  default     = ""
}

# Defaults
variable "app_name" {
  default = "bespin"
}
variable "appserver_tag" {
  default = "app-web"
}
variable "appserver_port" {
  default = 3000
}
variable "mysql_port" {
  default = 3306
}
variable "mysql_password" {
  default = "password"
}
variable "health_check_path" {
  default = "/api/ping"
}
variable "appserver_role" {
  default = "arn:aws:iam::101624687637:role/appserver"
}
variable "execution_role" {
  default = "arn:aws:iam::101624687637:role/ecs-task-execution"
}
variable "subnets" {
  default = ["subnet-021ce20bafb70273a", "subnet-00242b856b554b470", "subnet-0a924e0fc650b7ca2"]
}
variable "security_groups" {
  default = ["sg-082765868a3133a60", "sg-0a8977252699f5a80"]
}
variable "lb_security_group" {
  default = "sg-07e846113bb67cb7d"
}
variable "vpc" {
  default = "vpc-005b39bbd9a5194b2"
}
