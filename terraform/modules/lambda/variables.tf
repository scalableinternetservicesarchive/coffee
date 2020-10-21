variable "mysql_host" {}
variable "redis_host" {
  default = ""
}
variable "honeycomb_key" {}

variable "app_name" {
  default = "bespin"
}
variable "mysql_port" {
  default = 3306
}
variable "mysql_password" {
  default = "password"
}
