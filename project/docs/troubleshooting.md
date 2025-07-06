# Troubleshooting Guide

## Common Issues and Solutions

### 1. Application Won't Start

**Symptoms**: PM2 shows app as stopped or errored

**Solutions**:
```bash
# Check PM2 logs
pm2 logs consultant-tracker

# Check if port 3000 is in use
sudo netstat -tlnp | grep :3000

# Restart the application
pm2 restart consultant-tracker
```

### 2. Database Connection Issues

**Symptoms**: "Connection refused" or "Authentication failed" errors

**Solutions**:
```bash
# Test database connection
psql -h YOUR_RDS_ENDPOINT -U USERNAME -d DATABASE_NAME

# Check environment variables
cat /opt/consultant-tracker/backend/.env

# Verify RDS security group allows connections from EC2
```

### 3. Nginx 502 Bad Gateway

**Symptoms**: Nginx shows 502 error

**Solutions**:
```bash
# Check if backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart consultant-tracker
sudo systemctl restart nginx
```

### 4. SSL Certificate Issues

**Symptoms**: HTTPS not working or certificate errors

**Solutions**:
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

### 5. Frontend Not Loading

**Symptoms**: Blank page or 404 errors

**Solutions**:
```bash
# Check if build files exist
ls -la /opt/consultant-tracker/backend/public/

# Rebuild frontend
cd /opt/consultant-tracker
npm run build
cp -r dist/* backend/public/
pm2 restart consultant-tracker
```

### 6. Performance Issues

**Symptoms**: Slow response times

**Solutions**:
```bash
# Check system resources
htop
df -h

# Check database performance
# Monitor slow queries in PostgreSQL

# Check PM2 monitoring
pm2 monit
```

### 7. Login Issues

**Symptoms**: Cannot login with default credentials

**Solutions**:
```bash
# Check if users exist in database
psql -h YOUR_RDS_ENDPOINT -U USERNAME -d DATABASE_NAME -c "SELECT email, role FROM users;"

# Reset password (if needed)
# Update password hash in database
```

## Log Locations

- **Application Logs**: `pm2 logs consultant-tracker`
- **Nginx Access Logs**: `/var/log/nginx/access.log`
- **Nginx Error Logs**: `/var/log/nginx/error.log`
- **System Logs**: `/var/log/syslog`

## Useful Commands

```bash
# Check application status
pm2 status

# View real-time logs
pm2 logs consultant-tracker --lines 100

# Restart application
pm2 restart consultant-tracker

# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

## Getting Help

1. Check the logs first using the commands above
2. Verify all environment variables are set correctly
3. Ensure database connectivity
4. Check AWS security groups and network ACLs
5. Verify domain DNS settings (if using custom domain)

If issues persist, check the main README.md for additional configuration details.