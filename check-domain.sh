#!/bin/bash

echo "========================================="
echo "     VISUAL LEADER DOMAIN STATUS         "
echo "========================================="
echo ""

echo "🌐 DOMAIN: vishwaleader.com"
echo ""

echo "📡 DNS RECORDS CHECK:"
echo "-----------------------------------------"

echo "🔍 A Record (vishwaleader.com):"
A_RECORD=$(dig A +short vishwaleader.com)
if [ -z "$A_RECORD" ]; then
    echo "❌ No A record found"
else
    echo "✅ $A_RECORD"
fi
echo ""

echo "🔍 CNAME Record (www.vishwaleader.com):"
CNAME_RECORD=$(dig CNAME +short www.vishwaleader.com)
if [ -z "$CNAME_RECORD" ]; then
    echo "❌ No CNAME record found"
else
    echo "✅ $CNAME_RECORD"
fi
echo ""

echo "🔍 NS Records (Nameservers):"
dig NS +short vishwaleader.com | head -5
echo ""

echo "🌍 DNS PROPAGATION CHECK (global):"
echo "-----------------------------------------"
echo "Checking from multiple locations..."
echo ""

# Check from different locations using public DNS servers
echo "📍 Google DNS (8.8.8.8):"
dig @8.8.8.8 A +short vishwaleader.com | head -1 || echo "❌ No response"
echo ""

echo "📍 Cloudflare DNS (1.1.1.1):"
dig @1.1.1.1 A +short vishwaleader.com | head -1 || echo "❌ No response"
echo ""

echo "📍 OpenDNS (208.67.222.222):"
dig @208.67.222.222 A +short vishwaleader.com | head -1 || echo "❌ No response"
echo ""

echo "🌐 WEBSITE STATUS CHECK:"
echo "-----------------------------------------"

echo "📡 HTTP Status Check (vishwaleader.com):"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vishwaleader.com 2>/dev/null)
if [ "$HTTP_STATUS" = "000" ]; then
    echo "❌ No response or connection refused"
elif [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 400 ]; then
    echo "✅ HTTP $HTTP_STATUS - Site is reachable!"
else
    echo "⚠️  HTTP $HTTP_STATUS - Site responded with error"
fi
echo ""

echo "📡 HTTP Status Check (www.vishwaleader.com):"
HTTP_STATUS_WWW=$(curl -s -o /dev/null -w "%{http_code}" https://www.vishwaleader.com 2>/dev/null)
if [ "$HTTP_STATUS_WWW" = "000" ]; then
    echo "❌ No response or connection refused"
elif [ "$HTTP_STATUS_WWW" -ge 200 ] && [ "$HTTP_STATUS_WWW" -lt 400 ]; then
    echo "✅ HTTP $HTTP_STATUS_WWW - Site is reachable!"
else
    echo "⚠️  HTTP $HTTP_STATUS_WWW - Site responded with error"
fi
echo ""

echo "🔗 VERCEL DEPLOYMENT STATUS:"
echo "-----------------------------------------"
VERCEL_DEPLOY=$(curl -s -I https://vishwaleader.com 2>/dev/null | grep -i "x-vercel" | head -1)
if [ -n "$VERCEL_DEPLOY" ]; then
    echo "✅ Deployed on Vercel"
    echo "   $VERCEL_DEPLOY"
else
    echo "❌ Not detected as Vercel deployment (DNS may not have propagated)"
fi
echo ""

echo "📝 EXPECTED RECORDS:"
echo "-----------------------------------------"
echo "✅ A Record should be:    216.198.79.1"
echo "✅ CNAME Record should be: db73397be5ddc70b.vercel-dns-017.com"
echo ""

echo "📊 CURRENT STATUS SUMMARY:"
echo "-----------------------------------------"

# Check if A record matches expected
EXPECTED_A="216.198.79.1"
if [ "$A_RECORD" = "$EXPECTED_A" ]; then
    echo "✅ A Record: CORRECT"
else
    echo "❌ A Record: INCORRECT (Expected: $EXPECTED_A)"
fi

# Check if CNAME record matches expected
EXPECTED_CNAME="db73397be5ddc70b.vercel-dns-017.com."
if [ "$CNAME_RECORD" = "$EXPECTED_CNAME" ] || [ "$CNAME_RECORD" = "db73397be5ddc70b.vercel-dns-017.com" ]; then
    echo "✅ CNAME Record: CORRECT"
else
    echo "❌ CNAME Record: INCORRECT (Expected: $EXPECTED_CNAME)"
fi
echo ""

echo "💡 TROUBLESHOOTING TIPS:"
echo "-----------------------------------------"
if [ "$A_RECORD" != "$EXPECTED_A" ] || [ "$CNAME_RECORD" != "$EXPECTED_CNAME" ]; then
    echo "⚠️  DNS records don't match expected values."
    echo "   → Log into your domain registrar and verify the records."
    echo "   → Wait 5-60 minutes for propagation."
elif [ "$HTTP_STATUS" = "000" ]; then
    echo "⚠️  DNS records are correct but site not responding."
    echo "   → Wait for DNS propagation (up to 48 hours)."
    echo "   → Check if Vercel deployment was successful."
    echo "   → Verify Vercel project settings."
else
    echo "✅ All checks passed! Your site should be live."
fi
echo ""

echo "🔄 RECOMMENDED NEXT STEPS:"
echo "-----------------------------------------"
echo "1. Wait 5-60 minutes for DNS propagation"
echo "2. Clear your browser cache (Ctrl+Shift+Delete)"
echo "3. Test on different device/network"
echo "4. Run this script again: ./check-domain.sh"
echo "5. Visit: https://vishwaleader.com"
echo ""

echo "========================================="
echo "       END OF DOMAIN STATUS CHECK         "
echo "========================================="
