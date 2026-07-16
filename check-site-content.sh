#!/bin/bash

echo "========================================="
echo "     CHECK SITE CONTENT BEING SERVED     "
echo "========================================="
echo ""

echo "🌐 Checking vishwaleader.com content..."
echo "-----------------------------------------"
echo ""

echo "📄 HEADERS RESPONSE:"
echo "-----------------------------------------"
curl -s -I https://vishwaleader.com | head -15
echo ""

echo "📄 PAGE CONTENT (first 50 lines):"
echo "-----------------------------------------"
curl -s https://vishwaleader.com | head -50
echo ""

echo "🔍 SEARCHING FOR 'COMING SOON' TEXT:"
echo "-----------------------------------------"
if curl -s https://vishwaleader.com | grep -i "coming soon" > /dev/null; then
    echo "❌ FOUND 'Coming Soon' text on the page!"
    echo "   This means you're seeing the coming-soon page."
else
    echo "✅ 'Coming Soon' text NOT found - you might be seeing the real site!"
fi
echo ""

echo "🔍 CHECKING PAGE TITLE:"
echo "-----------------------------------------"
PAGE_TITLE=$(curl -s https://vishwaleader.com | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')
if [ -n "$PAGE_TITLE" ]; then
    echo "📌 Page Title: $PAGE_TITLE"
else
    echo "❌ No title found"
fi
echo ""

echo "🔍 CHECKING FOR VERCEL DEPLOYMENT:"
echo "-----------------------------------------"
if curl -s -I https://vishwaleader.com | grep -i "x-vercel" > /dev/null; then
    echo "✅ Site is served by Vercel"
    curl -s -I https://vishwaleader.com | grep -i "x-vercel"
else
    echo "❌ Not Vercel"
fi
echo ""

echo "🔍 CHECKING LOCAL PROJECT FILES:"
echo "-----------------------------------------"
echo "Looking for coming-soon page in your project..."
echo ""

if [ -d "src/app/coming-soon" ]; then
    echo "📁 Found: src/app/coming-soon/"
    ls -la src/app/coming-soon/
    echo ""
    echo "📄 Page content:"
    cat src/app/coming-soon/page.tsx 2>/dev/null | head -20 || cat src/app/coming-soon/page.js 2>/dev/null | head -20 || echo "No page file found"
else
    echo "❌ No 'coming-soon' folder found in src/app/"
fi
echo ""

echo "🔍 CHECKING PAGES FOLDER:"
echo "-----------------------------------------"
if [ -d "src/app" ]; then
    echo "📁 Available routes in src/app/:"
    ls -la src/app/ | grep -v "^_" | grep -v "^\\." | grep -v "layout\|globals\|favicon\|manifest\|sitemap\|template"
fi
echo ""

echo "🔄 CHECKING NEXT.JS BUILD:"
echo "-----------------------------------------"
if [ -d ".next" ]; then
    echo "📁 .next folder exists"
    echo "Build time: $(stat -c %y .next 2>/dev/null || stat -f %Sm .next 2>/dev/null)"
else
    echo "❌ No .next folder - site not built locally"
fi
echo ""

echo "📝 VERDICT:"
echo "-----------------------------------------"
if curl -s https://vishwaleader.com | grep -i "coming soon" > /dev/null; then
    echo "❌ Your site is showing the COMING SOON page"
    echo ""
    echo "💡 Possible reasons:"
    echo "1. Your Vercel deployment is pointing to the coming-soon branch/folder"
    echo "2. Your next.config.ts is redirecting to coming-soon"
    echo "3. You haven't deployed the latest code"
    echo "4. The home page (page.tsx) is redirecting"
    echo ""
    echo "🔧 Fix:"
    echo "1. Check your home page: cat src/app/page.tsx"
    echo "2. Redeploy: ./deploy.sh"
    echo "3. Check Vercel deployment logs: vercel logs"
else
    echo "✅ Your site is NOT showing the coming soon page!"
    echo "   You might be seeing a cached version. Clear your browser cache."
fi
echo ""

echo "========================================="
echo "       END OF CONTENT CHECK              "
echo "========================================="
