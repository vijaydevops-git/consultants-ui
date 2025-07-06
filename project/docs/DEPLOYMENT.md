# Deployment Guide

## Prerequisites

- AWS Account with EC2 and RDS access
- Domain name (optional)
- GitHub repository with this code

## Step 1: Setup AWS RDS (PostgreSQL)

1. Go to AWS RDS Console
2. Create Database:
   - Engine: PostgreSQL 14+
   - Instance: db.t3.micro (free tier)
   - Storage: 20GB
   - Enable public access
   - Note the endpoint, username, and password

3. Configure Security Group:
   - Allow inbound traffic on port 5432 from your EC2 security group

## Step 2: Launch EC2 Instance

1. Launch Ubuntu 22.04 LTS instance
2. Instance type: t2.micro or better
3. Configure Security Group:
   - SSH (22): Your IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0

## Step 3: Setup GitHub Actions Secrets

In your GitHub repository, go to Settings > Secrets and add:

- `EC2_HOST`: Your EC2 public IP or domain
- `EC2_USERNAME`: ubuntu
- `EC2_SSH_KEY`: Your private SSH key content

## Step 4: Initial Server Setup

SSH into your EC2 instance:

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

Run the setup script:

```bash
curl -sSL https://raw.githubusercontent.com/yourusername/consultant-tracker/main/scripts/setup-aws.sh | bash
```

## Step 5: Configure Environment

Edit the production environment file:

```bash
sudo nano /opt/consultant-tracker/backend/.env
```

Update with your RDS credentials:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=consultant_tracker
DB_USER=your-db-username
DB_PASS=your-db-password
JWT_SECRET=your-super-secure-jwt-secret-key
```

## Step 6: Setup Database

```bash
psql -h YOUR_RDS_ENDPOINT -U USERNAME -d DATABASE_NAME < /opt/consultant-tracker/backend/database/schema.sql
```

## Step 7: Restart Application

```bash
pm2 restart consultant-tracker
```

## Step 8: Setup Domain (Optional)

If you have a domain:

1. Point your domain to EC2 IP in Route53
2. Update nginx configuration
3. Setup SSL with Let's Encrypt

## GitHub Actions Deployment

Once setup is complete, every push to main branch will automatically:

1. Run tests
2. Build the application
3. Deploy to your EC2 instance
4. Restart services

## Default Login Credentials

- **Admin**: admin@company.com / password
- **Recruiter**: recruiter@company.com / password

**⚠️ Change these credentials immediately in production!**