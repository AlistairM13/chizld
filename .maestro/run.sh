#!/bin/bash
# Wrapper script for running Maestro from Windows/Claude Code via WSL
# Usage: wsl bash .maestro/run.sh <flow-name>
# Example: wsl bash .maestro/run.sh go-to-train

export PATH="$PATH:$HOME/.maestro/bin"
export ADB_SERVER_SOCKET=tcp:172.24.112.1:5037

FLOW_NAME="${1:-launch}"
FLOW_FILE=".maestro/${FLOW_NAME}.yml"

if [ ! -f "$FLOW_FILE" ]; then
    echo "Error: Flow file not found: $FLOW_FILE"
    echo "Available flows:"
    ls -1 .maestro/*.yml 2>/dev/null | sed 's|.maestro/||;s|\.yml||'
    exit 1
fi

maestro --host 172.24.112.1 test "$FLOW_FILE"
