#!/bin/bash
# Ordo.sh - Auto-configuration startup script with Desktop GUI
# Moltbot (formerly Clawdbot) - https://moltbot.ai / https://docs.moltbot.ai
# This script auto-configures Moltbot and starts KasmVNC desktop

# Don't exit on error - we want services to start even if other things fail
set +e

# Fix permissions on mounted volumes (runs as root, then switches to node)
if [ "$(id -u)" = "0" ]; then
  # Ensure node user owns all the data directories
  chown -R node:node /home/node 2>/dev/null || true

  # Start dbus (required for desktop)
  mkdir -p /run/dbus
  dbus-daemon --system --fork 2>/dev/null || true

  # Re-run this script as node user
  exec su -s /bin/bash node -c "$0 $*"
fi

# Now running as node user
export HOME=/home/node
cd "$HOME"

# Chromium flags for Docker/CI environments
export CHROMIUM_FLAGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu"
export PLAYWRIGHT_CHROMIUM_ARGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"

CONFIG_DIR="$HOME/.moltbot"
CONFIG_FILE="$CONFIG_DIR/moltbot.json"

# Create config directory and workspace
mkdir -p "$CONFIG_DIR"
mkdir -p "$HOME/ordo"
mkdir -p "$HOME/Desktop"
mkdir -p "$HOME/.vnc"

# Make .profile source .bashrc
echo '[ -f ~/.bashrc ] && source ~/.bashrc' >> "$HOME/.profile"

# Create 'ordo' alias and welcome message in .bashrc
cat >> "$HOME/.bashrc" << 'BASHRC'
# Ordo.sh configuration
alias ordo="moltbot"
alias molt="moltbot"

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
  echo "  Access Points:"
  echo "    Desktop GUI:  http://localhost:6901"
  echo "    Web Terminal: http://localhost:7681"
  echo ""
  echo "  Commands:"
  echo "    moltbot status   - Check bot status"
  echo "    moltbot doctor   - Diagnose issues"
  echo "    moltbot --help   - All commands"
  echo ""
  # Check if gateway is running
  if pgrep -f "moltbot gateway" > /dev/null 2>&1; then
    echo "  Bot is running! Message your bot to chat."
  else
    echo "  Bot starting... run 'moltbot status' to check."
  fi
  echo ""
fi
BASHRC

# Check if we should auto-configure
if [ "$ORDO_AUTO_CONFIG" = "true" ]; then
  # Silent auto-configuration (output goes to log)

  # Start building the config JSON with proper moltbot structure
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
  moltbot config set gateway.auth.mode token 2>/dev/null || true

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

  # Start moltbot gateway in the background if API key is set and channels configured
  if [ -n "$ANTHROPIC_API_KEY" ] && [ "$channel_count" -gt 0 ]; then
    # Run doctor --fix to enable configured channels
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
    DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
    SLACK_BOT_TOKEN="$SLACK_BOT_TOKEN" \
    WHATSAPP_BOT_TOKEN="$WHATSAPP_BOT_TOKEN" \
    moltbot doctor --fix 2>/dev/null || true

    # Start the gateway with env vars explicitly passed
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
    DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
    SLACK_BOT_TOKEN="$SLACK_BOT_TOKEN" \
    WHATSAPP_BOT_TOKEN="$WHATSAPP_BOT_TOKEN" \
    nohup moltbot gateway --port 18789 --verbose > "$HOME/.moltbot/moltbot.log" 2>&1 &
  fi
fi

# Create desktop shortcuts
cat > "$HOME/Desktop/chromium.desktop" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Chromium Browser
Comment=Access the Internet
Exec=chromium --no-sandbox --disable-setuid-sandbox %U
Icon=chromium
Terminal=false
Categories=Network;WebBrowser;
EOF
chmod +x "$HOME/Desktop/chromium.desktop"

cat > "$HOME/Desktop/terminal.desktop" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Terminal
Comment=Use the command line
Exec=xfce4-terminal
Icon=utilities-terminal
Terminal=false
Categories=System;TerminalEmulator;
EOF
chmod +x "$HOME/Desktop/terminal.desktop"

cat > "$HOME/Desktop/files.desktop" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Files
Comment=Browse the file system
Exec=thunar
Icon=system-file-manager
Terminal=false
Categories=System;FileManager;
EOF
chmod +x "$HOME/Desktop/files.desktop"

cat > "$HOME/Desktop/moltbot.desktop" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Moltbot
Comment=AI Assistant
Exec=xfce4-terminal -e "moltbot"
Icon=utilities-terminal
Terminal=false
Categories=Development;
EOF
chmod +x "$HOME/Desktop/moltbot.desktop"

# Set up VNC password
mkdir -p "$HOME/.vnc"
VNC_PASS="${VNC_PASSWORD:-ordo}"
echo "$VNC_PASS" | vncpasswd -f > "$HOME/.vnc/passwd"
chmod 600 "$HOME/.vnc/passwd"

# Create xstartup for KasmVNC
cat > "$HOME/.vnc/xstartup" << 'EOF'
#!/bin/bash
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS
export XDG_SESSION_TYPE=x11

# Start XFCE4 desktop
exec startxfce4
EOF
chmod +x "$HOME/.vnc/xstartup"

# Start KasmVNC server
echo "Starting KasmVNC desktop on port 6901..."
vncserver :1 \
  -geometry "${VNC_RESOLUTION:-1920x1080}" \
  -depth "${VNC_COL_DEPTH:-24}" \
  -websocketPort 6901 \
  -httpd /usr/share/kasmvnc/www \
  -disableBasicAuth \
  -PublicIP 0.0.0.0 \
  2>/dev/null &

# Wait for VNC to start
sleep 2

# Start ttyd with bash (terminal access on port 7681)
echo "Starting web terminal on port 7681..."
exec ttyd -W -p 7681 -i 0.0.0.0 bash -l
