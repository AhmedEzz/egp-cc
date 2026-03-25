#!/bin/bash
# =============================================================
# CardCompare Egypt - EC2 Free Tier Deployment Script
# Run this on a fresh Amazon Linux 2023 EC2 instance (t2.micro)
# =============================================================

set -e

echo "=== CardCompare Egypt - EC2 Setup ==="

# 1. Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git nginx

# 2. Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# 3. Clone or copy the app
APP_DIR="/home/ec2-user/app"
if [ -d "$APP_DIR" ]; then
  echo "App directory exists, pulling latest..."
  cd "$APP_DIR"
  git pull origin main 2>/dev/null || true
else
  echo "Setting up app directory..."
  mkdir -p "$APP_DIR"
  echo "Copy your project files to $APP_DIR"
  echo "Or: git clone <your-repo-url> $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

# 4. Install dependencies
echo "Installing dependencies..."
npm install --production=false

# 5. Seed the database
echo "Seeding database..."
mkdir -p data
npx tsx src/lib/db/seed.ts

# 6. Build the app
echo "Building Next.js app..."
npm run build

# 7. Setup Nginx
echo "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/conf.d/cardcompare.conf
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# 8. Start with PM2
echo "Starting app with PM2..."
pm2 stop cardcompare 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

echo ""
echo "=== Deployment Complete! ==="
echo "Your app is running at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '<your-ec2-public-ip>')"
echo ""
echo "Useful commands:"
echo "  pm2 logs cardcompare    - View app logs"
echo "  pm2 restart cardcompare - Restart the app"
echo "  pm2 status              - Check app status"
