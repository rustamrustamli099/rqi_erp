#!/bin/bash
set -e

# Usage: ./switch-traffic.sh [blue|green]

TARGET_COLOR=$1

if [[ "$TARGET_COLOR" != "blue" && "$TARGET_COLOR" != "green" ]]; then
    echo "Usage: ./switch-traffic.sh [blue|green]"
    exit 1
fi

echo "🔄 Switching traffic to $TARGET_COLOR..."

# Create new upstream config definition
NEW_CONFIG="upstream active_upstream {
    server server-$TARGET_COLOR:3000;
}"

# Write to temp file first to ensure atomicity
echo "$NEW_CONFIG" > ./ops/nginx/conf.d/upstream.conf.tmp
mv ./ops/nginx/conf.d/upstream.conf.tmp ./ops/nginx/conf.d/upstream.conf

# Reload Nginx to apply changes (Zero Downtime)
docker-compose -f docker-compose.prod.yml exec -T nginx nginx -s reload

echo "✅ Traffic switched to $TARGET_COLOR successfully."
