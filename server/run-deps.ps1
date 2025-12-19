
# Script to run local dependencies (Redis)
docker-compose -f docker-compose.deps.yml up -d
Write-Host "Local Redis started on port 6379"
