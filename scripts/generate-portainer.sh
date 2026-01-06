#!/bin/bash

# Configuration
SOURCE_FILE="docker-compose.prod.yml"
OUTPUT_FILE="docker-compose.portainer.yml"

echo "Generating Portainer-compatible stack file..."

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "Error: $SOURCE_FILE not found."
    exit 1
fi

# Use docker compose config to flatten the tree
# We use --no-interpolate to keep environment variable placeholders (${VAR})
# We use yq to remove env_file blocks as Portainer manages env via its own UI.
docker compose -f "$SOURCE_FILE" config --no-interpolate | yq 'del(.services[].env_file)' > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "Successfully generated $OUTPUT_FILE"
    echo "You can now copy the contents of this file into Portainer's Web Editor."
else
    echo "Error: Failed to generate $OUTPUT_FILE"
    exit 1
fi
