#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

echo "========================================="
echo "     SYSTEM DIAGNOSTIC & CLEANUP         "
echo "========================================="
echo ""

echo -e "${CYAN}${BOLD}📊 1. DISK SPACE USAGE${NC}"
echo "-----------------------------------------"
df -h | grep -E "(Filesystem|/dev/|/home)"
echo ""
echo -e "${YELLOW}Top 10 largest directories in /home:${NC}"
du -sh /home/* 2>/dev/null | sort -hr | head -10
echo ""

echo -e "${CYAN}${BOLD}💾 2. MEMORY USAGE${NC}"
echo "-----------------------------------------"
free -h
echo ""
echo -e "${YELLOW}Top 10 memory-consuming processes:${NC}"
ps aux --sort=-%mem | head -11
echo ""

echo -e "${CYAN}${BOLD}🔥 3. CPU USAGE${NC}"
echo "-----------------------------------------"
top -bn1 | head -20
echo ""
echo -e "${YELLOW}Top 10 CPU-consuming processes:${NC}"
ps aux --sort=-%cpu | head -11
echo ""

echo -e "${CYAN}${BOLD}📂 4. LARGE FILES IN PROJECT${NC}"
echo "-----------------------------------------"
echo -e "${YELLOW}Largest files in current project:${NC}"
find . -type f -size +100M -exec ls -lh {} \; 2>/dev/null | awk '{print $5 " " $9}' | sort -hr | head -10
echo ""

echo -e "${CYAN}${BOLD}🗑️  5. CACHE & TEMP FILES${NC}"
echo "-----------------------------------------"
echo -e "${YELLOW}Node modules size:${NC}"
du -sh node_modules 2>/dev/null || echo "No node_modules found"
echo -e "${YELLOW}.next size:${NC}"
du -sh .next 2>/dev/null || echo "No .next found"
echo -e "${YELLOW}npm cache size:${NC}"
du -sh ~/.npm/_cacache 2>/dev/null || echo "No npm cache found"
echo -e "${YELLOW}Temp folder size:${NC}"
du -sh /tmp 2>/dev/null
echo ""

echo -e "${CYAN}${BOLD}🐳 6. DOCKER (if installed)${NC}"
echo "-----------------------------------------"
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker disk usage:${NC}"
    docker system df 2>/dev/null
    echo ""
    echo -e "${YELLOW}Running containers:${NC}"
    docker ps 2>/dev/null
else
    echo "Docker not installed"
fi
echo ""

echo -e "${CYAN}${BOLD}📦 7. NODE_MODULES BREAKDOWN${NC}"
echo "-----------------------------------------"
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}Top 10 largest packages:${NC}"
    du -sh node_modules/* 2>/dev/null | sort -hr | head -10
fi
echo ""

echo -e "${CYAN}${BOLD}🔄 8. RUNNING PROCESSES${NC}"
echo "-----------------------------------------"
echo -e "${YELLOW}Node processes:${NC}"
ps aux | grep node | grep -v grep
echo ""
echo -e "${YELLOW}Next.js processes:${NC}"
ps aux | grep next | grep -v grep
echo ""

echo -e "${CYAN}${BOLD}💡 RECOMMENDATIONS${NC}"
echo "-----------------------------------------"

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "${RED}⚠️  Disk usage is at ${DISK_USAGE}% - CRITICAL!${NC}"
    echo "   → Run: sudo apt autoremove && sudo apt autoclean"
    echo "   → Delete: ~/.cache, ~/.npm/_cacache"
fi

# Check memory
MEM_USAGE=$(free | awk '/^Mem:/ {print ($3/$2)*100}' | cut -d. -f1)
if [ "$MEM_USAGE" -gt 80 ]; then
    echo -e "${RED}⚠️  Memory usage is at ${MEM_USAGE}% - CRITICAL!${NC}"
    echo "   → Close unused applications"
    echo "   → Kill heavy processes"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    NM_SIZE=$(du -s node_modules | cut -f1)
    if [ "$NM_SIZE" -gt 1000000 ]; then
        echo -e "${YELLOW}⚠️  node_modules is large (${NM_SIZE}KB)${NC}"
        echo "   → Run: npm ci --production"
        echo "   → Or: rm -rf node_modules && npm install"
    fi
fi

echo ""
echo -e "${GREEN}${BOLD}=========================================${NC}"
echo -e "${GREEN}${BOLD}    DIAGNOSTIC COMPLETE               ${NC}"
echo -e "${GREEN}${BOLD}=========================================${NC}"
