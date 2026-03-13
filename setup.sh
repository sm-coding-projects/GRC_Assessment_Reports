#!/bin/bash
# GRC Report Generator — Quick Setup
# Run from inside the grc-project/ directory after cloning.

set -e

echo ""
echo "  GRC Report Generator — Setup"
echo "  ─────────────────────────────"
echo ""

# Check Node.js version
command -v node >/dev/null 2>&1 || { echo "Node.js 20+ is required. Install from https://nodejs.org"; exit 1; }
NODE_VERSION=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "Node.js 20+ required. Current: $(node -v)"
  exit 1
fi

echo "  Node.js $(node -v)"
echo ""

# Install dependencies (postinstall runs prisma generate automatically)
echo "  Installing dependencies..."
npm install
echo ""

# Create .env from example if it doesn't exist
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  Created .env from .env.example"
else
  echo "  .env already exists, skipping"
fi

# Create local SQLite database
echo "  Creating local database..."
npx prisma db push
echo ""

echo "  ─────────────────────────────"
echo "  Setup complete!"
echo ""
echo "  Run the dev server:"
echo "    npm run dev"
echo ""
echo "  Then open http://localhost:3000"
echo ""
