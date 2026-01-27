# Ordo.sh - Cloud Clawdbot Environment
# Container: ghcr.io/ordodotsh/ordo-bot
FROM node:22-alpine

WORKDIR /home/dev

# Enable community repository for desktop packages
RUN echo "https://dl-cdn.alpinelinux.org/alpine/v3.21/community" >> /etc/apk/repositories

# Install system dependencies including desktop environment
RUN apk add --no-cache \
    git \
    curl \
    bash \
    jq \
    openssh-client \
    ttyd \
    # Playwright/Chromium dependencies
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    # Voice message support
    ffmpeg \
    # Desktop environment for full GUI access (Alpine package names)
    xfce4 \
    xfce4-terminal \
    dbus \
    # X11 virtual framebuffer
    xvfb-run \
    xorg-server \
    # VNC for remote desktop
    x11vnc \
    # Python for Telethon and websockify
    python3 \
    py3-pip \
    py3-numpy \
    # Build dependencies for Python packages (cryptg) - temporary
    && apk add --no-cache --virtual .build-deps \
    gcc \
    musl-dev \
    python3-dev \
    libffi-dev \
    openssl-dev \
    && npm install -g clawdbot@latest playwright \
    && pip3 install --break-system-packages telethon cryptg websockify \
    && npx playwright install chromium \
    # Install noVNC from source
    && git clone --depth 1 https://github.com/novnc/noVNC.git /usr/share/novnc \
    && ln -s /usr/share/novnc/vnc.html /usr/share/novnc/index.html \
    # Clean up build dependencies to reduce image size
    && apk del .build-deps

# Create dev user
RUN adduser -D -s /bin/bash dev && \
    chown -R dev:dev /home/dev

# Copy startup script
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Switch to dev user
USER dev

# Set up bash as default shell
ENV SHELL=/bin/bash
ENV HOME=/home/dev
ENV DISPLAY=:1

# Increase Node.js memory limit to prevent heap out of memory errors
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Environment variables (set at runtime by Ordo.sh)
ENV USER_WALLET=""
ENV ORDO_AUTO_CONFIG=""
ENV ANTHROPIC_API_KEY=""
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

# Expose ports: 7681 = terminal, 6080 = noVNC desktop
EXPOSE 7681 6080

# Start with auto-config script
CMD ["/usr/local/bin/startup.sh"]
# Rebuilt 2026-01-27T22:05:42Z
