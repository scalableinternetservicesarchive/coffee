#!/bin/bash

##########################################################################
# deploy.sh
#
# Usage:
#   ./script/deploy.sh [sha]
#
##########################################################################

set -e

usage="Usage: deploy.sh [sha]"

if [ -z "$1" ]; then
  echo "$usage"
  exit 1
fi

echo "DEPLOYING VERSION: $1"

echo "updating lambda coffee"
aws lambda update-function-code \
  --region us-west-2 \
  --function-name coffee \
  --s3-bucket cloudcity-build-artifacts \
  --s3-key server/$1.jar

echo "updating coffee-app-web"
./script/deploy-ecs.sh coffee-app-web $1

# echo "updating coffee-app-background"
# ./script/deploy-ecs.sh coffee-app-background $1

echo "DONE"