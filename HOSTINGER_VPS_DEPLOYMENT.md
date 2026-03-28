# 🚀 Hostinger VPS Deployment Guide

## Salon POS System (MEVN Stack)

This guide will walk you through deploying your Salon Point-of-Sale (POS) application (Vue.js 3 frontend + Express.js backend) on a Hostinger VPS.

**Domain:** salon-demo.lumicore-labs.com  
**Repository:** https://github.com/MG4ACA/saloon-system.git  
**Tech Stack:** Vue 3 + Vite | Express.js | MySQL | Nginx | PM2

---

## 📋 Prerequisites

- Hostinger VPS with Ubuntu 22.04 (or similar) + Node.js installed
- SSH access to your VPS
- Your VPS IP address
- Domain: salon-demo.lumicore-labs.com (pointed to your VPS IP)
- Git access to the repository

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              Hostinger VPS Server                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Nginx (Reverse Proxy)                        │ │
│  │  Port 80/443 (SSL with Let's Encrypt)         │ │
│  └──────────────────┬──────────────────────────┘ │
│                     │                             │
│  ┌──────────────────────────────┐ ┌────────────┐ │
│  │  Vue 3 Frontend (Vite)       │ │  Backend   │ │
│  │  Static Assets               │ │  Express   │ │
│  │  /var/www/salon-pos/frontend │ │  Port 3007 │ │
│  │  (index.html + assets)       │ │  PM2       │ │
│  └──────────────────────────────┘ └─────┬──────┘ │
│                                          │        │
│                                   ┌──────▼──────┐ │
│                                   │    MySQL    │ │
│                                   │  Database   │ │
│                                   │  salon_pos  │ │
│                                   └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Step 1: Connect to Your VPS

```bash
# Connect via SSH
ssh root@your_vps_ip

# Or if you have a username
ssh username@your_vps_ip
```

---

## 🔧 Step 2: Initial Server Setup

### 2.1 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Required Tools

```bash
# Install Git
sudo apt install git -y

# Install Node.js and npm (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PM2 (Process Manager for Node.js)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install nginx -y

# Install MySQL Server
sudo apt install mysql-server -y

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Install Certbot for SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
```

### 2.3 Configure Firewall

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (port 22)
sudo ufw allow 22

# Allow HTTP (port 80)
sudo ufw allow 80

# Allow HTTPS (port 443)
sudo ufw allow 443

# Check firewall status
sudo ufw status
```

---

## 🗄️ Step 3: Set Up MySQL Database

### 3.1 Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts to:

- Set root password
- Remove anonymous users
- Disallow root login remotely
- Remove test database

### 3.2 Create Database and User

```bash
# Login to MySQL
sudo mysql -u root -p

# Run these SQL commands:
```

```sql
-- Create database for salon POS
CREATE DATABASE salon_pos;

-- Create database user (replace 'salon_user' and password as needed)
CREATE USER 'salon_user'@'localhost' IDENTIFIED BY 'Velou@123';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON salon_pos.* TO 'salon_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

---

## 📥 Step 4: Deploy Your Application

### 4.1 Create Application Directory

```bash
# Create directory for salon POS application
sudo mkdir -p /var/www/salon-pos
cd /var/www/salon-pos

# Set correct permissions
sudo chown -R $USER:$USER /var/www/salon-pos
sudo chmod -R 755 /var/www/salon-pos
```

### 4.2 Clone Your Repository

```bash
# Clone the Salon POS System repository
cd /var/www/salon-pos
git clone https://github.com/MG4ACA/saloon-system.git .

# Or use SSH if you have SSH key configured
# git clone git@github.com:MG4ACA/saloon-system.git .

# Verify the clone
ls -la
```

---

## 🔨 Step 5: Set Up Backend

### 5.1 Navigate to Root Directory

```bash
cd /var/www/salon-pos

# Verify files exist
ls -la
# You should see: server, frontend, database, package.json, server.js, etc.
```

### 5.2 Install Backend Dependencies

```bash
# Install all root dependencies (backend + frontend)
npm install --production

# This installs Express.js, MySQL2, JWT, and other backend dependencies
```

### 5.3 Configure Environment Variables

```bash
# Create .env file at the root directory
nano .env
```

Add the following configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=salon_pos
DB_USER=salon_user
DB_PASSWORD=Velou@123

# Application Settings
NODE_ENV=production
PORT=3007
HOST=0.0.0.0

# JWT Configuration
JWT_SECRET=
JWT_EXPIRES_IN=24h

# Frontend URL (for CORS)
FRONTEND_URL=https://salon-demo.lumicore-labs.com

# Logging
LOG_LEVEL=info
```

**To generate a secure JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it in the `JWT_SECRET` field.

### 5.4 Initialize Database

```bash
# Run database migrations to create tables
npm run migrate

# (Optional) Seed database with initial data if available
# npm run seed
```

### 5.5 Test Backend Locally

```bash
# Start the backend server
npm start

# You should see output like:
# ✅ Server running on http://0.0.0.0:3007
# ✅ Database connection successful

# In another terminal, test the API
curl http://localhost:3007/api/health

# Press Ctrl+C to stop the server
```

### 5.6 Set Up PM2 for Backend

```bash
# Stop the server first (Ctrl+C if still running)

# Start backend with PM2
pm2 start server.js --name salon-pos-backend --instances max --watch

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# Display PM2 init command output and execute it if needed
# Usually looks like: sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup ...

# Check status
pm2 status
pm2 monit
```

**Useful PM2 Commands:**

```bash
# View logs
pm2 logs salon-pos-backend

# View specific number of lines
pm2 logs salon-pos-backend --lines 50

# Clear logs
pm2 flush

# Restart app
pm2 restart salon-pos-backend

# Stop app
pm2 stop salon-pos-backend

# Remove from PM2
pm2 delete salon-pos-backend

# Monitor resources
pm2 monit
```

---

## 🎨 Step 6: Set Up Frontend

### 6.1 Navigate to Frontend Directory

### 6.1 Navigate to Frontend Directory

```bash
cd /var/www/salon-pos/frontend
```

### 6.2 Configure Frontend Environment

```bash
# Create .env.production file for production API URL
nano .env.production
```

Add the following:

```env
VITE_API_BASE_URL=https://salon-demo.lumicore-labs.com/api
```

This tells the frontend to communicate with your backend through the Nginx reverse proxy.

### 6.3 Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd /var/www/salon-pos/frontend

# Install dependencies
npm install

# Build for production with Vite
npm run build

# This will create a 'dist' folder with optimized static files
ls -la dist
```

### 6.4 Move Built Frontend to Nginx Directory

```bash
# Create Nginx directory for frontend
sudo mkdir -p /var/www/salon-demo/frontend

# Copy built files to Nginx directory
sudo cp -r /var/www/salon-pos/frontend/dist/* /var/www/salon-demo/frontend/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/salon-demo/frontend
sudo chmod -R 755 /var/www/salon-demo/frontend

# Verify files were copied
ls -la /var/www/salon-demo/frontend
# You should see: index.html, assets/, etc.
```

---

## 🌐 Step 7: Configure Nginx

### 7.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/salon-demo
```

Add the following Nginx configuration:

```nginx
# Upstream backend
upstream salon_backend {
    server localhost:3007;
    keepalive 64;
}

server {
    listen 80;
    server_name salon-demo.lumicore-labs.com www.salon-demo.lumicore-labs.com;

    # Redirect HTTP to HTTPS (we'll do this after SSL is set up)
    # For now, allow both HTTP and HTTPS

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Frontend - Serve Vue.js app
    location / {
        root /var/www/salon-demo/frontend;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;

        # Cache static assets (js, css, images, etc.)
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # Don't cache index.html
        location = /index.html {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # Backend API - Proxy to Express.js
    location /api/ {
        proxy_pass http://salon_backend/api/;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Disable cache for API
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://salon_backend/api/health;
        access_log off;
    }

    # Logs
    access_log /var/log/nginx/salon-demo-access.log;
    error_log /var/log/nginx/salon-demo-error.log;
}
```

### 7.2 Enable Nginx Site

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/salon-demo /etc/nginx/sites-enabled/

# (Optional) Remove default site if not needed
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test Nginx configuration
sudo nginx -t

# If you see "test is successful", restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## 🔒 Step 8: Set Up SSL Certificate with Let's Encrypt

### 8.1 Install Certbot

```bash
# Already installed in Step 2, but verify
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Obtain SSL Certificate

```bash
# Replace with your domain
sudo certbot --nginx -d salon-demo.lumicore-labs.com -d www.salon-demo.lumicore-labs.com
```

Certbot will:

- Ask for email address (use your email)
- Ask you to agree to terms (press 'A' for Agree)
- Ask if you want to redirect HTTP to HTTPS (press '2' for redirect)
- Obtain and configure SSL certificate automatically

### 8.3 Verify SSL Certificate

```bash
# Test certificate auto-renewal
sudo certbot renew --dry-run

# Check certificate details
sudo certbot certificates
```

Good! The certificate will auto-renew 30 days before expiration.

### 8.4 Update Frontend for HTTPS

After SSL is set up, Nginx will automatically handle HTTPS. Verify your `.env.production` file uses `https://`:

```bash
cat /var/www/salon-pos/frontend/.env.production
# Should show: VITE_API_BASE_URL=https://salon-demo.lumicore-labs.com/api
```

---

## ✅ Step 9: Verify Deployment

### 9.1 Check Backend

```bash
# Check PM2 status
pm2 status

# Check if backend is listening on port 3007
sudo netstat -tlnp | grep 3007

# Check backend logs
pm2 logs salon-pos-backend

# Test API directly
curl http://localhost:3007/api/health
```

### 9.2 Check Nginx

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/salon-demo-error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/salon-demo-access.log
```

### 9.3 Check MySQL Database

```bash
# Connect to MySQL
mysql -u salon_user -p salon_pos

# Run a test query
SELECT * FROM users LIMIT 1;
EXIT;
```

### 9.4 Test Application in Browser

Open your browser and visit:

- **Frontend:** https://salon-demo.lumicore-labs.com
- **API Health Check:** https://salon-demo.lumicore-labs.com/api/health

You should see:

1. Salon POS login page at the frontend URL
2. `{"status": "OK", "message": "Server is running"}` at the health check URL

---

## 🔄 Step 10: Deployment Script for Updates

Create a deployment script for easy updates when you push changes to GitHub:

```bash
sudo nano /var/www/salon-pos/deploy.sh
```

```bash
#!/bin/bash

echo "🚀 Starting deployment..."
echo "📅 Deployment started at $(date)"

# Navigate to project directory
cd /var/www/salon-pos

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    exit 1
fi

# Backend deployment
echo "🔨 Installing backend dependencies..."
npm install --production

# Run database migrations if needed
echo "🗄️ Running database migrations..."
npm run migrate 2>/dev/null || echo "Migrations already up to date"

# Restart backend with PM2
echo "🔄 Restarting backend..."
pm2 restart salon-pos-backend

# Frontend deployment
echo "🎨 Building frontend..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "📂 Copying frontend to Nginx..."
sudo cp -r dist/* /var/www/salon-demo/frontend/

# Clear browser cache by updating index.html permissions
sudo touch /var/www/salon-demo/frontend/index.html

# Restart Nginx
echo "🌐 Restarting Nginx..."
sudo systemctl restart nginx

if [ $? -eq 0 ]; then
    echo "✅ Deployment complete!"
    echo "🌍 App available at: https://salon-demo.lumicore-labs.com"
else
    echo "❌ Nginx restart failed"
    exit 1
fi
```

Make it executable and add to sudoers:

```bash
chmod +x /var/www/salon-pos/deploy.sh

# To run deployment without password prompt
sudo visudo
# Add this line at the end:
# username ALL=(ALL) NOPASSWD: /var/www/salon-pos/deploy.sh

# Now you can run it easily:
/var/www/salon-pos/deploy.sh
```

---

## 🛠️ Maintenance Commands

### Check Application Status

```bash
# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# Check disk space
df -h

# Check memory usage
free -m

# Check CPU usage
top -b -n 1 | head -20
```

### View Logs

```bash
# Backend logs (real-time)
pm2 logs salon-pos-backend

# Backend logs (last 100 lines)
pm2 logs salon-pos-backend --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/salon-demo-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/salon-demo-error.log

# MySQL error logs
sudo tail -f /var/log/mysql/error.log

# Clear PM2 logs
pm2 flush
```

### Restart Services

```bash
# Restart backend
pm2 restart salon-pos-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart MySQL
sudo systemctl restart mysql

# Restart all services
pm2 restart salon-pos-backend
sudo systemctl restart nginx
sudo systemctl restart mysql
```

### Monitor Application

```bash
# Real-time monitoring
pm2 monit

# Show process details
pm2 show salon-pos-backend

# Check resource usage
pm2 describe salon-pos-backend
```

---

## 💾 Database Backup and Restoration

### Manual Database Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
mysqldump -u salon_user -p salon_pos > ~/backups/salon_pos_$(date +%Y%m%d_%H%M%S).sql

# Backup with gzip compression (saves space)
mysqldump -u salon_user -p salon_pos | gzip > ~/backups/salon_pos_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Automated Daily Backup Script

```bash
# Create backup script
nano ~/backup-db.sh
```

```bash
#!/bin/bash

BACKUP_DIR=~/backups
DB_USER='salon_user'
DB_PASSWORD='Velou@123'
DB_NAME='salon_pos'

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup with timestamp
BACKUP_FILE="$BACKUP_DIR/salon_pos_$(date +%Y%m%d_%H%M%S).sql.gz"
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_FILE

# Log the backup
echo "$(date): Backup created: $BACKUP_FILE" >> $BACKUP_DIR/backup.log

# Keep only last 7 days of backups (delete older files)
find $BACKUP_DIR -name "salon_pos_*.sql.gz" -mtime +7 -delete

# Send summary to log
echo "$(date): Cleanup completed. Old backups removed." >> $BACKUP_DIR/backup.log
```

Make it executable:

```bash
chmod +x ~/backup-db.sh
```

Schedule daily backup at 2 AM:

```bash
# Open crontab editor
crontab -e

# Add this line (runs daily at 2:00 AM):
0 2 * * * /home/username/backup-db.sh

# Save and exit (Ctrl+X for nano, then Y, then Enter)
```

### Restore from Backup

```bash
# Restore from uncompressed backup
mysql -u salon_user -p salon_pos < ~/backups/salon_pos_20260329_020000.sql

# Restore from compressed backup
gunzip < ~/backups/salon_pos_20260329_020000.sql.gz | mysql -u salon_user -p salon_pos

# List available backups
ls -lh ~/backups/salon_pos_*.sql*
```

---

## 📊 Monitoring and Logging Setup

### PM2 Logging Configuration

```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Enable PM2 Web Dashboard

```bash
# Install PM2 web interface (optional)
pm2 install pm2-web

# Access dashboard at: http://your_vps_ip:9615
# From VPS: http://localhost:9615
```

### Check Logs via PM2

```bash
# View all logs
pm2 logs

# Follow backend logs
pm2 logs salon-pos-backend --lines 20 --follow

# Clear logs
pm2 flush

# Pause logs
pm2 logs pause
```

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check logs for errors
pm2 logs salon-pos-backend

# Common issues:

# 1. Port 3007 already in use
sudo lsof -i :3007
sudo kill -9 <PID>

# 2. Database connection failed
# Check .env file
cat /var/www/salon-pos/.env

# Test database connection
mysql -u salon_user -p salon_pos -e "SELECT 1;"

# 3. Node modules not installed
cd /var/www/salon-pos
npm install --production

# 4. Restart backend
pm2 restart salon-pos-backend
```

### Frontend Not Loading

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/salon-demo-error.log

# Verify frontend files exist
ls -la /var/www/salon-demo/frontend

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 502 Bad Gateway Error

This means Nginx cannot reach the backend API (port 3007).

```bash
# Check if backend is running
pm2 status

# Check if backend is listening on port 3007
sudo netstat -tlnp | grep 3007

# Check PM2 logs
pm2 logs salon-pos-backend

# Restart backend
pm2 stop salon-pos-backend
pm2 start server.js --name salon-pos-backend

# Test backend directly
curl http://localhost:3007/api/health
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u salon_user -p salon_pos -e "SELECT 1;"

# Check MySQL is running
sudo systemctl status mysql

# Check MySQL error log
sudo tail -f /var/log/mysql/error.log

# Restart MySQL
sudo systemctl restart mysql

# Verify .env credentials
cat /var/www/salon-pos/.env | grep DB_
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test renewal (dry-run)
sudo certbot renew --dry-run

# Renew certificate immediately
sudo certbot renew

# Check Nginx after SSL setup
sudo nginx -t
sudo systemctl restart nginx
```

### Permissions Issues

```bash
# Fix frontend permissions
sudo chown -R www-data:www-data /var/www/salon-demo/frontend
sudo chmod -R 755 /var/www/salon-demo/frontend

# Fix backend permissions
sudo chown -R $USER:$USER /var/www/salon-pos
sudo chmod -R 755 /var/www/salon-pos

# Fix logs permissions
sudo chown -R www-data:www-data /var/log/nginx
```

---

## 📚 Additional Resources

- [Hostinger VPS Documentation](https://www.hostinger.com/tutorials/vps)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/getting-started/)
- [Express.js Documentation](https://expressjs.com/)
- [Vue.js Documentation](https://vuejs.org/)

---

## 📞 Support & Troubleshooting Tips

If you encounter issues:

1. **Check logs first** — most issues appear in logs

   ```bash
   pm2 logs salon-pos-backend
   sudo tail -f /var/log/nginx/salon-demo-error.log
   ```

2. **Verify all services are running**

   ```bash
   pm2 status
   sudo systemctl status nginx
   sudo systemctl status mysql
   ```

3. **Check firewall settings**

   ```bash
   sudo ufw status
   ```

4. **Review configuration files**

   ```bash
   cat /var/www/salon-pos/.env  # Backend config
   ls -la /var/www/salon-demo/frontend  # Frontend files
   ```

5. **Restart services in order**
   ```bash
   sudo systemctl restart mysql
   pm2 restart salon-pos-backend
   sudo systemctl restart nginx
   ```

---

## 🎉 Congratulations!

Your Salon POS System is now live on Hostinger VPS!

**Access your application at:**

- 🌐 **Frontend:** https://salon-demo.lumicore-labs.com
- 🔌 **Backend API:** https://salon-demo.lumicore-labs.com/api
- 📊 **Health Check:** https://salon-demo.lumicore-labs.com/api/health

**Useful Links:**

- 📱 **Repository:** https://github.com/MG4ACA/saloon-system.git
- 🔐 **SSL Certificate:** Auto-renewed by Certbot
- 📈 **Logs:** `pm2 logs` and `/var/log/nginx/`

**Make sure to:**

- ✅ Set up automated backups
- ✅ Monitor system resources regularly
- ✅ Keep dependencies updated
- ✅ Review logs periodically
- ✅ Test deployments before going live

Happy salon managing! 🎉

**Default Login (if using seed data):**

- Username: `admin`
- Password: Check your seed file

---

## 📝 Post-Deployment Checklist

- [ ] Backend is running via PM2
- [ ] Database is created and seeded
- [ ] Frontend is built and served by Nginx
- [ ] API endpoints are accessible
- [ ] Application login works
- [ ] SSL certificate is installed (if using domain)
- [ ] Firewall is configured
- [ ] Backups are automated
- [ ] Monitoring is set up
- [ ] Deployment script is ready

---

**Last Updated:** December 2024  
**Version:** 1.0.0
