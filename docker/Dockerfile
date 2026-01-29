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
    git-lfs \
    curl \
    wget \
    bash \
    bash-completion \
    jq \
    yq \
    openssh-client \
    openssh-keygen \
    su-exec \
    sudo \
    # Terminal multiplexer & tools
    tmux \
    screen \
    less \
    # Web terminal
    ttyd \
    # Browser automation
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto \
    font-noto-emoji \
    # Media processing
    ffmpeg \
    imagemagick \
    # Audio tools (for voice features)
    sox \
    opus-tools \
    # Virtual display for headless browser
    xvfb \
    dbus \
    # Python
    python3 \
    py3-pip \
    py3-numpy \
    py3-requests \
    py3-yaml \
    py3-beautifulsoup4 \
    # Text editors
    vim \
    nano \
    # Development tools
    make \
    g++ \
    gcc \
    libc-dev \
    linux-headers \
    # File utilities
    zip \
    unzip \
    tar \
    gzip \
    bzip2 \
    xz \
    p7zip \
    rsync \
    # Process management
    htop \
    procps \
    # Network tools
    bind-tools \
    netcat-openbsd \
    socat \
    openssl \
    # Network diagnostics
    mtr \
    traceroute \
    whois \
    # GitHub CLI for repo management
    github-cli \
    # Database clients
    sqlite \
    postgresql-client \
    redis \
    mariadb-client \
    # Additional dev tools
    ripgrep \
    fd \
    tree \
    fzf \
    bat \
    # Security & encryption
    gnupg \
    # Timezone data
    tzdata \
    # Cron for scheduled tasks
    dcron \
    # AWS CLI
    aws-cli

# Install npm packages (pnpm recommended by moltbot docs)
# Includes CLIs for autonomous deployment and project management
RUN npm install -g pnpm clawdbot@latest playwright \
    vercel \
    netlify-cli \
    wrangler \
    firebase-tools \
    @railway/cli \
    undici \
    clawdhub \
    # TypeScript support
    typescript \
    ts-node \
    tsx \
    # Code quality
    eslint \
    prettier \
    # Process management
    pm2 \
    nodemon \
    # Static file serving
    serve \
    http-server \
    # Tunneling for local dev
    localtunnel \
    # Task runners
    turbo \
    # Monorepo tools
    lerna \
    # API testing
    httpyac \
    # Package management
    npm-check-updates \
    depcheck

# Install Python packages
RUN pip3 install --break-system-packages \
    telethon \
    # HTTP clients
    httpx \
    aiohttp \
    # Web scraping
    lxml \
    playwright \
    # Data processing
    pandas \
    # CLI tools
    yt-dlp \
    # AI/ML integrations
    openai \
    anthropic \
    # Task automation
    schedule \
    # Rich terminal output
    rich \
    # Progress bars
    tqdm

# Use the existing 'node' user (UID 1000) from the base image
# Create workspace directories
RUN mkdir -p /home/node/workspace /home/node/.ssh /home/node/.config /home/node/.clawdbot /home/node/ordo && \
    chown -R node:node /home/node

# Allow node user to use sudo without password (for installing packages at runtime)
RUN echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers.d/node && \
    chmod 0440 /etc/sudoers.d/node

# Configure bash with useful defaults
RUN echo '\n\
# Ordo.sh bash config\n\
export PS1="\\[\\033[1;32m\\]ordo\\[\\033[0m\\]:\\[\\033[1;34m\\]\\w\\[\\033[0m\\]\\$ "\n\
alias ll="ls -la"\n\
alias la="ls -A"\n\
alias l="ls -CF"\n\
alias ..="cd .."\n\
alias ...="cd ../.."\n\
alias grep="grep --color=auto"\n\
alias cat="bat --paging=never 2>/dev/null || cat"\n\
alias df="df -h"\n\
alias du="du -h"\n\
alias free="free -h 2>/dev/null || true"\n\
# Git shortcuts\n\
alias gs="git status"\n\
alias gd="git diff"\n\
alias gl="git log --oneline -20"\n\
alias gp="git pull"\n\
# Node shortcuts\n\
alias ni="npm install"\n\
alias nr="npm run"\n\
alias pi="pnpm install"\n\
alias pr="pnpm run"\n\
# Enable bash completion\n\
[ -f /etc/bash/bash_completion.sh ] && source /etc/bash/bash_completion.sh\n\
' >> /home/node/.bashrc && chown node:node /home/node/.bashrc

# Initialize git-lfs
RUN git lfs install --system

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

# Additional API keys
ENV TRELLO_API_KEY=""
ENV TRELLO_TOKEN=""
ENV NOTION_API_KEY=""
ENV LINEAR_API_KEY=""
ENV JIRA_API_TOKEN=""
ENV AIRTABLE_API_KEY=""
ENV SENDGRID_API_KEY=""
ENV TWILIO_ACCOUNT_SID=""
ENV TWILIO_AUTH_TOKEN=""
ENV STRIPE_SECRET_KEY=""
ENV AWS_ACCESS_KEY_ID=""
ENV AWS_SECRET_ACCESS_KEY=""
ENV AWS_DEFAULT_REGION=""

# Git config (bot can override these or set up its own identity)
ENV GIT_AUTHOR_NAME=""
ENV GIT_AUTHOR_EMAIL=""
ENV GIT_COMMITTER_NAME=""
ENV GIT_COMMITTER_EMAIL=""

# Expose ports: 7681 = terminal, 18789 = moltbot gateway
EXPOSE 7681 18789

# Start with auto-config script
CMD ["/usr/local/bin/startup.sh"]
# Rebuilt 2026-01-29T02:50:00Z
