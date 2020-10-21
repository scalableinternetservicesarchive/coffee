# Listen on .../foo
resource "aws_api_gateway_resource" "res" {
  rest_api_id = var.rest_api_id
  parent_id   = var.parent_id
  path_part   = var.path_part
}

# Route to some backend via HTTP Proxy
# (Other options include: route to a Lambda, etc.)
resource "aws_api_gateway_integration" "res_any_method_proxy" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.res.id
  http_method             = "ANY"
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = var.destination_url
  passthrough_behavior    = "WHEN_NO_MATCH"

  depends_on = [
    aws_api_gateway_method.res_any_method
  ]
}

# Route ANY http method (GET, POST, etc) to .../foo
resource "aws_api_gateway_method" "res_any_method" {
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.res.id
  http_method   = "ANY"
  authorization = "NONE"
}
