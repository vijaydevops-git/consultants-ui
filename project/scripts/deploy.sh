#!/bin/bash

# Deployment script for updates
set -e

echo "🔄 Deploying Consultant Tracker updates..."

# Navigate to application directory
cd /opt/consultant-tracker

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install/update dependencies
echo "📦 Updating dependencies..."
npm install
cd backend && npm install --production

# Build frontend
echo "🏗️ Building frontend..."
cd ..
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

echo "✅ Deployment complete!"