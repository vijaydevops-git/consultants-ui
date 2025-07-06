#!/bin/bash

# SSL Setup Script for Consultant Tracker
# Run this after you have configured your domain name

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <your-domain-name>"
    echo "Example: $0 consultants.yourcompany.com"
    exit 1
fi

DOMAIN=$1

echo "🔒 Setting up SSL for domain: $DOMAIN"

# Update Nginx configuration with domain name
echo "📝 Updating Nginx configuration..."
sudo sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/sites-available/consultant-tracker
sudo nginx -t
sudo systemctl reload nginx

# Install SSL certificate
echo "🔐 Installing SSL certificate..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Setup auto-renewal
echo "🔄 Setting up certificate auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "✅ SSL setup complete!"
echo "🌐 Your application is now available at: https://$DOMAIN"