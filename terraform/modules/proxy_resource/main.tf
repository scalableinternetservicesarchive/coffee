resource "aws_api_gateway_resource" "greedy_proxy_resource" {
  rest_api_id = var.rest_api_id
  parent_id   = var.parent_id
  path_part   = "{proxy+}"
}

module "proxy_method" {
  source          = "../proxy_method"
  resource_id     = aws_api_gateway_resource.greedy_proxy_resource.id
  rest_api_id     = var.rest_api_id
  destination_url = var.destination_url
}
