resource "aws_lambda_function" "lambda" {
  function_name = var.app_name

  s3_bucket = "cloudcity-build-artifacts"
  s3_key    = "server/bundle.zip"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "server/src/lambda/handler.handler"

  runtime     = "nodejs12.x"
  timeout     = 900
  memory_size = 3008

  role = "arn:aws:iam::101624687637:role/lambda_exec"

  # add chrome lambda layer
  layers = ["arn:aws:lambda:us-west-2:101624687637:layer:chrome-aws-lambda:2"]

  # [aws_subnet.lambda_1.id. aws_subnet.lambda_2.id]
  vpc_config {
    subnet_ids = [
      "subnet-0086e7e53a41565b1",
      "subnet-0bed05ced30b1c194"
    ]

    # aws_default_security_group.default.id
    security_group_ids = ["sg-0a8977252699f5a80"]
  }

  environment {
    variables = {
      NODE_ENV       = "production"
      NODE_OPTIONS   = "--enable-source-maps"
      APP_NAME       = var.app_name
      CHROME_LAYER   = "true"
      HONEYCOMB_KEY  = var.honeycomb_key
      MYSQL_HOST     = var.mysql_host
      MYSQL_PORT     = "3306"
      MYSQL_USER     = "root"
      MYSQL_PASSWORD = "password"
      MYSQL_DATABASE = var.app_name
      REDIS_HOST     = var.redis_host
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.lambda.function_name}"
  retention_in_days = 30
}

# Invoke lambdas from API Gateway.
# Incoming requests must match a configured resource and method.
# Lambda URIs are "{+lambda}/{+function}" e.g. "bespin/ping".
# We also support path matching at the root e.g. "bespin" but these require definining separate "_root" terraform resources.
resource "aws_api_gateway_rest_api" "lambda" {
  name        = var.app_name
  description = "API Gateway for invoking lambdas"
}

resource "aws_api_gateway_resource" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.lambda.id
  parent_id   = aws_api_gateway_rest_api.lambda.root_resource_id
  path_part   = var.app_name
}

resource "aws_api_gateway_resource" "lambda_function" {
  rest_api_id = aws_api_gateway_rest_api.lambda.id
  parent_id   = aws_api_gateway_resource.lambda_root.id
  path_part   = "{function+}"
}

resource "aws_api_gateway_method" "lambda_root" {
  rest_api_id   = aws_api_gateway_rest_api.lambda.id
  resource_id   = aws_api_gateway_resource.lambda_root.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "lambda_function" {
  rest_api_id   = aws_api_gateway_rest_api.lambda.id
  resource_id   = aws_api_gateway_resource.lambda_function.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.lambda.id
  resource_id = aws_api_gateway_method.lambda_root.resource_id
  http_method = aws_api_gateway_method.lambda_root.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda.invoke_arn
}

resource "aws_api_gateway_integration" "lambda_function" {
  rest_api_id = aws_api_gateway_rest_api.lambda.id
  resource_id = aws_api_gateway_method.lambda_function.resource_id
  http_method = aws_api_gateway_method.lambda_function.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.lambda.id
  stage_name  = "default"

  triggers = {
    redeployment = sha1(join(",", list(
      jsonencode(aws_api_gateway_integration.lambda_root),
      jsonencode(aws_api_gateway_integration.lambda_function),
    )))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lambda_permission" "invoke_lambda_root_from_api_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.arn
  principal     = "apigateway.amazonaws.com"

  # The /*/* portion grants access from any method on any resource within the "lambda" API Gateway.
  # see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "${aws_api_gateway_deployment.lambda.execution_arn}/*/${var.app_name}"
}

resource "aws_lambda_permission" "invoke_lambda_function_from_api_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_deployment.lambda.execution_arn}/*/${var.app_name}/*"
}
