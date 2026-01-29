# Ordo.sh - Cloud Moltbot Environment
# Moltbot (formerly Clawdbot) - https://clawd.bot / https://docs.clawd.bot
# Container: ghcr.io/ordodotsh/ordo-bot
FROM node:22-alpine

WORKDIR /home/node

# Enable community repository for desktop packages (must match Alpine version in node:22-alpine)
RUN echo "https://dl-cdn.alpinelinux.org/alpine/v3.20/community" >> /etc/apk/repositories

# Install system dependencies including desktop environment
RUN apk add --no-cache \
    # Core tools
    git \
    curl \
    wget \
    bash \
    jq \
    openssh-client \
    su-exec \
    # Web terminal
    ttyd \
    # Browser automation
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    # Media processing
    ffmpeg \
    imagemagick \
    # Virtual display for headless browser
    xvfb \
    dbus \
    # Python
    python3 \
    py3-pip \
    py3-numpy \
    py3-requests \
    # Text editors
    vim \
    nano \
    # Development tools
    make \
    # File utilities
    zip \
    unzip \
    tar \
    # Process management
    htop \
    # Network tools
    bind-tools \
    netcat-openbsd \
    # GitHub CLI for repo management
    github-cli \
    # Database clients
    sqlite \
    postgresql-client \
    # Additional dev tools
    ripgrep \
    fd \
    tree

# Install npm packages (pnpm recommended by moltbot docs)
# Includes CLIs for autonomous deployment and project management
RUN npm install -g pnpm clawdbot@latest playwright \
    vercel \
    netlify-cli \
    wrangler \
    firebase-tools \
    @railway/cli

# Install Python packages
RUN pip3 install --break-system-packages telethon

# Use the existing 'node' user (UID 1000) from the base image
# Create workspace directories
RUN mkdir -p /home/node/workspace /home/node/.ssh /home/node/.config /home/node/.clawdbot /home/node/ordo && \
    chown -R node:node /home/node

# Copy startup script
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Run as root - startup script will handle permissions and switch to node user
USER root

# Set up bash as default shell
ENV SHELL=/bin/bash
ENV HOME=/home/node
ENV DISPLAY=:1

# Increase Node.js memory limit (should be ~75% of container memory)
ENV NODE_OPTIONS="--max-old-space-size=3072"

# Browser configuration for moltbot (use system Chromium)
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROMIUM_PATH=/usr/bin/chromium-browser
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Disable Chromium sandbox (required for Docker)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CHROMIUM_FLAGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"

# Environment variables (set at runtime by Ordo.sh)
ENV USER_WALLET=""
ENV ORDO_AUTO_CONFIG=""
ENV ANTHROPIC_API_KEY=""
ENV OPENAI_API_KEY=""
ENV GEMINI_API_KEY=""
ENV GOOGLE_API_KEY=""
ENV TELEGRAM_TOKEN=""
ENV TELEGRAM_API_ID=""
ENV TELEGRAM_API_HASH=""
ENV TELEGRAM_PHONE=""
ENV DISCORD_TOKEN=""
ENV SLACK_TOKEN=""
ENV WHATSAPP_TOKEN=""
ENV EMAIL_IMAP_HOST=""
ENV EMAIL_IMAP_USER=""
ENV EMAIL_IMAP_PASS=""
ENV EMAIL_SMTP_HOST=""

# Platform tokens (bot can create accounts and set these itself via browser)
ENV GITHUB_TOKEN=""
ENV VERCEL_TOKEN=""
ENV NETLIFY_AUTH_TOKEN=""
ENV CLOUDFLARE_API_TOKEN=""
ENV RAILWAY_TOKEN=""
ENV FIREBASE_TOKEN=""

# Web search (recommended by moltbot)
ENV BRAVE_API_KEY=""

# Git config (bot can override these or set up its own identity)
ENV GIT_AUTHOR_NAME=""
ENV GIT_AUTHOR_EMAIL=""
ENV GIT_COMMITTER_NAME=""
ENV GIT_COMMITTER_EMAIL=""

# Expose ports: 7681 = terminal, 18789 = moltbot gateway
EXPOSE 7681 18789

# Start with auto-config script
CMD ["/usr/local/bin/startup.sh"]
# Rebuilt 2026-01-27T22:05:42Z
