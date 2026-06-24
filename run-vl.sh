#!/bin/bash
# run-vl.sh - Start the Vishwa Leader site locally

# Get directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8080

echo "=========================================================="
echo "  Vishwa Leader - Local Development Server                "
echo "=========================================================="
echo "  Site root: $SCRIPT_DIR"
echo "  Running on: http://localhost:$PORT"
echo "  Press Ctrl+C to stop the server"
echo "=========================================================="

cd "$SCRIPT_DIR"

# Launch python http.server
if command -v python3 &>/dev/null; then
    python3 -m http.server "$PORT"
elif command -v python &>/dev/null; then
    python -m SimpleHTTPServer "$PORT"
else
    echo "Error: Python is not installed. Please install Python or run an alternative web server in $SCRIPT_DIR."
    exit 1
fi
