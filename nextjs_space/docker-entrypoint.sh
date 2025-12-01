#!/bin/sh
set -e

echo "🚀 Starting Finanzas Personales App..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "✅ Starting Next.js server..."
exec "$@"
