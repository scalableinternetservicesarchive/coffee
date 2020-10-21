resource "aws_api_gateway_integration" "catchall_node_proxy_integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = var.resource_id
  http_method             = "ANY"
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "${var.destination_url}{proxy}"
  passthrough_behavior    = "WHEN_NO_MATCH"

  request_parameters = var.map_host ? {
    "integration.request.path.proxy"  = "method.request.path.proxy"
    "integration.request.header.Host" = "method.request.header.Host"
    } : {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }

  depends_on = [
    aws_api_gateway_method.catchall_node_any_method
  ]
}

resource "aws_api_gateway_method" "catchall_node_any_method" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resource_id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = var.map_host ? {
    "method.request.path.proxy"  = true
    "method.request.header.Host" = true
    } : {
    "method.request.path.proxy" = true
  }
}
