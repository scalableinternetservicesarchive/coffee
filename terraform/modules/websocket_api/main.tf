resource "aws_apigatewayv2_api" "main" {
  name                       = var.app_name
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.type"
}

resource "aws_apigatewayv2_deployment" "main" {
  api_id = aws_apigatewayv2_api.main.id

  triggers = {
    redeployment = sha1(join(",", list(
      jsonencode(aws_apigatewayv2_route.connect),
      jsonencode(aws_apigatewayv2_integration.connect),
      jsonencode(aws_apigatewayv2_route.connection_init),
      jsonencode(aws_apigatewayv2_integration.connection_init),
      jsonencode(aws_apigatewayv2_route.start),
      jsonencode(aws_apigatewayv2_integration.start),
      jsonencode(aws_apigatewayv2_route.stop),
      jsonencode(aws_apigatewayv2_integration.stop),
      jsonencode(aws_apigatewayv2_route.disconnect),
      jsonencode(aws_apigatewayv2_integration.disconnect),
    )))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id = aws_apigatewayv2_api.main.id
  name   = "default"

  default_route_settings {
    detailed_metrics_enabled = true
    data_trace_enabled       = true
    logging_level            = "INFO"
    throttling_burst_limit   = 50
    throttling_rate_limit    = 50
  }
}


resource "aws_apigatewayv2_route" "connect" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.connect.id}"
}

resource "aws_apigatewayv2_integration" "connect" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  description               = "route websocket traffic to lambda"
  integration_method        = "POST"
  integration_uri           = "http://${var.appserver_host}/graphqlsubscription/connect"
  passthrough_behavior      = "WHEN_NO_MATCH"

  request_parameters = {
    "integration.request.header.connectionId" = "context.connectionId"
  }
}

resource "aws_apigatewayv2_route" "connection_init" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "connection_init"
  target    = "integrations/${aws_apigatewayv2_integration.connection_init.id}"
}

resource "aws_apigatewayv2_route_response" "connection_init" {
  api_id             = aws_apigatewayv2_api.main.id
  route_id           = aws_apigatewayv2_route.connection_init.id
  route_response_key = "$default"
}

resource "aws_apigatewayv2_integration" "connection_init" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  description               = "route websocket traffic to lambda"
  integration_method        = "POST"
  integration_uri           = "http://${var.appserver_host}/graphqlsubscription/connection_init"
  passthrough_behavior      = "WHEN_NO_MATCH"

  request_parameters = {
    "integration.request.header.connectionId" = "context.connectionId"
  }
}

resource "aws_apigatewayv2_integration_response" "connection_init" {
  api_id                   = aws_apigatewayv2_api.main.id
  integration_id           = aws_apigatewayv2_integration.connection_init.id
  integration_response_key = "/200/"
}

resource "aws_apigatewayv2_route" "start" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "start"
  target    = "integrations/${aws_apigatewayv2_integration.start.id}"
}

resource "aws_apigatewayv2_integration" "start" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  description               = "route websocket traffic to lambda"
  integration_method        = "POST"
  integration_uri           = "http://${var.appserver_host}/graphqlsubscription/start"
  passthrough_behavior      = "WHEN_NO_MATCH"

  request_parameters = {
    "integration.request.header.connectionId" = "context.connectionId"
  }
}

resource "aws_apigatewayv2_route" "stop" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "stop"
  target    = "integrations/${aws_apigatewayv2_integration.stop.id}"
}

resource "aws_apigatewayv2_integration" "stop" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  description               = "route websocket traffic to lambda"
  integration_method        = "POST"
  integration_uri           = "http://${var.appserver_host}/graphqlsubscription/stop"
  passthrough_behavior      = "WHEN_NO_MATCH"

  request_parameters = {
    "integration.request.header.connectionId" = "context.connectionId"
  }
}

resource "aws_apigatewayv2_route" "disconnect" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.disconnect.id}"
}

resource "aws_apigatewayv2_integration" "disconnect" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  description               = "route websocket traffic to lambda"
  integration_method        = "POST"
  integration_uri           = "http://${var.appserver_host}/graphqlsubscription/disconnect"
  passthrough_behavior      = "WHEN_NO_MATCH"

  request_parameters = {
    "integration.request.header.connectionId" = "context.connectionId"
  }
}
