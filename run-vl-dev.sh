#!/bin/bash

echo "Cleaning up Next.js processes and port 3000..."

# Kill anything on port 3000
fuser -k -9 3000/tcp 2>/dev/null || true

# Kill any lingering Next.js processes
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "next dev" 2>/dev/null || true

echo "Starting Next.js dev server..."
npm run dev
