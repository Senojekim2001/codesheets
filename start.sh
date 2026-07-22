#!/bin/bash
# ─────────────────────────────────────────────────────────
# CodeSheets — Local Dev Server Launcher (macOS)
# Double-click or run: ./start.sh
# ─────────────────────────────────────────────────────────

cd "$(dirname "$0")"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  echo "Press any key to exit..."
  read -n 1
  exit 1
fi

echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing packages (first run only)..."
  npm install
fi

echo ""
echo "🚀 Starting CodeSheets on http://localhost:3000"
echo "   Press Ctrl+C to stop the server."
echo ""

# Open browser after a short delay
(sleep 3 && open "http://localhost:3000") &

npm run dev
