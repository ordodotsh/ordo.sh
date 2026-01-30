# Ordo.sh - Cloud AI Desktop Environment
# Simple Ubuntu + XFCE + noVNC
# Container: ghcr.io/ordodotsh/ordo-bot
#
# Ports:
#   6080 = noVNC web interface (browser-based desktop)
#   7681 = ttyd web terminal
#   18789 = OpenClaw gateway
#
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV USER=ordo
ENV HOME=/home/ordo

# ============================================================================
# SYSTEM PACKAGES
# ============================================================================
RUN apt-get update && apt-get install -y \
    # Desktop environment
    xfce4 \
    xfce4-terminal \
    dbus-x11 \
    # VNC + noVNC
    tigervnc-standalone-server \
    tigervnc-common \
    novnc \
    websockify \
    # Browser
    chromium-browser \
    # Core tools
    sudo \
    git \
    git-lfs \
    curl \
    wget \
    jq \
    openssh-client \
    ca-certificates \
    gnupg \
    # Terminal tools
    tmux \
    htop \
    neovim \
    # Media
    ffmpeg \
    imagemagick \
    # Python
    python3 \
    python3-pip \
    python3-venv \
    # Build tools
    build-essential \
    # File utilities
    zip \
    unzip \
    rsync \
    # Network tools
    dnsutils \
    netcat-openbsd \
    socat \
    # Database clients
    sqlite3 \
    # Dev tools
    ripgrep \
    fd-find \
    tree \
    fzf \
    bat \
    # Fonts and locale
    fonts-noto-mono \
    fonts-dejavu-core \
    locales \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# LOCALE SETUP
# ============================================================================
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

# ============================================================================
# NODE.JS 22
# ============================================================================
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    rm -rf /var/lib/apt/lists/*

# ============================================================================
# GITHUB CLI
# ============================================================================
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
    apt-get update && apt-get install -y gh && \
    rm -rf /var/lib/apt/lists/*

# ============================================================================
# CLI TOOLS
# ============================================================================
# ttyd (web terminal)
RUN wget -qO /usr/local/bin/ttyd https://github.com/tsl0922/ttyd/releases/latest/download/ttyd.x86_64 && \
    chmod +x /usr/local/bin/ttyd

# yq
RUN wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && \
    chmod +x /usr/local/bin/yq

# ============================================================================
# NODE.JS GLOBAL PACKAGES
# ============================================================================
RUN npm install -g \
    pnpm@latest \
    openclaw@latest \
    typescript@latest \
    ts-node@latest \
    tsx@latest \
    vercel@latest \
    pm2@latest \
    serve@latest

# ============================================================================
# CREATE USER
# ============================================================================
RUN useradd -m -s /bin/bash -G sudo $USER && \
    echo "$USER ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# ============================================================================
# SETUP DIRECTORIES
# ============================================================================
RUN mkdir -p $HOME/.vnc $HOME/.openclaw $HOME/ordo $HOME/Desktop && \
    chown -R $USER:$USER $HOME

# ============================================================================
# BASHRC CONFIG
# ============================================================================
COPY docker/bashrc-ordo.sh /tmp/bashrc-ordo.sh
RUN cat /tmp/bashrc-ordo.sh >> $HOME/.bashrc && \
    chown $USER:$USER $HOME/.bashrc && \
    rm /tmp/bashrc-ordo.sh

# ============================================================================
# STARTUP SCRIPT
# ============================================================================
COPY docker/startup.sh /startup.sh
RUN chmod +x /startup.sh

# ============================================================================
# ENVIRONMENT VARIABLES
# ============================================================================
ENV DISPLAY=:1 \
    LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    VNC_PASSWORD=ordo \
    VNC_RESOLUTION=1920x1080 \
    ORDO_AUTO_CONFIG="" \
    ANTHROPIC_API_KEY="" \
    OPENAI_API_KEY="" \
    TELEGRAM_TOKEN="" \
    DISCORD_TOKEN="" \
    SLACK_TOKEN=""

# Expose ports
EXPOSE 6080 7681 18789

USER $USER
WORKDIR $HOME

CMD ["/startup.sh"]
