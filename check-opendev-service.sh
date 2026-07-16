#!/bin/bash

echo "========================================="
echo "     CHECK OPENDev-labs.com SERVICE      "
echo "========================================="
echo ""

echo -e "${CYAN}${BOLD}1. Running Services:${NC}"
sudo systemctl list-units --type=service --state=running | grep -E "nginx|apache|httpd|node|next|vercel"
echo ""

echo -e "${CYAN}${BOLD}2. Listening Ports:${NC}"
sudo netstat -tulpn | grep LISTEN | grep -E "80|443|3000|8080|3001|8081"
echo ""

echo -e "${CYAN}${BOLD}3. Nginx Config (if installed):${NC}"
if command -v nginx &> /dev/null; then
    sudo nginx -T 2>/dev/null | grep -E "server_name|proxy_pass" | head -20
else
    echo "Nginx not installed"
fi
echo ""

echo -e "${CYAN}${BOLD}4. Check /etc/hosts:${NC}"
cat /etc/hosts | grep -E "opendev|nanopi"
echo ""

echo -e "${CYAN}${BOLD}5. Check for PM2 processes:${NC}"
pm2 list 2>/dev/null || echo "PM2 not installed"
echo ""

echo -e "${CYAN}${BOLD}6. Check for custom services:${NC}"
ls -la /etc/systemd/system/ | grep -E "opendev|nanopi|webui"
echo ""

echo -e "${GREEN}=========================================${NC}"
