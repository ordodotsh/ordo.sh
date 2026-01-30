# Ordo.sh - Cloud AI Desktop Environment
# Full GUI desktop with latest tools for AI-powered development
# Container: ghcr.io/ordodotsh/ordo-bot
#
# Features:
#   - Full desktop environment (KasmWeb 1.17.0)
#   - Browser-based remote desktop (port 6901)
#   - Web terminal via ttyd (port 7681)
#   - Latest Node.js, Python, Bun, Go, Rust
#   - All modern AI coding tools pre-installed
#
FROM kasmweb/desktop:1.17.0

USER root

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# ============================================================================
# SYSTEM PACKAGES (latest from repos)
# ============================================================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core tools
    git \
    git-lfs \
    curl \
    wget \
    jq \
    openssh-client \
    ca-certificates \
    gnupg \
    lsb-release \
    # Terminal multiplexer & tools
    tmux \
    screen \
    zsh \
    # Media processing
    ffmpeg \
    imagemagick \
    # Audio tools
    sox \
    libsox-fmt-all \
    opus-tools \
    # Python build dependencies
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    python3-setuptools \
    # Development tools
    build-essential \
    g++ \
    gcc \
    make \
    cmake \
    pkg-config \
    libssl-dev \
    libffi-dev \
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
    # Editors
    neovim \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# NODE.JS (Latest LTS via NodeSource)
