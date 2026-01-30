# Ordo.sh - Cloud Moltbot Environment with Full Desktop GUI
# Moltbot (formerly Clawdbot) - https://clawd.bot / https://docs.clawd.bot
# Container: ghcr.io/ordodotsh/ordo-bot
#
# Features:
#   - Full XFCE4 desktop environment
#   - KasmVNC for browser-based remote desktop (port 6901)
#   - Web terminal via ttyd (port 7681)
#   - All development tools and CLIs
#
FROM node:22-bookworm

WORKDIR /home/node

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core tools
    git \
    git-lfs \
    curl \
    wget \
    bash \
    bash-completion \
    jq \
    openssh-client \
    sudo \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    apt-transport-https \
    locales \
    # Terminal multiplexer & tools
    tmux \
    screen \
    less \
    # Desktop environment (XFCE4 - lightweight but full-featured)
    xfce4 \
    xfce4-terminal \
    xfce4-goodies \
    dbus-x11 \
    x11-xserver-utils \
    x11-utils \
    xdg-utils \
    # Fonts for GUI
    fonts-dejavu \
    fonts-liberation \
    fonts-noto \
    fonts-noto-color-emoji \
    fontconfig \
    # Browser
    chromium \
    chromium-sandbox \
    # Media processing
    ffmpeg \
    imagemagick \
    # Audio tools
    sox \
    libsox-fmt-all \
    opus-tools \
    pulseaudio \
    # Virtual display
    xvfb \
    # Python
    python3 \
    python3-pip \
    python3-venv \
    python3-numpy \
    python3-requests \
    python3-yaml \
    python3-bs4 \
    # Text editors
    vim \
    nano \
    # GUI text editor
    mousepad \
    # File manager
    thunar \
    # Development tools
    build-essential \
    g++ \
    gcc \
    make \
    # File utilities
    zip \
    unzip \
    tar \
    gzip \
    bzip2 \
    xz-utils \
    p7zip-full \
    rsync \
    # Process management
    htop \
    procps \
    # Network tools
    dnsutils \
    netcat-openbsd \
    socat \
    openssl \
    mtr \
    traceroute \
    whois \
    iputils-ping \
    net-tools \
    # GitHub CLI
    gh \
    # Database clients
    sqlite3 \
    postgresql-client \
    redis-tools \
    mariadb-client \
    # Additional dev tools
    ripgrep \
    fd-find \
    tree \
    fzf \
    bat \
    # Timezone data
    tzdata \
    # Cron for scheduled tasks
    cron \
    && rm -rf /var/lib/apt/lists/*

# Install yq (not in Debian repos by default)
RUN wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && \
    chmod +x /usr/local/bin/yq

# Install ttyd (web terminal)
RUN wget -qO /usr/local/bin/ttyd https://github.com/tsl0922/ttyd/releases/latest/download/ttyd.x86_64 && \
    chmod +x /usr/local/bin/ttyd

# Install KasmVNC (browser-based remote desktop)
# libdatetime-perl is required by vncserver script
RUN apt-get update && \
    apt-get install -y --no-install-recommends libdatetime-perl && \
    KASM_VERSION="1.3.2" && \
    wget -qO /tmp/kasmvnc.deb "https://github.com/kasmtech/KasmVNC/releases/download/v${KASM_VERSION}/kasmvncserver_bookworm_${KASM_VERSION}_amd64.deb" && \
    apt-get install -y --no-install-recommends /tmp/kasmvnc.deb && \
    rm -f /tmp/kasmvnc.deb && \
    rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2
RUN curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip" && \
    unzip -q /tmp/awscliv2.zip -d /tmp && \
    /tmp/aws/install && \
    rm -rf /tmp/aws /tmp/awscliv2.zip

# Install npm packages (pnpm recommended by moltbot docs)
RUN npm install -g pnpm moltbot@latest playwright \
    vercel \
    netlify-cli \
    wrangler \
    firebase-tools \
    @railway/cli \
    undici \
    molthub \
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
    httpx \
    aiohttp \
    yt-dlp \
    openai \
    anthropic \
    schedule \
    rich \
    tqdm

# Set up locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Create workspace directories for node user
RUN mkdir -p /home/node/workspace /home/node/.ssh /home/node/.config /home/node/.moltbot /home/node/ordo /home/node/Desktop && \
    chown -R node:node /home/node

# Allow node user to use sudo without password
RUN echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers.d/node && \
    chmod 0440 /etc/sudoers.d/node

# Configure KasmVNC for node user
RUN mkdir -p /home/node/.vnc && \
    echo "node:ordo" | chpasswd && \
    chown -R node:node /home/node/.vnc

# KasmVNC config is set via command-line args in startup.sh

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
alias cat="batcat --paging=never 2>/dev/null || cat"\n\
alias fd="fdfind"\n\
alias df="df -h"\n\
alias du="du -h"\n\
alias free="free -h"\n\
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
[ -f /etc/bash_completion ] && source /etc/bash_completion\n\
' >> /home/node/.bashrc && chown node:node /home/node/.bashrc

# Initialize git-lfs
RUN git lfs install --system

# Copy startup script
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Set environment
USER root
ENV SHELL=/bin/bash
ENV HOME=/home/node
ENV DISPLAY=:1
ENV VNC_RESOLUTION=1920x1080
ENV VNC_COL_DEPTH=24

# Increase Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=3072"

# Browser configuration for moltbot
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMIUM_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

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

# Platform tokens
ENV GITHUB_TOKEN=""
ENV VERCEL_TOKEN=""
ENV NETLIFY_AUTH_TOKEN=""
ENV CLOUDFLARE_API_TOKEN=""
ENV RAILWAY_TOKEN=""
ENV FIREBASE_TOKEN=""

# Web search
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

# Git config
ENV GIT_AUTHOR_NAME=""
ENV GIT_AUTHOR_EMAIL=""
ENV GIT_COMMITTER_NAME=""
ENV GIT_COMMITTER_EMAIL=""

# VNC password (can be overridden at runtime, must be 6+ characters for KasmVNC)
ENV VNC_PASSWORD="ordodesktop"

# Expose ports:
#   6901 = KasmVNC web interface (GUI desktop)
#   7681 = ttyd terminal
#   18789 = moltbot gateway
EXPOSE 6901 7681 18789

# Start with auto-config script
CMD ["/usr/local/bin/startup.sh"]
