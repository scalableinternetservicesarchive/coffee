resource "aws_api_gateway_rest_api" "main" {
  name        = var.app_name
  description = "REST API for ${var.app_name}"

  # By default, API Gateway interprets request contents as UTF-8 text.
  # This garbles binary requests.
  binary_media_types = [
    "multipart/form-data",
    "multipart/related",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "multipart/*",
    "image/*",
  ]
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = "default"

  triggers = {
    redeployment = sha1(join(",", list(
      jsonencode(aws_api_gateway_integration.index),
      jsonencode(module.app),
      jsonencode(module.graphql),
      jsonencode(module.api),
      jsonencode(module.api_ping),
    )))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_method" "index" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_rest_api.main.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "index" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_rest_api.main.root_resource_id
  http_method             = "ANY"
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${var.appserver_host}/"
  passthrough_behavior    = "WHEN_NO_MATCH"

  depends_on = [
    aws_api_gateway_method.index
  ]
}

module "app" {
  source          = "../proxy_route"
  map_host        = true
  rest_api_id     = aws_api_gateway_rest_api.main.id
  parent_id       = aws_api_gateway_rest_api.main.root_resource_id
  path_part       = "app"
  destination_url = "http://${var.appserver_host}/app/"
}

module "auth" {
  source          = "../proxy_route"
  map_host        = true
  rest_api_id     = aws_api_gateway_rest_api.main.id
  parent_id       = aws_api_gateway_rest_api.main.root_resource_id
  path_part       = "auth"
  destination_url = "http://${var.appserver_host}/auth/"
}

module "graphql" {
  source          = "../proxy_route"
  map_host        = true
  rest_api_id     = aws_api_gateway_rest_api.main.id
  parent_id       = aws_api_gateway_rest_api.main.root_resource_id
  path_part       = "graphql"
  destination_url = "http://${var.appserver_host}/graphql/"
}

module "api" {
  source          = "../proxy_specific_route"
  rest_api_id     = aws_api_gateway_rest_api.main.id
  parent_id       = aws_api_gateway_rest_api.main.root_resource_id
  path_part       = "api"
  destination_url = "http://${var.appserver_host}/api/"
}

module "api_ping" {
  source          = "../proxy_specific_route"
  rest_api_id     = aws_api_gateway_rest_api.main.id
  parent_id       = module.api.resource_id
  path_part       = "ping"
  destination_url = "http://${var.appserver_host}/api/ping"
}

resource "aws_api_gateway_domain_name" "subdomain" {
  certificate_arn = "arn:aws:acm:us-east-1:101624687637:certificate/37823d9b-6b8f-4833-b504-c73357f90f5c"
  domain_name     = "${var.app_name}.cloudcity.computer"
}

resource "aws_api_gateway_base_path_mapping" "subdomain" {
  api_id      = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_deployment.main.stage_name
  domain_name = aws_api_gateway_domain_name.subdomain.domain_name
}

resource "aws_route53_record" "cloudcity" {
  name = aws_api_gateway_domain_name.subdomain.domain_name
  type = "A"
  # zone_id = aws_route53_zone.cloudcity.id
  zone_id = "Z07376781DVMYC4BMY19D"

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.subdomain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.subdomain.cloudfront_zone_id
  }
}