# ============================================================================
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    rm -rf /var/lib/apt/lists/*

# ============================================================================
# GO (Latest stable)
# ============================================================================
RUN curl -fsSL https://go.dev/dl/go1.23.5.linux-amd64.tar.gz | tar -C /usr/local -xzf - && \
    ln -sf /usr/local/go/bin/go /usr/local/bin/go && \
    ln -sf /usr/local/go/bin/gofmt /usr/local/bin/gofmt

# ============================================================================
# RUST (Latest stable via rustup)
# ============================================================================
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal && \
    chmod -R a+w $RUSTUP_HOME $CARGO_HOME

# ============================================================================
# GITHUB CLI
# ============================================================================
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
    apt-get update && apt-get install -y gh && \
    rm -rf /var/lib/apt/lists/*

# ============================================================================
# CLI TOOLS (latest releases)
# ============================================================================
# yq - YAML/JSON processor
RUN wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && \
    chmod +x /usr/local/bin/yq

# ttyd - Web terminal
RUN wget -qO /usr/local/bin/ttyd https://github.com/tsl0922/ttyd/releases/latest/download/ttyd.x86_64 && \
    chmod +x /usr/local/bin/ttyd

# lazygit - Terminal UI for git
RUN LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": "v\K[^"]*') && \
    curl -Lo /tmp/lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz" && \
    tar xf /tmp/lazygit.tar.gz -C /usr/local/bin lazygit && \
    rm /tmp/lazygit.tar.gz

# AWS CLI v2
RUN curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip" && \
    unzip -q /tmp/awscliv2.zip -d /tmp && \
    /tmp/aws/install && \
    rm -rf /tmp/aws /tmp/awscliv2.zip

# ============================================================================
# NODE.JS GLOBAL PACKAGES (latest versions)
# ============================================================================
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

RUN npm install -g \
    pnpm@latest \
    yarn@latest \
    openclaw@latest \
    vercel@latest \
    netlify-cli@latest \
    wrangler@latest \
    firebase-tools@latest \
    @railway/cli@latest \
    typescript@latest \
    ts-node@latest \
    tsx@latest \
    eslint@latest \
    prettier@latest \
    pm2@latest \
    nodemon@latest \
    serve@latest \
    http-server@latest \
    localtunnel@latest \
    turbo@latest \
    vite@latest \
    esbuild@latest \
    vitest@latest \
    playwright@latest \
    npm-check-updates@latest \
    depcheck@latest \
    httpyac@latest \
    undici@latest

# ============================================================================
# UV (Modern Python package manager - 10-100x faster than pip)
# ============================================================================
RUN curl -LsSf https://github.com/astral-sh/uv/releases/latest/download/uv-x86_64-unknown-linux-gnu.tar.gz | tar -xz -C /usr/local/bin --strip-components=1

# ============================================================================
# PYTHON AI TOOLS
# ============================================================================
RUN uv pip install --system --no-cache \
    aider-chat \
    open-interpreter \
    browser-use \
    playwright \
    anthropic \
    openai \
    litellm \
    langchain \
    langchain-anthropic \
    langchain-openai \
    pandas \
    numpy \
    requests \
    httpx \
    beautifulsoup4 \
    pyyaml \
    python-dotenv \
    rich \
    typer \
    jupyterlab \
    ipython

# Install Playwright browsers for Python
RUN playwright install chromium firefox

# ============================================================================
# STARSHIP PROMPT (modern cross-shell prompt)
# ============================================================================
RUN curl -sS https://starship.rs/install.sh | sh -s -- -y

# ============================================================================
# USER SETUP
# ============================================================================
# Create workspace directories for kasm-user
RUN mkdir -p /home/kasm-user/workspace /home/kasm-user/.ssh /home/kasm-user/.config /home/kasm-user/.openclaw /home/kasm-user/ordo && \
    chown -R 1000:1000 /home/kasm-user

# Initialize git-lfs
RUN git lfs install --system

# Copy bashrc configuration
COPY docker/bashrc-ordo.sh /tmp/bashrc-ordo.sh
RUN cat /tmp/bashrc-ordo.sh >> /home/kasm-user/.bashrc && \
    chown 1000:1000 /home/kasm-user/.bashrc && \
    rm /tmp/bashrc-ordo.sh

# Create desktop shortcuts
RUN mkdir -p /home/kasm-user/Desktop && \
    printf '[Desktop Entry]\nVersion=1.0\nType=Application\nName=Ordo Terminal\nComment=AI Assistant\nExec=xfce4-terminal -e "bash -l"\nIcon=utilities-terminal\nTerminal=false\nCategories=Development;\n' > /home/kasm-user/Desktop/ordo.desktop && \
    chmod +x /home/kasm-user/Desktop/ordo.desktop && \
    chown 1000:1000 /home/kasm-user/Desktop/ordo.desktop

# Copy startup script for OpenClaw auto-config
COPY docker/startup.sh /dockerstartup/startup.sh
RUN chmod +x /dockerstartup/startup.sh

# ============================================================================
# ENVIRONMENT VARIABLES
# ============================================================================
ENV USER_WALLET="" \
    ORDO_AUTO_CONFIG="" \
    ANTHROPIC_API_KEY="" \
    OPENAI_API_KEY="" \
    GEMINI_API_KEY="" \
    GOOGLE_API_KEY="" \
    TELEGRAM_TOKEN="" \
    TELEGRAM_API_ID="" \
    TELEGRAM_API_HASH="" \
    TELEGRAM_PHONE="" \
    DISCORD_TOKEN="" \
    SLACK_TOKEN="" \
    WHATSAPP_TOKEN="" \
    EMAIL_IMAP_HOST="" \
    EMAIL_IMAP_USER="" \
    EMAIL_IMAP_PASS="" \
    EMAIL_SMTP_HOST="" \
    GITHUB_TOKEN="" \
    VERCEL_TOKEN="" \
    NETLIFY_AUTH_TOKEN="" \
    CLOUDFLARE_API_TOKEN="" \
    RAILWAY_TOKEN="" \
    FIREBASE_TOKEN="" \
    BRAVE_API_KEY="" \
    TRELLO_API_KEY="" \
    TRELLO_TOKEN="" \
    NOTION_API_KEY="" \
    LINEAR_API_KEY="" \
    JIRA_API_TOKEN="" \
    AIRTABLE_API_KEY="" \
    SENDGRID_API_KEY="" \
    TWILIO_ACCOUNT_SID="" \
    TWILIO_AUTH_TOKEN="" \
    STRIPE_SECRET_KEY="" \
    AWS_ACCESS_KEY_ID="" \
    AWS_SECRET_ACCESS_KEY="" \
    AWS_DEFAULT_REGION="" \
    GIT_AUTHOR_NAME="" \
    GIT_AUTHOR_EMAIL="" \
    GIT_COMMITTER_NAME="" \
    GIT_COMMITTER_EMAIL=""

# Browser configuration for OpenClaw
ENV CHROME_BIN=/usr/bin/chromium \
    CHROMIUM_PATH=/usr/bin/chromium \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
    CHROMIUM_FLAGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"

# Go path
ENV GOPATH=/home/kasm-user/go \
    PATH=$GOPATH/bin:/usr/local/go/bin:$PATH

# Expose ports:
#   6901 = KasmVNC web interface (GUI desktop)
#   7681 = ttyd terminal
#   18789 = OpenClaw gateway
EXPOSE 6901 7681 18789

# Use KasmWeb's default entrypoint
