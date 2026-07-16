#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

echo "========================================="
echo "     DOCKER ANALYSIS & CLEANUP           "
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed on this system${NC}"
    exit 1
fi

echo -e "${CYAN}${BOLD}🐳 DOCKER STATUS${NC}"
echo "-----------------------------------------"
sudo systemctl status docker --no-pager | grep -E "(Active|Loaded|Memory)"
echo ""

echo -e "${CYAN}${BOLD}📦 DOCKER DISK USAGE${NC}"
echo "-----------------------------------------"
docker system df
echo ""

echo -e "${CYAN}${BOLD}🔄 RUNNING CONTAINERS${NC}"
echo "-----------------------------------------"
if [ "$(docker ps -a -q | wc -l)" -gt 0 ]; then
    docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Size}}"
else
    echo "No containers running"
fi
echo ""

echo -e "${CYAN}${BOLD}💾 DOCKER IMAGES${NC}"
echo "-----------------------------------------"
if [ "$(docker images -q | wc -l)" -gt 0 ]; then
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
else
    echo "No images found"
fi
echo ""

echo -e "${CYAN}${BOLD}📊 DOCKER VOLUMES${NC}"
echo "-----------------------------------------"
if [ "$(docker volume ls -q | wc -l)" -gt 0 ]; then
    docker volume ls --format "table {{.Name}}\t{{.Driver}}\t{{.Mountpoint}}"
else
    echo "No volumes found"
fi
echo ""

echo -e "${CYAN}${BOLD}🔍 IDENTIFYING VISHWALEADER RELATED CONTAINERS${NC}"
echo "-----------------------------------------"
VISHWA_CONTAINERS=$(docker ps -a --format "{{.Names}}" | grep -iE "vishwa|leader|node|next|vercel" || echo "")

if [ -n "$VISHWA_CONTAINERS" ]; then
    echo -e "${GREEN}Found VishwaLeader related containers:${NC}"
    echo "$VISHWA_CONTAINERS"
else
    echo -e "${YELLOW}No VishwaLeader specific containers found${NC}"
    echo "All containers:"
    docker ps -a --format "{{.Names}}"
fi
echo ""

echo -e "${CYAN}${BOLD}📝 CONTAINER DETAILS${NC}"
echo "-----------------------------------------"
CONTAINERS=$(docker ps -a -q)
if [ -n "$CONTAINERS" ]; then
    for container in $(docker ps -a --format "{{.Names}}"); do
        echo -e "${YELLOW}Container:${NC} $container"
        docker inspect $container --format='{{.Config.Image}}' 2>/dev/null
        docker inspect $container --format='{{.HostConfig.RestartPolicy.Name}}' 2>/dev/null
        echo ""
    done
else
    echo "No containers to inspect"
fi

echo -e "${CYAN}${BOLD}💡 RECOMMENDATIONS${NC}"
echo "-----------------------------------------"

# Check for unnecessary images
IMAGES_COUNT=$(docker images -q | wc -l)
if [ "$IMAGES_COUNT" -gt 10 ]; then
    echo -e "${YELLOW}⚠️  You have $IMAGES_COUNT Docker images (many may be unused)${NC}"
    echo "   → Run: docker image prune -a -f"
fi

# Check for stopped containers
STOPPED=$(docker ps -a -f status=exited -q | wc -l)
if [ "$STOPPED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  You have $STOPPED stopped containers${NC}"
    echo "   → Run: docker container prune -f"
fi

# Check for unused volumes
UNUSED_VOLUMES=$(docker volume ls -q -f dangling=true | wc -l)
if [ "$UNUSED_VOLUMES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  You have $UNUSED_VOLUMES unused volumes${NC}"
    echo "   → Run: docker volume prune -f"
fi

# Check for Open WebUI (running on port 8080)
OPEN_WEBUI=$(docker ps --filter "name=open-webui" -q)
if [ -n "$OPEN_WEBUI" ]; then
    echo -e "${BLUE}ℹ️  Open WebUI is running (port 8080)${NC}"
    echo "   → This uses ~650MB RAM"
    echo "   → If not needed: docker stop open-webui"
fi

echo ""
echo -e "${GREEN}${BOLD}=========================================${NC}"
echo -e "${GREEN}${BOLD}    DOCKER ANALYSIS COMPLETE          ${NC}"
echo -e "${GREEN}${BOLD}=========================================${NC}"
