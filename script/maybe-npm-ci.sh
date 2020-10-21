#!/bin/bash
set -e

CHECKSUM="$1"

echo $1
echo "$1"

if [ "`cat checksum-installed || echo no-match`" == "$CHECKSUM" ]
then
  echo "Cache hit, skipping npm ci :)"
else
  echo "Running npm ci..."
  npm ci
fi

echo $CHECKSUM > ./checksum-installed
echo "Done. Checksum: `cat checksum-installed`"
