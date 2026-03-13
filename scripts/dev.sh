#!/usr/bin/env bash
set -e

cleanup() {
  echo ""
  echo "Stopping Supabase..."
  supabase stop
  exit 0
}

trap cleanup INT TERM

# Start Supabase if not already running
if ! supabase status > /dev/null 2>&1; then
  echo "Starting Supabase..."
  supabase start
else
  echo "Supabase already running."
fi

# Run Next.js dev server in foreground
npx next dev "$@" &
NEXT_PID=$!

# Wait for Next.js to exit, and forward signals
wait $NEXT_PID
