#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

echo "========================================="
echo "     REMOVE ALL DOCKER (FINAL)          "
echo "========================================="
echo ""

echo -e "${YELLOW}⚠️  CONFIRMATION:${NC}"
echo -e "   • opendev-labs.com uses Cloudflare Tunnel + Vercel"
echo -e "   • Docker is NOT needed for anything"
echo -e "   • All Docker containers/images will be removed"
echo -e "   • ~5.2GB disk space will be freed"
echo ""

read -p "Are you sure you want to remove ALL Docker? (yes/no): " confirmation
if [[ "$confirmation" != "yes" ]]; then
    echo -e "${RED}Cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}${BOLD}1. Stopping ALL containers...${NC}"
docker stop $(docker ps -a -q) 2>/dev/null
echo -e "${GREEN}✅ All containers stopped${NC}"
echo ""

echo -e "${CYAN}${BOLD}2. Removing ALL containers...${NC}"
docker rm $(docker ps -a -q) 2>/dev/null
echo -e "${GREEN}✅ All containers removed${NC}"
echo ""

echo -e "${CYAN}${BOLD}3. Removing ALL images...${NC}"
docker rmi $(docker images -q) 2>/dev/null
echo -e "${GREEN}✅ All images removed${NC}"
echo ""

echo -e "${CYAN}${BOLD}4. Removing ALL volumes...${NC}"
docker volume rm $(docker volume ls -q) 2>/dev/null
echo -e "${GREEN}✅ All volumes removed${NC}"
echo ""

echo -e "${CYAN}${BOLD}5. Pruning everything...${NC}"
docker system prune -a -f --volumes 2>/dev/null
echo -e "${GREEN}✅ System pruned${NC}"
echo ""

echo -e "${CYAN}${BOLD}6. Removing Docker packages (optional)...${NC}"
echo -e "${YELLOW}Do you want to completely uninstall Docker?${NC}"
echo "   This will free even more space but might affect other projects"
read -p "Uninstall Docker too? (yes/no): " uninstall_docker

if [[ "$uninstall_docker" == "yes" ]]; then
    echo -e "${YELLOW}Removing Docker...${NC}"
    sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo apt-get autoremove -y
    sudo rm -rf /var/lib/docker
    sudo rm -rf /var/lib/containerd
    echo -e "${GREEN}✅ Docker removed${NC}"
else
    echo -e "${BLUE}Keeping Docker installed (just no images/containers)${NC}"
fi

echo ""
echo -e "${CYAN}${BOLD}📊 Final Disk Space:${NC}"
df -h /home
echo ""

echo -e "${GREEN}${BOLD}=========================================${NC}"
echo -e "${GREEN}${BOLD}    DOCKER REMOVED COMPLETELY!        ${NC}"
echo -e "${GREEN}${BOLD}=========================================${NC}"
echo ""
echo -e "${YELLOW}📌 Your services:${NC}"
echo "   ✅ opendev-labs.com → Cloudflare Tunnel + Vercel"
echo "   ✅ vishwaleader.com → Vercel"
echo "   ✅ All Docker removed → ~5GB freed!"
echo ""
echo -e "${YELLOW}ℹ️  Cloudflare Tunnel is stopped. To fix:${NC}"
echo "   cd ~/Desktop/syncstack/opendev-labs"
echo "   ./cloudflared tunnel run nanopi-tunnel"
