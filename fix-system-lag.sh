#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

echo "========================================="
echo "     SYSTEM LAG FIX                     "
echo "========================================="
echo ""

echo -e "${CYAN}${BOLD}1. Killing Chrome processes...${NC}"
pkill -f chrome
sleep 2
echo -e "${GREEN}✅ Chrome killed${NC}"
echo ""

echo -e "${CYAN}${BOLD}2. Clearing npm cache...${NC}"
npm cache clean --force
echo -e "${GREEN}✅ npm cache cleared${NC}"
echo ""

echo -e "${CYAN}${BOLD}3. Removing node_modules...${NC}"
rm -rf node_modules
echo -e "${GREEN}✅ node_modules removed${NC}"
echo ""

echo -e "${CYAN}${BOLD}4. Removing .next...${NC}"
rm -rf .next
echo -e "${GREEN}✅ .next removed${NC}"
echo ""

echo -e "${CYAN}${BOLD}5. Clearing system cache...${NC}"
sudo sync && sudo sysctl vm.drop_caches=3
echo -e "${GREEN}✅ System cache cleared${NC}"
echo ""

echo -e "${CYAN}${BOLD}6. Resetting swap...${NC}"
sudo swapoff -a && sudo swapon -a
echo -e "${GREEN}✅ Swap reset${NC}"
echo ""

echo -e "${CYAN}${BOLD}7. Clearing temp files...${NC}"
rm -rf /tmp/*
echo -e "${GREEN}✅ Temp files cleared${NC}"
echo ""

echo -e "${GREEN}${BOLD}=========================================${NC}"
echo -e "${GREEN}${BOLD}    FIX COMPLETE!                    ${NC}"
echo -e "${GREEN}${BOLD}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Reinstall dependencies: npm install"
echo "2. Don't open too many Chrome tabs"
echo "3. Consider using Firefox for development"
echo "4. Run diagnostic again to verify"
echo ""

