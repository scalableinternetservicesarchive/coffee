resource "aws_ecs_task_definition" "appserver" {
  family                   = "${var.app_name}-${var.appserver_tag}-task"
  task_role_arn            = var.appserver_role
  execution_role_arn       = var.execution_role
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory

  container_definitions = <<DEFINITION
[
  {
    "cpu": ${var.cpu},
    "image": "${var.ecr_repository}:latest",
    "memory": ${var.memory},
    "name": "${var.app_name}-${var.appserver_tag}",
    "networkMode": "awsvpc",
    "environment": [
        { "name": "NODE_PATH", "value": "/bin" },
        { "name": "NODE_OPTIONS", "value": "--enable-source-maps" },
        { "name": "NODE_ENV", "value": "production" },
        { "name": "APP_NAME", "value": "${var.app_name}" },
        { "name": "APPSERVER_TAG", "value": "${var.appserver_tag}" },
        { "name": "HONEYCOMB_KEY", "value": "${var.honeycomb_key}" },
        { "name": "SERVICES", "value": "${var.services}" },
        { "name": "MYSQL_HOST", "value": "${var.mysql_host}" },
        { "name": "MYSQL_PORT", "value": "3306" },
        { "name": "MYSQL_USER", "value": "root" },
        { "name": "MYSQL_PASSWORD", "value": "password" },
        { "name": "MYSQL_DATABASE", "value": "${var.app_name}" },
        { "name": "WS_URL", "value": "${var.ws_url}" },
        { "name": "REDIS_HOST", "value": "${var.redis_host}" }
    ],
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/${var.app_name}-${var.appserver_tag}",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
    },
    "portMappings": [
      {
        "containerPort": ${var.appserver_port},
        "hostPort": ${var.appserver_port}
      }
    ]
  }
]
DEFINITION

}

# Uncomment block to fix task revision identifier mismatch after deployment.
# Before initially creating resources, loading the task definition will fail.

# data "aws_ecs_task_definition" "appserver" {
#   task_definition = aws_ecs_task_definition.appserver.family
# }

resource "aws_ecs_service" "appserver" {
  name            = "${var.app_name}-${var.appserver_tag}-service"
  cluster         = var.ecs_cluster
  task_definition = "${aws_ecs_task_definition.appserver.family}:${aws_ecs_task_definition.appserver.revision}"
  # task_definition = "${aws_ecs_task_definition.appserver.family}:${max(
  #   aws_ecs_task_definition.appserver.revision,
  #   data.aws_ecs_task_definition.appserver.revision,
  # )}"
  desired_count = "1"
  launch_type   = "FARGATE"

  network_configuration {
    security_groups  = var.security_groups
    subnets          = var.subnets
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.appserver.id
    container_name   = "${var.app_name}-${var.appserver_tag}"
    container_port   = var.appserver_port
  }
}

resource "aws_alb" "appserver" {
  name            = var.app_name
  subnets         = var.subnets
  security_groups = [var.lb_security_group]
}

resource "aws_alb_target_group" "appserver" {
  name                 = "${var.app_name}-${var.appserver_tag}"
  port                 = 80
  protocol             = "HTTP"
  vpc_id               = var.vpc
  target_type          = "ip"
  deregistration_delay = 20

  health_check {
    healthy_threshold   = "3"
    unhealthy_threshold = "4"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "10"
    path                = var.health_check_path
  }
}

# Redirect all traffic from the ALB to the target group
resource "aws_alb_listener" "front_end_http" {
  load_balancer_arn = aws_alb.appserver.id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.appserver.id
    type             = "forward"
  }
}

resource "aws_cloudwatch_log_group" "appserver" {
  name              = "/ecs/${var.app_name}-${var.appserver_tag}"
  retention_in_days = 30
}
