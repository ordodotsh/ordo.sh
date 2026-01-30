# Ordo.sh - Cloud Moltbot Environment with Full Desktop GUI
# Moltbot - https://moltbot.ai / https://docs.moltbot.ai
# Container: ghcr.io/ordodotsh/ordo-bot
#
# Features:
#   - Full desktop environment (based on KasmWeb)
#   - Browser-based remote desktop (port 6901)
#   - Web terminal via ttyd (port 7681)
#   - All development tools and CLIs
#
FROM kasmweb/desktop:1.16.1

USER root

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js 22.x
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Add GitHub CLI repository
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core tools
    git \
    git-lfs \
    curl \
    wget \
    jq \
    openssh-client \
    # Terminal multiplexer & tools
    tmux \
    screen \
    # Media processing
    ffmpeg \
    imagemagick \
    # Audio tools
    sox \
    libsox-fmt-all \
    opus-tools \
    # Python
    python3 \
    python3-pip \
    python3-venv \
    python3-numpy \
    python3-requests \
    python3-yaml \
    python3-bs4 \
    # Development tools
    build-essential \
    g++ \
    gcc \
    make \
    # File utilities
    zip \
    unzip \
    p7zip-full \
    rsync \
    # Process management
    htop \
    # Network tools
    dnsutils \
    netcat-openbsd \
    socat \
    openssl \
    iputils-ping \
    net-tools \
    # GitHub CLI (from github-cli repo)
    gh \
    # Database clients
    sqlite3 \
    postgresql-client \
    mariadb-client \
    # Additional dev tools
    ripgrep \
    fd-find \
    tree \
    fzf \
    bat \
    && rm -rf /var/lib/apt/lists/*

# Install yq (not in Debian repos by default)
RUN wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && \
    chmod +x /usr/local/bin/yq

# Install ttyd (web terminal)
RUN wget -qO /usr/local/bin/ttyd https://github.com/tsl0922/ttyd/releases/latest/download/ttyd.x86_64 && \
    chmod +x /usr/local/bin/ttyd

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
RUN pip3 install --no-cache-dir \
    telethon \
    httpx \
    aiohttp \
    yt-dlp \
    openai \
    anthropic \
    schedule \
    rich \
    tqdm

# Initialize git-lfs
RUN git lfs install --system

# Create workspace directories for kasm-user
RUN mkdir -p /home/kasm-user/workspace /home/kasm-user/.ssh /home/kasm-user/.config /home/kasm-user/.moltbot /home/kasm-user/ordo && \
    chown -R 1000:1000 /home/kasm-user

# Configure bash with useful defaults for kasm-user
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
# Moltbot aliases\n\
alias ordo="moltbot"\n\
alias molt="moltbot"\n\
\n\
# Welcome message (only show once per session)\n\
if [ -z "$ORDO_WELCOMED" ]; then\n\
  export ORDO_WELCOMED=1\n\
  echo ""\n\
  echo "  ░█▀█░█▀▄░█▀▄░█▀█"\n\
  echo "  ░█░█░█▀▄░█░█░█░█"\n\
  echo "  ░▀▀▀░▀░▀░▀▀░░▀▀▀"\n\
  echo ""\n\
  echo "  Welcome to Ordo"\n\
  echo "  Your AI Desktop in the Cloud"\n\
  echo ""\n\
  echo "  Commands:"\n\
  echo "    moltbot status   - Check bot status"\n\
  echo "    moltbot doctor   - Diagnose issues"\n\
  echo "    moltbot --help   - All commands"\n\
  echo ""\n\
fi\n\
' >> /home/kasm-user/.bashrc && chown 1000:1000 /home/kasm-user/.bashrc

# Create desktop shortcuts
RUN mkdir -p /home/kasm-user/Desktop && \
    echo '[Desktop Entry]\n\
Version=1.0\n\
Type=Application\n\
Name=Moltbot Terminal\n\
Comment=AI Assistant\n\
Exec=xfce4-terminal -e "bash -l"\n\
Icon=utilities-terminal\n\
Terminal=false\n\
Categories=Development;' > /home/kasm-user/Desktop/moltbot.desktop && \
    chmod +x /home/kasm-user/Desktop/moltbot.desktop && \
    chown 1000:1000 /home/kasm-user/Desktop/moltbot.desktop

# Copy startup script for moltbot auto-config
COPY docker/startup-moltbot.sh /dockerstartup/startup-moltbot.sh
RUN chmod +x /dockerstartup/startup-moltbot.sh

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

# Browser configuration for moltbot
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMIUM_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CHROMIUM_FLAGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"

# Expose ports:
#   6901 = KasmVNC web interface (GUI desktop)
#   7681 = ttyd terminal
#   18789 = moltbot gateway
EXPOSE 6901 7681 18789

# Use KasmWeb's default entrypoint
# The desktop will start automatically via KasmWeb's startup
