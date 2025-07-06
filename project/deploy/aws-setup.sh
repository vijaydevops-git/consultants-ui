#!/bin/bash

# AWS EC2 Setup Script for Consultant Tracker
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
sudo apt install -y git curl nginx postgresql-client pm2 certbot python3-certbot-nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/consultant-tracker
sudo chown ubuntu:ubuntu /opt/consultant-tracker

# Copy application files
echo "📋 Copying application files..."
cp -r . /opt/consultant-tracker/
cd /opt/consultant-tracker

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies and building..."
cd ..
npm install
npm run build

# Copy built frontend to backend public directory
echo "📋 Setting up static files..."
mkdir -p backend/public
cp -r dist/* backend/public/

# Create production environment file
echo "⚙️ Creating production environment file..."
cd backend
cp .env.example .env

# Set proper permissions
echo "🔐 Setting file permissions..."
sudo chown -R ubuntu:ubuntu /opt/consultant-tracker
chmod +x /opt/consultant-tracker/deploy/*.sh

# Setup PM2 to run the application
echo "🔄 Setting up PM2 process manager..."
cd /opt/consultant-tracker/backend
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
echo ""
echo "🔐 Default login credentials:"
echo "   Admin: admin@company.com / password"
echo "   Recruiter: recruiter@company.com / password"
echo ""
echo "⚠️  IMPORTANT: Change default passwords immediately!"