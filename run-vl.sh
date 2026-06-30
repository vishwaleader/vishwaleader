#!/bin/bash
# run-vl.sh - Start the Vishwa Leader site locally

# Get directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8080

# Check if a port is free
is_port_free() {
    if command -v python3 &>/dev/null; then
        python3 -c "import socket; s = socket.socket(); s.bind(('localhost', $1))" &>/dev/null
        return $?
    elif command -v python &>/dev/null; then
        python -c "import socket; s = socket.socket(); s.bind(('localhost', $1))" &>/dev/null
        return $?
    fi
    return 0
}

# Find first free port starting from 8080
while ! is_port_free "$PORT"; do
    echo "Port $PORT is already in use. Trying next port..."
    PORT=$((PORT + 1))
done

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

