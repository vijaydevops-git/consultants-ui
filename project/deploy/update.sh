#!/bin/bash

# Application Update Script
# Use this to deploy updates to your application

set -e

echo "🔄 Updating Consultant Tracker application..."

cd /opt/consultant-tracker

# Pull latest changes (if using git)
echo "📥 Pulling latest changes..."
git pull origin main

# Install/update backend dependencies
echo "📦 Updating backend dependencies..."
cd backend
npm install --production

# Install/update frontend dependencies and rebuild
echo "📦 Updating frontend and rebuilding..."
cd ..
npm install
npm run build

# Update static files
echo "📋 Updating static files..."
rm -rf backend/public/*
cp -r dist/* backend/public/

# Restart application
echo "🔄 Restarting application..."
pm2 restart consultant-tracker

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Application update complete!"