#!/bin/bash
# Ordo.sh - Auto-configuration startup script
# This script auto-configures Moltbot (clawdbot) based on environment variables
# Docs: https://docs.clawd.bot

# Don't exit on error - we want ttyd to start even if other things fail
set +e

# Fix permissions on mounted volumes (runs as root, then switches to node)
if [ "$(id -u)" = "0" ]; then
  # Ensure node user owns all the data directories
  chown -R node:node /home/node 2>/dev/null || true
  
  # Re-run this script as node user
  exec su-exec node "$0" "$@"
fi

# Now running as node user
export HOME=/home/node
cd "$HOME"

# Chromium flags for Docker/CI environments (no sandbox needed)
export CHROMIUM_FLAGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu"
export PLAYWRIGHT_CHROMIUM_ARGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"

CONFIG_DIR="$HOME/.clawdbot"
CONFIG_FILE="$CONFIG_DIR/clawdbot.json"

# Create config directory and workspace
mkdir -p "$CONFIG_DIR"
mkdir -p "$HOME/ordo"

# Make .profile source .bashrc (login shells don't read .bashrc by default)
echo '[ -f ~/.bashrc ] && source ~/.bashrc' >> "$HOME/.profile"

# Create 'ordo' alias and welcome message in .bashrc
cat >> "$HOME/.bashrc" << 'BASHRC'
# Ordo.sh configuration
alias ordo="clawdbot"

# Welcome message (only show once per session)
if [ -z "$ORDO_WELCOMED" ]; then
  export ORDO_WELCOMED=1
  echo ""
  echo "  ░█▀█░█▀▄░█▀▄░█▀█"
  echo "  ░█░█░█▀▄░█░█░█░█"
  echo "  ░▀▀▀░▀░▀░▀▀░░▀▀▀"
  echo ""
  echo "  Welcome to Ordo"
  echo "  Your AI Assistant in the Cloud"
  echo ""
  echo "  Commands:"
  echo "    ordo status   - Check bot status"
  echo "    ordo doctor   - Diagnose issues"  
  echo "    ordo --help   - All commands"
  echo ""
  # Check if gateway is running
  if pgrep -f "clawdbot gateway" > /dev/null 2>&1; then
    echo "  ✓ Bot is running! Message your bot to chat."
  else
    echo "  ⚠ Bot starting... run 'ordo status' to check."
  fi
  echo ""
fi
BASHRC

