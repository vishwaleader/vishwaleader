#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vishwa Leader Dev Server Auto-Fix Script${NC}"
echo "================================================"

# Step 1: Check if Node.js is installed
echo -e "${YELLOW}📦 Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found! Please install Node.js v18+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Step 2: Check if npm is installed
echo -e "${YELLOW}📦 Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"

# Step 3: Check for node_modules and install if needed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${GREEN}✅ node_modules already exists${NC}"
fi

# Step 4: Check if next.config.ts exists and needs turbopack config
echo -e "${YELLOW}🔧 Checking Next.js config...${NC}"
if [ -f "next.config.ts" ]; then
    # Check if turbopack config exists
    if ! grep -q "turbopack" next.config.ts; then
        echo -e "${YELLOW}⚠️  Adding turbopack config to next.config.ts...${NC}"
        
        # Backup original config
        cp next.config.ts next.config.ts.backup
        echo -e "${GREEN}✅ Backup created: next.config.ts.backup${NC}"
        
        # Add turbopack config
        if grep -q "const nextConfig" next.config.ts; then
            sed -i '/const nextConfig = {/a \  turbopack: {},' next.config.ts
            echo -e "${GREEN}✅ Added turbopack config to next.config.ts${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not auto-add turbopack config. Will use --webpack flag.${NC}"
        fi
    else
        echo -e "${GREEN}✅ turbopack config already exists${NC}"
    fi
fi

# Step 5: Check for environment variables
echo -e "${YELLOW}🔐 Checking environment variables...${NC}"
if [ ! -f ".env.local" ] && [ ! -f ".env.development.local" ]; then
    echo -e "${YELLOW}⚠️  No .env.local or .env.development.local found${NC}"
    echo -e "${YELLOW}💡 You may need to create .env.local with Firebase config${NC}"
    
    # Check if there's a sample env file
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}📝 Copying .env.example to .env.local...${NC}"
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env.local with your actual credentials${NC}"
    fi
else
    echo -e "${GREEN}✅ Environment files found${NC}"
fi

# Step 6: Determine how to run
echo -e "${YELLOW}🏃 Starting dev server...${NC}"
echo "================================================"

# Try different methods to start the server
if [ -f "package.json" ]; then
    # Check if script exists in package.json
    if grep -q '"dev":' package.json; then
        echo -e "${GREEN}✅ Found dev script in package.json${NC}"
        
        # Try with webpack flag
        echo -e "${BLUE}▶️  Running: npm run dev -- --webpack${NC}"
        npm run dev -- --webpack
        
        # If that fails, try without flag
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}⚠️  Trying without --webpack flag...${NC}"
            npm run dev
        fi
    else
        echo -e "${YELLOW}⚠️  No dev script found, trying npx next dev...${NC}"
        npx next dev --webpack
    fi
else
    echo -e "${RED}❌ package.json not found!${NC}"
    exit 1
fi

# This point is reached if the server stops
echo "================================================"
echo -e "${RED}❌ Dev server stopped${NC}"

# Prompt for troubleshooting
echo -e "${YELLOW}🔧 Troubleshooting tips:${NC}"
echo "1. Check Firebase credentials in .env.local"
echo "2. Try: npm run dev -- --webpack"
echo "3. Try: rm -rf .next && npm run dev"
echo "4. Check port 3000: lsof -i :3000"
