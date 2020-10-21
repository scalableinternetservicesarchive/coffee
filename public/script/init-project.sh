#!/bin/bash

##########################################################################
# init-project.sh
#
# Usage:
#   ./script/init-project.sh [slug]
#
##########################################################################

usage="Usage: init-project.sh [slug]"

SLUG="$1"
if [ -z "$1" ]; then
  echo "Choose a project slug:"
  read slug
  SLUG="$slug"
fi

echo "Initializing project: $SLUG"

git clone https://github.com/rothfels/bespin.git $SLUG
cd $SLUG
rm -rf .git

sed -i.bak "s/bespin/$SLUG/g" **/*.tf
sed -i.bak "s/bespin/$SLUG/g" **/*.ts
sed -i.bak "s/bespin/$SLUG/g" **/*.yml
sed -i.bak "s/bespin/$SLUG/g" **/*.sh
sed -i.bak "s/bespin/$SLUG/g" **/*.json
rm -rf **/*.bak

git init

echo "Intalling dependencies... (you'll need node/npm installed first)"
npm install

cd ..

echo "========="
echo "Finished!"
echo "open ./$SLUG in your editor"