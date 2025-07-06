#!/bin/bash

# AWS Setup Script for Consultant Tracker
# This script sets up the complete environment on Ubuntu 22.04

set -e

echo "🚀 Starting AWS deployment setup for Consultant Tracker..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install other dependencies
echo "📦 Installing system dependencies..."
sudo apt install -y git curl nginx postgresql-client

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/consultant-tracker
sudo chown $USER:$USER /opt/consultant-tracker

# Clone repository (you'll need to replace with your repo URL)
echo "📋 Cloning repository..."
if [ ! -d "/opt/consultant-tracker/.git" ]; then
    git clone https://github.com/yourusername/consultant-tracker.git /opt/consultant-tracker
else
    cd /opt/consultant-tracker
    git pull origin main
fi

cd /opt/consultant-tracker

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install --production

# Build frontend
echo "🏗️ Building frontend..."
cd ..
npm run build

# Copy built frontend to backend public directory
echo "📋 Setting up static files..."
mkdir -p backend/public
cp -r dist/* backend/public/

# Create production environment file
echo "⚙️ Creating production environment file..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Please edit /opt/consultant-tracker/backend/.env with your database credentials"
fi

# Setup PM2 to run the application
echo "🔄 Setting up PM2 process manager..."
pm2 start index.js --name "consultant-tracker"
pm2 startup
pm2 save

# Setup Nginx
echo "🌐 Configuring Nginx..."
sudo cp /opt/consultant-tracker/deploy/nginx.conf /etc/nginx/sites-available/consultant-tracker
sudo ln -sf /etc/nginx/sites-available/consultant-tracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "✅ AWS deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update /opt/consultant-tracker/backend/.env with your RDS credentials"
echo "2. Create your PostgreSQL database and run the schema:"
echo "   psql -h YOUR_RDS_ENDPOINT -U USERNAME -d DATABASE_NAME < /opt/consultant-tracker/backend/database/schema.sql"
echo "3. Restart the application: pm2 restart consultant-tracker"
echo "4. If you have a domain, update the Nginx config and setup SSL"
echo ""
echo "🌐 Your application should be accessible at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"