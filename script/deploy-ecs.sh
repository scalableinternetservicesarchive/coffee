#!/bin/bash

##########################################################################
# deploy-ecs.sh
#
# Usage:
#   ./script/deploy-ecs.sh [app-web|app-background] [sha]
#
##########################################################################

set -e

usage="Usage: deploy-ecs.sh [bespin-app-web|bespin-app-background] [sha]"

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "$usage"
  exit 1
fi

ecs_region="us-west-2"

new_image="101624687637.dkr.ecr.us-west-2.amazonaws.com/bespin:$2"

previous_task_def=$(aws ecs describe-task-definition --region $ecs_region --task-definition $1-task)
container_defs=$(echo "$previous_task_def" | jq .taskDefinition.containerDefinitions)
new_container_defs=$(echo "$container_defs" | jq ".[0]"=".[0] + {\"image\":\"$new_image\"}")

prev_task_role=$(echo "$previous_task_def" | jq -r .taskDefinition.taskRoleArn)
prev_exec_role=$(echo "$previous_task_def" | jq -r .taskDefinition.executionRoleArn)
prev_network=$(echo "$previous_task_def" | jq -r .taskDefinition.networkMode)
prev_compat=$(echo "$previous_task_def" | jq .taskDefinition.requiresCompatibilities)
prev_cpu=$(echo "$previous_task_def" | jq '.taskDefinition.cpu | tonumber')
prev_memory=$(echo "$previous_task_def" | jq '.taskDefinition.memory | tonumber')

echo "deploying $new_image"

new_task_def=$(aws ecs register-task-definition --family $1-task \
  --region "$ecs_region" \
  --task-role-arn "$prev_task_role" \
  --execution-role-arn "$prev_exec_role" \
  --network-mode "$prev_network" \
  --container-definitions "$new_container_defs" \
  --requires-compatibilities "$prev_compat" \
  --cpu $prev_cpu \
  --memory $prev_memory)

new_task_def_arn=$(echo $new_task_def | jq -r .taskDefinition.taskDefinitionArn)

echo "created new task definition: $new_task_def_arn"
echo "deploying new task definition to $1-service..."

aws ecs update-service --cluster bespin \
  --no-cli-pager \
  --region "$ecs_region" \
  --force-new-deployment \
  --service "$1-service" \
  --task-definition "$new_task_def_arn"

echo "deployed!"
