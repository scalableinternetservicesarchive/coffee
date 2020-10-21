module "mysql" {
  source = "./modules/mysql"
}

# module "redis" {
#   source = "./modules/redis"
# }

resource "aws_ecs_cluster" "bespin" {
  name = "bespin"
}

resource "aws_ecr_repository" "bespin" {
  name                 = "bespin"
  image_tag_mutability = "MUTABLE"
}

module "webserver" {
  source = "./modules/appserver"

  appserver_tag  = "app-web"
  ecr_repository = aws_ecr_repository.bespin.repository_url
  ecs_cluster    = aws_ecs_cluster.bespin.id

  mysql_host = module.mysql.host
  # redis_host = module.redis.host

  services      = "BACKGROUND"
  honeycomb_key = <insert key here>

  # ws_url = module.websocket_api.url
}

module "rest_api" {
  source         = "./modules/rest_api"
  appserver_host = module.webserver.host
}

# module "websocket_api" {
#   source         = "./modules/websocket_api"
#   appserver_host = module.webserver.host
# }

# module "lambda" {
#   source = "./modules/lambda"

#   honeycomb_key = <insert key here>

#   mysql_host = module.mysql.host
#   redis_host = module.redis.host
# }
