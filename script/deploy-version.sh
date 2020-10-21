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

echo "updating lambda bespin"
aws lambda update-function-code \
  --region us-west-2 \
  --function-name bespin \
  --s3-bucket cloudcity-build-artifacts \
  --s3-key server/$1.jar

echo "updating bespin-app-web"
./script/deploy-ecs.sh bespin-app-web $1

# echo "updating bespin-app-background"
# ./script/deploy-ecs.sh bespin-app-background $1

echo "DONE"