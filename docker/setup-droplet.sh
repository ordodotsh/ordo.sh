#!/bin/bash
# Ordo.sh - One-command setup for fresh Ubuntu VPS
# Run this on a fresh Ubuntu 22.04/24.04 droplet with root access
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/ordodotsh/ordo-bot/main/docker/setup-droplet.sh | bash
#
# Or with options:
#   curl -fsSL ... | bash -s -- --anthropic-key sk-ant-xxx --telegram-token xxx

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "  ░█▀█░█▀▄░█▀▄░█▀█"
echo "  ░█░█░█▀▄░█░█░█░█"
echo "  ░▀▀▀░▀░▀░▀▀░░▀▀▀"
echo -e "${NC}"
echo "  Ordo.sh - AI Desktop in the Cloud"
echo "  Setting up your server..."
echo ""

# Parse arguments
ANTHROPIC_KEY=""
TELEGRAM_TOKEN=""
DISCORD_TOKEN=""
VNC_PASSWORD="ordo"
DOMAIN=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --anthropic-key)
      ANTHROPIC_KEY="$2"
      shift 2
      ;;
    --telegram-token)
      TELEGRAM_TOKEN="$2"
      shift 2
      ;;
    --discord-token)
      DISCORD_TOKEN="$2"
      shift 2
      ;;
    --vnc-password)
      VNC_PASSWORD="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Check if running as root
if [ "$(id -u)" != "0" ]; then
  echo -e "${RED}Error: This script must be run as root${NC}"
  exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
  VERSION=$VERSION_ID
else
  echo -e "${RED}Error: Cannot detect OS${NC}"
  exit 1
fi

echo -e "${GREEN}Detected: $OS $VERSION${NC}"

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Installing Docker...${NC}"

  # Install prerequisites
  apt-get install -y -qq \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

  # Add Docker's official GPG key
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  # Set up repository
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  # Install Docker
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  # Start Docker
  systemctl enable docker
  systemctl start docker

  echo -e "${GREEN}Docker installed successfully${NC}"
else
  echo -e "${GREEN}Docker already installed${NC}"
fi

# Install useful tools
echo -e "${YELLOW}Installing useful tools...${NC}"
apt-get install -y -qq \
  htop \
  tmux \
  vim \
  curl \
  wget \
  git \
  ufw \
  fail2ban

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 6901/tcp comment 'Ordo Desktop GUI'
ufw allow 7681/tcp comment 'Ordo Web Terminal'
ufw allow 18789/tcp comment 'OpenClaw Gateway'
ufw --force enable

echo -e "${GREEN}Firewall configured${NC}"

# Configure fail2ban for basic protection
echo -e "${YELLOW}Configuring fail2ban...${NC}"
systemctl enable fail2ban
systemctl start fail2ban

# Create ordo directory
mkdir -p /opt/ordo
cd /opt/ordo

# Create environment file
echo -e "${YELLOW}Creating configuration...${NC}"
cat > /opt/ordo/.env << EOF
# Ordo.sh Configuration
# Edit this file to add your API keys and tokens

# VNC Password (for desktop access)
VNC_PASSWORD=${VNC_PASSWORD}

# Resolution (default 1920x1080)
VNC_RESOLUTION=1920x1080

# Auto-configure OpenClaw on startup
ORDO_AUTO_CONFIG=true

# AI Provider Keys (at least one required for OpenClaw)
ANTHROPIC_API_KEY=${ANTHROPIC_KEY}
OPENAI_API_KEY=
GEMINI_API_KEY=

# Messaging Channels (add tokens for channels you want to use)
TELEGRAM_TOKEN=${TELEGRAM_TOKEN}
DISCORD_TOKEN=${DISCORD_TOKEN}
SLACK_TOKEN=
WHATSAPP_TOKEN=

# Platform Tokens (for autonomous deployment capabilities)
GITHUB_TOKEN=
VERCEL_TOKEN=
NETLIFY_AUTH_TOKEN=
CLOUDFLARE_API_TOKEN=

# Web Search
BRAVE_API_KEY=

# Git Config (optional)
GIT_AUTHOR_NAME=
GIT_AUTHOR_EMAIL=
EOF

chmod 600 /opt/ordo/.env

# Create docker-compose.yml
cat > /opt/ordo/docker-compose.yml << 'EOF'
version: '3.8'

services:
  ordo:
    image: ghcr.io/ordodotsh/ordo-bot:latest
    container_name: ordo
    restart: unless-stopped
    ports:
      - "6901:6901"   # Desktop GUI (KasmVNC)
      - "7681:7681"   # Web Terminal (ttyd)
      - "18789:18789" # OpenClaw Gateway
    env_file:
      - .env
    volumes:
      # Persistent storage for your work
      - ordo-workspace:/home/kasm-user/ordo
      - ordo-config:/home/kasm-user/.openclaw
      - ordo-ssh:/home/kasm-user/.ssh
    shm_size: '2gb'  # Required for browser
    security_opt:
      - seccomp:unconfined  # Required for browser sandbox
    deploy:
      resources:
        limits:
          memory: 4G

volumes:
  ordo-workspace:
  ordo-config:
  ordo-ssh:
EOF

# Create systemd service for auto-start
echo -e "${YELLOW}Creating systemd service...${NC}"
cat > /etc/systemd/system/ordo.service << 'EOF'
[Unit]
Description=Ordo.sh - AI Desktop in the Cloud
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ordo
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ordo

# Pull the image
echo -e "${YELLOW}Pulling Ordo image (this may take a few minutes)...${NC}"
docker compose pull

# Start the container
echo -e "${YELLOW}Starting Ordo...${NC}"
docker compose up -d

# Wait for it to start
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Get the server's public IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "YOUR_SERVER_IP")

# Print success message
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Ordo.sh is ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  ${BLUE}Desktop GUI:${NC}  http://${PUBLIC_IP}:6901"
echo -e "  ${BLUE}Web Terminal:${NC} http://${PUBLIC_IP}:7681"
echo ""
echo -e "  ${YELLOW}VNC Password:${NC} ${VNC_PASSWORD}"
echo ""
echo -e "  ${BLUE}Useful commands:${NC}"
echo "    cd /opt/ordo"
echo "    docker compose logs -f      # View logs"
echo "    docker compose restart      # Restart"
echo "    docker compose pull && docker compose up -d  # Update"
echo "    vim .env                    # Edit configuration"
echo ""
echo -e "  ${BLUE}Configuration:${NC}"
echo "    Edit /opt/ordo/.env to add your API keys"
echo "    Then run: docker compose restart"
echo ""
if [ -z "$ANTHROPIC_KEY" ]; then
  echo -e "  ${YELLOW}Note:${NC} Add your ANTHROPIC_API_KEY to /opt/ordo/.env"
  echo "        to enable OpenClaw AI features"
  echo ""
fi
echo -e "${GREEN}Enjoy your AI Desktop in the Cloud!${NC}"
echo ""
