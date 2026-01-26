# Ordo.sh - Cloud Clawdbot Environment
# Container: ghcr.io/ordodotsh/ordo-bot
FROM node:22-alpine

WORKDIR /home/dev

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    bash \
    jq \
    openssh-client \
    ttyd \
    && npm install -g clawdbot@latest

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

# Environment variables (set at runtime by Ordo.sh)
ENV USER_WALLET=""
ENV ORDO_AUTO_CONFIG=""
ENV ANTHROPIC_API_KEY=""
ENV TELEGRAM_TOKEN=""
ENV DISCORD_TOKEN=""
ENV SLACK_TOKEN=""
ENV WHATSAPP_TOKEN=""

# Expose web terminal port
EXPOSE 7681

# Start with auto-config script
CMD ["/usr/local/bin/startup.sh"]
