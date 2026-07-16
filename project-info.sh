#!/bin/bash
echo "========================================="
echo "       PROJECT INFORMATION DUMP          "
echo "========================================="
echo ""
echo "📁 PROJECT ROOT:"
pwd
echo ""
echo "📦 PACKAGE.JSON:"
cat package.json | jq '{
  name: .name,
  version: .version,
  scripts: .scripts,
  dependencies: .dependencies | keys,
  devDependencies: .devDependencies | keys
}' 2>/dev/null || cat package.json
echo ""
echo "🔧 NEXT.JS CONFIG:"
cat next.config.ts 2>/dev/null || cat next.config.js 2>/dev/null || echo "No next.config found"
echo ""
echo "📱 VERCEL CONFIG:"
cat vercel.json 2>/dev/null || echo "No vercel.json found"
echo ""
echo "🏗️  PROJECT STRUCTURE:"
tree -L 3 -I 'node_modules|.next|dist|build|.git' --dirsfirst 2>/dev/null || find . -maxdepth 3 -type d -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" | head -30
echo ""
echo "📄 ENVIRONMENT VARIABLES (names only):"
grep -h "^[A-Z_]*=" .env* 2>/dev/null | cut -d= -f1 | sort -u || echo "No .env files found"
echo ""
echo "🚀 DEPLOYMENT SCRIPT:"
cat deploy.sh 2>/dev/null || echo "No deploy.sh found"
echo ""
echo "📊 FILE COUNTS:"
echo "Total files: $(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" 2>/dev/null | wc -l)"
echo "JS/TS files: $(find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" 2>/dev/null | wc -l)"
echo "Python files: $(find . -name "*.py" 2>/dev/null | wc -l)"
echo ""
echo "🔄 GIT STATUS:"
git status --short 2>/dev/null || echo "Not a git repo"
echo ""
echo "🔌 INSTALLED GLOBAL TOOLS:"
which vercel 2>/dev/null && vercel --version 2>/dev/null || echo "Vercel not found"
which firebase 2>/dev/null && firebase --version 2>/dev/null || echo "Firebase not found"
which node && node --version
which npm && npm --version
echo ""
echo "🖥️  SYSTEM INFO:"
uname -a
echo ""
echo "========================================="
echo "       END OF PROJECT INFORMATION         "
echo "========================================="
