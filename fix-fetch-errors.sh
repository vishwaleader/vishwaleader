#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Fetch Error Diagnostic Script${NC}"
echo "================================================"

# 1. Check if server is actually running
echo -e "${YELLOW}📡 Checking if server is responding...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|304"; then
    echo -e "${GREEN}✅ Server is responding${NC}"
else
    echo -e "${RED}❌ Server not responding properly${NC}"
fi

# 2. Check API routes
echo -e "${YELLOW}🔍 Checking API routes...${NC}"
API_ROUTES=$(find src/app/api -type f -name "route.ts" -o -name "route.js" 2>/dev/null | head -5)
if [ -n "$API_ROUTES" ]; then
    echo -e "${GREEN}✅ Found API routes:${NC}"
    echo "$API_ROUTES" | while read -r route; do
        echo "   - $route"
        # Try to access the API endpoint
        API_PATH=$(echo "$route" | sed 's/src\/app\/api\///' | sed 's/route\.[tj]s//')
        if [ -n "$API_PATH" ]; then
            echo -e "${YELLOW}   Testing: http://localhost:3000/api/$API_PATH${NC}"
            curl -s -o /dev/null -w "   Status: %{http_code}\n" "http://localhost:3000/api/$API_PATH" 2>/dev/null || echo "   ❌ Failed to connect"
        fi
    done
else
    echo -e "${YELLOW}⚠️  No API routes found in src/app/api${NC}"
fi

# 3. Check for Firebase config issues
echo -e "${YELLOW}🔐 Checking Firebase configuration...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    # Check if required Firebase variables are set (without exposing values)
    grep -q "NEXT_PUBLIC_FIREBASE" .env.local && echo -e "${GREEN}✅ Firebase env vars found${NC}" || echo -e "${RED}❌ Missing Firebase env vars${NC}"
else
    echo -e "${RED}❌ .env.local not found${NC}"
fi

# 4. Check for Firebase admin credentials
echo -e "${YELLOW}🔑 Checking Firebase Admin credentials...${NC}"
if [ -f "firebase_admin_cred.json" ]; then
    echo -e "${GREEN}✅ firebase_admin_cred.json exists${NC}"
    # Validate JSON
    if python3 -m json.tool firebase_admin_cred.json > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Firebase admin credentials are valid JSON${NC}"
    else
        echo -e "${RED}❌ Invalid JSON in firebase_admin_cred.json${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  firebase_admin_cred.json not found (may not be needed)${NC}"
fi

# 5. Check for CORS issues
echo -e "${YELLOW}🌐 Checking CORS configuration...${NC}"
if grep -r "cors" src/ 2>/dev/null | grep -q "cors"; then
    echo -e "${GREEN}✅ CORS configuration found${NC}"
else
    echo -e "${YELLOW}⚠️  No explicit CORS config found (may not be needed)${NC}"
fi

# 6. Check network connectivity to Firebase
echo -e "${YELLOW}🌍 Checking Firebase connectivity...${NC}"
if [ -f ".env.local" ]; then
    PROJECT_ID=$(grep "NEXT_PUBLIC_FIREBASE_PROJECT_ID" .env.local | cut -d '=' -f2 | tr -d '"')
    if [ -n "$PROJECT_ID" ]; then
        echo -e "${BLUE}🔗 Testing connection to Firebase project: $PROJECT_ID${NC}"
        if curl -s -o /dev/null -w "%{http_code}" "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents" | grep -q "200\|403\|401"; then
            echo -e "${GREEN}✅ Firebase is reachable${NC}"
        else
            echo -e "${RED}❌ Cannot reach Firebase${NC}"
        fi
    fi
fi

# 7. Check Next.js configuration
echo -e "${YELLOW}⚙️  Checking Next.js config...${NC}"
if [ -f "next.config.ts" ]; then
    echo -e "${GREEN}✅ next.config.ts exists${NC}"
    # Check for rewrites or redirects that might affect API calls
    if grep -q "rewrites\|redirects" next.config.ts; then
        echo -e "${YELLOW}⚠️  Custom rewrites/redirects found - might affect API calls${NC}"
    fi
fi

echo "================================================"
echo -e "${BLUE}💡 Common fixes:${NC}"
echo "1. Ensure Firebase credentials are correct in .env.local"
echo "2. Check if all API routes have proper handlers"
echo "3. Verify Firebase project has Firestore enabled"
echo "4. Check if you're behind a proxy or firewall"
echo "5. Look for CORS issues in browser console"
echo ""
echo -e "${YELLOW}📝 To test API routes manually:${NC}"
echo "   curl http://localhost:3000/api/[route-name]"
echo ""
echo -e "${YELLOW}🔄 To restart with clean cache:${NC}"
echo "   rm -rf .next && npm run dev -- --webpack"

