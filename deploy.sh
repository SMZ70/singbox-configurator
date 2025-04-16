#!/bin/bash

# Exit on error
set -e

# Configuration
APP_NAME="singbox_generator"
NODE_VERSION="18"  # Specify your Node.js version
DEPLOY_DIR="/var/www/singbox_generator"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting deployment of ${APP_NAME}...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Installing Node.js ${NODE_VERSION}...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build the application
echo -e "${YELLOW}Building application...${NC}"
npm run build

# Copy files to deployment directory
echo -e "${YELLOW}Copying files to deployment directory...${NC}"
sudo mkdir -p ${DEPLOY_DIR}
sudo cp -r dist/* ${DEPLOY_DIR}/
sudo chown -R www-data:www-data ${DEPLOY_DIR}

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    sudo npm install -g pm2
fi

# Start application with PM2
echo -e "${YELLOW}Starting application with PM2...${NC}"
cd ${DEPLOY_DIR}
pm2 start serve --name "${APP_NAME}" -- -s . -p 3000
pm2 save

# Configure Nginx if installed
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Configuring Nginx...${NC}"
    cat > /etc/nginx/sites-available/${APP_NAME} << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Application is running at http://localhost:3000${NC}"
echo -e "${YELLOW}To check application status: pm2 status${NC}"
echo -e "${YELLOW}To view application logs: pm2 logs ${APP_NAME}${NC}" 