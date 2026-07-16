#!/bin/bash

# Find the Process ID (PID) listening on port 3000
PID=$(lsof -t -i:3000)

if [ -z "$PID" ]; then
  echo "✅ Port 3000 is already free. No process found."
else
  echo "⚠️  Found process(es) $PID running on port 3000. Killing..."
  kill -9 $PID
  echo "✅ Process killed. Port 3000 is now free."
fi
