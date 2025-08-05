#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Base URL
BASE_URL="http://localhost"

# Function to check health endpoint
check_health() {
    local service=$1
    local endpoint=$2
    echo -n "Checking $service... "
    
    response=$(curl -s "$BASE_URL$endpoint")
    if [[ $response == *"\"status\":\"ok\""* ]]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}ERROR${NC}"
        echo "Response: $response"
    fi
}

# Main health checks
echo "=== System Health Check ==="
echo "Timestamp: $(date)"
echo "-------------------"

check_health "Frontend" "/health/frontend"
check_health "Backend API" "/health/backend"
check_health "MQTT Server" "/health/mqtt"
check_health "MySQL" "/health/mysql"
check_health "MQTT Broker" "/health/mqtt-broker"

echo "-------------------"
echo "Check complete"
