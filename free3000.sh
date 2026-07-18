#!/bin/bash
PORT=3000

echo "Looking for processes to kill..."

# 1. Kill by port
PIDS_PORT=$(lsof -t -i:$PORT)
if [ -n "$PIDS_PORT" ]; then
  echo "Killing processes on port $PORT: $PIDS_PORT"
  kill -9 $PIDS_PORT
fi

# 2. Kill next-server
PIDS_SERVER=$(pgrep -f "next-server")
if [ -n "$PIDS_SERVER" ]; then
  echo "Killing next-server processes: $PIDS_SERVER"
  kill -9 $PIDS_SERVER
fi

# 3. Kill next dev / next-dev / next-router-worker
PIDS_DEV=$(pgrep -f "next dev" || pgrep -f "next-dev" || pgrep -f "next-router-worker")
if [ -n "$PIDS_DEV" ]; then
  echo "Killing other Next.js processes: $PIDS_DEV"
  kill -9 $PIDS_DEV
fi

echo "Done. Try running 'npm run dev' now."
