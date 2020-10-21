resource "aws_api_gateway_resource" "root_node" {
  rest_api_id = var.rest_api_id
  parent_id   = var.parent_id
  path_part   = var.path_part
}

module "proxy_method" {
  source          = "../proxy_method"
  resource_id     = aws_api_gateway_resource.root_node.id
  rest_api_id     = var.rest_api_id
  destination_url = var.destination_url
  map_host        = var.map_host
}

module "catchall" {
  source          = "../proxy_resource"
  rest_api_id     = var.rest_api_id
  parent_id       = aws_api_gateway_resource.root_node.id
  destination_url = var.destination_url
}
