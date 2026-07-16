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
echo "     SYSTEM DIAGNOSTIC (FAST)            "
echo "========================================="
echo ""

echo -e "${CYAN}${BOLD}📊 1. DISK SPACE USAGE${NC}"
echo "-----------------------------------------"
df -h | grep -E "(Filesystem|/dev/|/home|/$)"
echo ""

echo -e "${CYAN}${BOLD}💾 2. MEMORY USAGE${NC}"
echo "-----------------------------------------"
free -h
echo ""
echo -e "${YELLOW}Top 5 memory-consuming processes:${NC}"
ps aux --sort=-%mem | head -6 | tail -5
echo ""

echo -e "${CYAN}${BOLD}🔥 3. CPU USAGE${NC}"
echo "-----------------------------------------"
echo -e "${YELLOW}CPU load average:${NC}"
uptime
echo ""
echo -e "${YELLOW}Top 5 CPU-consuming processes:${NC}"
ps aux --sort=-%cpu | head -6 | tail -5
echo ""

echo -e "${CYAN}${BOLD}📂 4. LARGE FILES IN PROJECT (QUICK SCAN)${NC}"
echo "-----------------------------------------"
echo -e "${YELLOW}Scanning for files > 100MB...${NC}"
find . -maxdepth 2 -type f -size +50M -exec ls -lh {} \; 2>/dev/null | awk '{print $5 " " $9}' | sort -hr
echo ""

echo -e "${CYAN}${BOLD}🗑️  5. CACHE & TEMP FILES${NC}"
echo "-----------------------------------------"
echo -e "${YELLOW}Checking cache sizes...${NC}"

# Check node_modules quickly
if [ -d "node_modules" ]; then
    echo -n "   node_modules: "
    du -sh node_modules 2>/dev/null || echo "N/A"
else
    echo "   node_modules: Not found"
fi

# Check .next quickly
if [ -d ".next" ]; then
    echo -n "   .next: "
    du -sh .next 2>/dev/null || echo "N/A"
else
    echo "   .next: Not found"
fi

# Check npm cache
echo -n "   npm cache: "
du -sh ~/.npm/_cacache 2>/dev/null || echo "N/A"

# Check system temp
echo -n "   /tmp: "
du -sh /tmp 2>/dev/null || echo "N/A"
echo ""

echo -e "${CYAN}${BOLD}📦 6. NODE_MODULES BREAKDOWN${NC}"
echo "-----------------------------------------"
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}Top 10 largest packages:${NC}"
    du -sh node_modules/* 2>/dev/null | sort -hr | head -10 | while read line; do
        echo "   $line"
    done
else
    echo "   No node_modules found"
fi
echo ""

echo -e "${CYAN}${BOLD}🔄 7. RUNNING PROCESSES${NC}"
echo "-----------------------------------------"
echo -e "${YELLOW}Node processes:${NC}"
ps aux | grep -E "node|next|vercel" | grep -v grep | while read line; do
    echo "   $line"
done
if [ -z "$(ps aux | grep -E "node|next|vercel" | grep -v grep)" ]; then
    echo "   No Node processes running"
fi
echo ""

echo -e "${CYAN}${BOLD}📊 8. PROJECT STATS${NC}"
echo "-----------------------------------------"
echo -e "${YELLOW}Total files:${NC} $(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" 2>/dev/null | wc -l)"
echo -e "${YELLOW}Total directories:${NC} $(find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" 2>/dev/null | wc -l)"
echo ""

echo -e "${CYAN}${BOLD}💡 RECOMMENDATIONS${NC}"
echo "-----------------------------------------"

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "${RED}⚠️  Disk usage is at ${DISK_USAGE}% - CRITICAL!${NC}"
    echo "   → Free up space:"
    echo "   → sudo apt autoremove && sudo apt autoclean"
    echo "   → rm -rf ~/.cache"
    echo "   → rm -rf ~/.npm/_cacache"
fi

# Check node_modules size
if [ -d "node_modules" ]; then
    NM_SIZE=$(du -s node_modules 2>/dev/null | cut -f1)
    if [ "$NM_SIZE" -gt 500000 ]; then
        echo -e "${YELLOW}⚠️  node_modules is large (${NM_SIZE}KB)${NC}"
        echo "   → Run: rm -rf node_modules && npm install"
    fi
fi

# Check if swap is being used
SWAP_USAGE=$(free | awk '/Swap:/ {print $3}')
if [ "$SWAP_USAGE" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Swap is being used (${SWAP_USAGE}KB)${NC}"
    echo "   → System is memory constrained"
    echo "   → Close unnecessary applications"
fi

# Check for zombie processes
ZOMBIES=$(ps aux | grep defunct | grep -v grep | wc -l)
if [ "$ZOMBIES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $ZOMBIES zombie processes found${NC}"
    echo "   → Run: kill -9 \$(ps aux | grep defunct | awk '{print \$2}')"
fi

echo ""
echo -e "${GREEN}${BOLD}=========================================${NC}"
echo -e "${GREEN}${BOLD}    DIAGNOSTIC COMPLETE               ${NC}"
echo -e "${GREEN}${BOLD}=========================================${NC}"
