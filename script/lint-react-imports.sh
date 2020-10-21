#!/bin/bash

_OUT=$(grep -E -r --include \*.ts\* "import React from" . \
  | grep -v "/node_modules/" \
  | grep -v "/bin/")

if [ -z "$_OUT" ]; then
  echo "No React import errors!"
  exit 0
else
  echo "Error linting React imports, please use `import * as React from 'react'` not `import React from 'react'`."
  echo $_OUT
  exit 1
fi