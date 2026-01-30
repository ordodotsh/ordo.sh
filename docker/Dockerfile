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
    btop \
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
    redis-tools \
    # Additional dev tools
    ripgrep \
    fd-find \
    tree \
    fzf \
    bat \
    eza \
    zoxide \
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
# BUN (Fast JavaScript runtime & package manager)
# ============================================================================
RUN curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin/ && \
    ln -sf /usr/local/bin/bun /usr/local/bin/bunx

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
# UV (Modern Python package manager - replaces pip, faster than pip)
# ============================================================================
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    mv /root/.local/bin/uv /usr/local/bin/ && \
    mv /root/.local/bin/uvx /usr/local/bin/ || true

# ============================================================================
# GITHUB CLI
# ============================================================================
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
    apt-get update && apt-get install -y gh && \
    rm -rf /var/lib/apt/lists/*

# ============================================================================
# DOCKER CLI (for building containers from within)
# ============================================================================
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && apt-get install -y docker-ce-cli docker-compose-plugin && \
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

# lazydocker - Terminal UI for docker
RUN curl -Lo /tmp/lazydocker.tar.gz "https://github.com/jesseduffield/lazydocker/releases/latest/download/lazydocker_0.24.1_Linux_x86_64.tar.gz" && \
    tar xf /tmp/lazydocker.tar.gz -C /usr/local/bin lazydocker && \
    rm /tmp/lazydocker.tar.gz

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
    # Package managers
    pnpm@latest \
    yarn@latest \
    # AI Tools
    moltbot@latest \
    @anthropic-ai/claude-code@latest \
    # Frameworks & deployment
    vercel@latest \
    netlify-cli@latest \
    wrangler@latest \
    firebase-tools@latest \
    @railway/cli@latest \
    # TypeScript
    typescript@latest \
    ts-node@latest \
    tsx@latest \
    # Code quality
    eslint@latest \
    prettier@latest \
    biome@latest \
    # Process management
    pm2@latest \
    nodemon@latest \
    # Static file serving
    serve@latest \
    http-server@latest \
    # Tunneling
    localtunnel@latest \
    # Build tools
    turbo@latest \
    vite@latest \
    esbuild@latest \
    # Testing
    vitest@latest \
    playwright@latest \
    # Utilities
    npm-check-updates@latest \
    depcheck@latest \
    httpyac@latest \
    undici@latest

# ============================================================================
# PYTHON AI TOOLS (using uv for speed)
# ============================================================================
RUN uv pip install --system \
    # AI Coding Assistants
    aider-chat \
    open-interpreter \
    # Browser Automation
    browser-use \
    playwright \
    # LLM Libraries
    anthropic \
    openai \
    litellm \
    langchain \
    langchain-anthropic \
    langchain-openai \
    # Data & utilities
    pandas \
    numpy \
    requests \
    httpx \
    beautifulsoup4 \
    pyyaml \
    python-dotenv \
    rich \
    typer \
    # Jupyter
    jupyterlab \
    ipython

# Install Playwright browsers for Python
RUN playwright install chromium firefox

# ============================================================================
# OH-MY-ZSH (better shell experience)
# ============================================================================
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended && \
    mv /root/.oh-my-zsh /etc/skel/.oh-my-zsh && \
    mv /root/.zshrc /etc/skel/.zshrc || true

# ============================================================================
# STARSHIP PROMPT (modern cross-shell prompt)
# ============================================================================
RUN curl -sS https://starship.rs/install.sh | sh -s -- -y

# ============================================================================
# USER SETUP
# ============================================================================
# Create workspace directories for kasm-user
RUN mkdir -p /home/kasm-user/workspace /home/kasm-user/.ssh /home/kasm-user/.config /home/kasm-user/.moltbot /home/kasm-user/ordo && \
    chown -R 1000:1000 /home/kasm-user

# Initialize git-lfs
RUN git lfs install --system

# Configure bash with useful defaults for kasm-user
RUN cat >> /home/kasm-user/.bashrc << 'BASHRC'

# Ordo.sh bash config
export PS1="\[\033[1;32m\]ordo\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ "

# Modern CLI aliases
alias ll="eza -la --icons --git"
alias la="eza -a --icons"
alias l="eza --icons"
alias lt="eza --tree --icons -L 2"
alias cat="batcat --paging=never 2>/dev/null || bat --paging=never 2>/dev/null || cat"
alias fd="fdfind"
alias vim="nvim"
alias vi="nvim"

# Navigation
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."

# Git shortcuts
alias gs="git status"
alias gd="git diff"
alias gl="git log --oneline -20"
alias gp="git pull"
alias gc="git commit"
alias ga="git add"
alias lg="lazygit"

# Node shortcuts
alias ni="npm install"
alias nr="npm run"
alias pi="pnpm install"
alias pr="pnpm run"
alias bi="bun install"
alias br="bun run"

# Python shortcuts
alias py="python3"
alias pip="uv pip"
alias venv="uv venv"

# AI tool aliases
alias ordo="moltbot"
alias molt="moltbot"
alias claude="claude-code"
alias ai="open-interpreter"
alias aider="aider"

# Starship prompt
eval "$(starship init bash)"

# Zoxide (smarter cd)
eval "$(zoxide init bash)"

# Welcome message (only show once per session)
if [ -z "$ORDO_WELCOMED" ]; then
  export ORDO_WELCOMED=1
  echo ""
  echo "  ░█▀█░█▀▄░█▀▄░█▀█"
  echo "  ░█░█░█▀▄░█░█░█░█"
  echo "  ░▀▀▀░▀░▀░▀▀░░▀▀▀"
  echo ""
  echo "  Welcome to Ordo"
  echo "  Your AI Desktop in the Cloud"
  echo ""
  echo "  Runtimes: Node $(node -v) | Python $(python3 --version | cut -d' ' -f2) | Bun $(bun -v) | Go $(go version | cut -d' ' -f3)"
  echo ""
  echo "  AI Tools:"
  echo "    moltbot    - AI assistant gateway"
  echo "    claude     - Claude Code CLI"
  echo "    aider      - AI pair programming"
  echo "    ai         - Open Interpreter"
  echo ""
  echo "  Commands:"
  echo "    moltbot status   - Check bot status"
  echo "    moltbot doctor   - Diagnose issues"
  echo "    moltbot --help   - All commands"
  echo ""
fi
BASHRC

RUN chown 1000:1000 /home/kasm-user/.bashrc

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

# ============================================================================
# ENVIRONMENT VARIABLES
# ============================================================================
# Set at runtime by Ordo.sh
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
ENV CHROMIUM_FLAGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"

# Go path
ENV GOPATH=/home/kasm-user/go
ENV PATH=$GOPATH/bin:/usr/local/go/bin:$PATH

# Expose ports:
#   6901 = KasmVNC web interface (GUI desktop)
#   7681 = ttyd terminal
#   18789 = moltbot gateway
EXPOSE 6901 7681 18789

# Use KasmWeb's default entrypoint
# The desktop will start automatically via KasmWeb's startup
