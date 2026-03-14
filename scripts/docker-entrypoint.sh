#!/bin/sh
set -e

echo "[entrypoint] Applying database schema..."
npx prisma db push --accept-data-loss 2>&1 || {
  echo "[entrypoint] db push failed, retrying in 3s..."
  sleep 3
  npx prisma db push --accept-data-loss
}

echo "[entrypoint] Seeding database (idempotent)..."
node prisma/seed.js || echo "[entrypoint] Seed skipped or already applied"

echo "[entrypoint] Starting application..."
exec node server.js
