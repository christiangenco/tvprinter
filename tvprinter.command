#!/bin/bash

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the directory containing the script
cd "$DIR"

# Run index.js with Node
node index.js