# Check if we should auto-configure
if [ "$ORDO_AUTO_CONFIG" = "true" ]; then
  # Silent auto-configuration (output goes to log)

  # Start building the config JSON with proper clawdbot structure (2026.1.x format)
  config='{
    "agents": {
      "defaults": {
        "workspace": "~/ordo",
        "model": {
          "primary": "anthropic/claude-opus-4-20250514"
        }
      }
    },
    "gateway": {
      "port": 18789,
      "mode": "local"
    },
    "channels": {}
  }'

  # Add Telegram channel if token provided
  if [ -n "$TELEGRAM_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.telegram = { "enabled": true }')
    export TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN"
  fi

  # Add Discord channel if token provided
  if [ -n "$DISCORD_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.discord = { "enabled": true }')
    export DISCORD_BOT_TOKEN="$DISCORD_TOKEN"
  fi

  # Add Slack channel if token provided
  if [ -n "$SLACK_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.slack = { "enabled": true }')
    export SLACK_BOT_TOKEN="$SLACK_TOKEN"
  fi

  # Add WhatsApp channel if token provided
  if [ -n "$WHATSAPP_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.whatsapp = { "enabled": true }')
    export WHATSAPP_BOT_TOKEN="$WHATSAPP_TOKEN"
  fi

  # Write config file
  echo "$config" | jq '.' > "$CONFIG_FILE"

  # Count configured channels
  channel_count=$(echo "$config" | jq '.channels | length')

  # Generate gateway auth token (silent)
  clawdbot config set gateway.auth.mode token 2>/dev/null || true
  
  # Save ALL env vars (before starting gateway)
  # AI Provider Keys
  [ -n "$ANTHROPIC_API_KEY" ] && echo "export ANTHROPIC_API_KEY='$ANTHROPIC_API_KEY'" >> "$HOME/.bashrc"
  [ -n "$OPENAI_API_KEY" ] && echo "export OPENAI_API_KEY='$OPENAI_API_KEY'" >> "$HOME/.bashrc"
  [ -n "$GEMINI_API_KEY" ] && echo "export GEMINI_API_KEY='$GEMINI_API_KEY'" >> "$HOME/.bashrc"
  [ -n "$GOOGLE_API_KEY" ] && echo "export GOOGLE_API_KEY='$GOOGLE_API_KEY'" >> "$HOME/.bashrc"
  
  # Messaging Channels
  [ -n "$TELEGRAM_BOT_TOKEN" ] && echo "export TELEGRAM_BOT_TOKEN='$TELEGRAM_BOT_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$TELEGRAM_API_ID" ] && echo "export TELEGRAM_API_ID='$TELEGRAM_API_ID'" >> "$HOME/.bashrc"
  [ -n "$TELEGRAM_API_HASH" ] && echo "export TELEGRAM_API_HASH='$TELEGRAM_API_HASH'" >> "$HOME/.bashrc"
  [ -n "$TELEGRAM_PHONE" ] && echo "export TELEGRAM_PHONE='$TELEGRAM_PHONE'" >> "$HOME/.bashrc"
  [ -n "$DISCORD_BOT_TOKEN" ] && echo "export DISCORD_BOT_TOKEN='$DISCORD_BOT_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$SLACK_BOT_TOKEN" ] && echo "export SLACK_BOT_TOKEN='$SLACK_BOT_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$WHATSAPP_BOT_TOKEN" ] && echo "export WHATSAPP_BOT_TOKEN='$WHATSAPP_BOT_TOKEN'" >> "$HOME/.bashrc"
  
  # Platform Tokens (for autonomous deployment)
  [ -n "$GITHUB_TOKEN" ] && echo "export GITHUB_TOKEN='$GITHUB_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$VERCEL_TOKEN" ] && echo "export VERCEL_TOKEN='$VERCEL_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$NETLIFY_AUTH_TOKEN" ] && echo "export NETLIFY_AUTH_TOKEN='$NETLIFY_AUTH_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$CLOUDFLARE_API_TOKEN" ] && echo "export CLOUDFLARE_API_TOKEN='$CLOUDFLARE_API_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$RAILWAY_TOKEN" ] && echo "export RAILWAY_TOKEN='$RAILWAY_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$FIREBASE_TOKEN" ] && echo "export FIREBASE_TOKEN='$FIREBASE_TOKEN'" >> "$HOME/.bashrc"
  
  # Web Search
  [ -n "$BRAVE_API_KEY" ] && echo "export BRAVE_API_KEY='$BRAVE_API_KEY'" >> "$HOME/.bashrc"
  
  # Git Config
  [ -n "$GIT_AUTHOR_NAME" ] && echo "export GIT_AUTHOR_NAME='$GIT_AUTHOR_NAME'" >> "$HOME/.bashrc"
  [ -n "$GIT_AUTHOR_EMAIL" ] && echo "export GIT_AUTHOR_EMAIL='$GIT_AUTHOR_EMAIL'" >> "$HOME/.bashrc"
  [ -n "$GIT_COMMITTER_NAME" ] && echo "export GIT_COMMITTER_NAME='$GIT_COMMITTER_NAME'" >> "$HOME/.bashrc"
  [ -n "$GIT_COMMITTER_EMAIL" ] && echo "export GIT_COMMITTER_EMAIL='$GIT_COMMITTER_EMAIL'" >> "$HOME/.bashrc"
  
  # Email Config
  [ -n "$EMAIL_IMAP_HOST" ] && echo "export EMAIL_IMAP_HOST='$EMAIL_IMAP_HOST'" >> "$HOME/.bashrc"
  [ -n "$EMAIL_IMAP_USER" ] && echo "export EMAIL_IMAP_USER='$EMAIL_IMAP_USER'" >> "$HOME/.bashrc"
  [ -n "$EMAIL_IMAP_PASS" ] && echo "export EMAIL_IMAP_PASS='$EMAIL_IMAP_PASS'" >> "$HOME/.bashrc"
  [ -n "$EMAIL_SMTP_HOST" ] && echo "export EMAIL_SMTP_HOST='$EMAIL_SMTP_HOST'" >> "$HOME/.bashrc"

  # Start clawdbot gateway in the background if API key is set and channels configured
  if [ -n "$ANTHROPIC_API_KEY" ] && [ "$channel_count" -gt 0 ]; then
    # Run doctor --fix to enable configured channels
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
    DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
    SLACK_BOT_TOKEN="$SLACK_BOT_TOKEN" \
    WHATSAPP_BOT_TOKEN="$WHATSAPP_BOT_TOKEN" \
    clawdbot doctor --fix 2>/dev/null || true

    # Start the gateway with env vars explicitly passed
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
    DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
    SLACK_BOT_TOKEN="$SLACK_BOT_TOKEN" \
    WHATSAPP_BOT_TOKEN="$WHATSAPP_BOT_TOKEN" \
    nohup clawdbot gateway --port 18789 --verbose > "$HOME/.clawdbot/clawdbot.log" 2>&1 &
  fi
fi

# Start virtual display for headless browser automation
Xvfb :1 -screen 0 1920x1080x24 &
sleep 1

# Start ttyd with bash (terminal access on port 7681)
# Bind to 0.0.0.0 explicitly for external access
exec ttyd -W -p 7681 -i 0.0.0.0 bash -l
