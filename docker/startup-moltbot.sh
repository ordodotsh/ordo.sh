#!/bin/bash
# Ordo.sh - Auto-configuration startup script with Desktop GUI
# Moltbot (formerly Clawdbot) - https://moltbot.ai / https://docs.moltbot.ai
# This script auto-configures Moltbot and starts KasmVNC desktop

# Don't exit on error - we want services to start even if other things fail
set +e

# The KasmWeb base image runs as kasm-user (UID 1000)
export HOME=/home/kasm-user
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
mkdir -p "$HOME/.config"

# Source bashrc for aliases
source "$HOME/.bashrc" 2>/dev/null || true

# Check if we should auto-configure
if [ "$ORDO_AUTO_CONFIG" = "true" ]; then
  echo "[ordo] Starting auto-configuration..."

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
    echo "[ordo] Telegram channel enabled"
  fi

  # Add Discord channel if token provided
  if [ -n "$DISCORD_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.discord = { "enabled": true }')
    export DISCORD_BOT_TOKEN="$DISCORD_TOKEN"
    echo "[ordo] Discord channel enabled"
  fi

  # Add Slack channel if token provided
  if [ -n "$SLACK_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.slack = { "enabled": true }')
    export SLACK_BOT_TOKEN="$SLACK_TOKEN"
    echo "[ordo] Slack channel enabled"
  fi

  # Add WhatsApp channel if token provided
  if [ -n "$WHATSAPP_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.whatsapp = { "enabled": true }')
    export WHATSAPP_BOT_TOKEN="$WHATSAPP_TOKEN"
    echo "[ordo] WhatsApp channel enabled"
  fi

  # Write config file
  echo "$config" | jq '.' > "$CONFIG_FILE"

  # Count configured channels
  channel_count=$(echo "$config" | jq '.channels | length')

  # Generate gateway auth token (silent)
  moltbot config set gateway.auth.mode token 2>/dev/null || true

  # Save ALL env vars to bashrc for persistence
  cat >> "$HOME/.bashrc" << ENVVARS

# Ordo.sh environment variables (auto-configured)
# AI Provider Keys
ENVVARS

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
    echo "[ordo] Running moltbot doctor --fix..."
    # Run doctor --fix to enable configured channels
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
    DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
    SLACK_BOT_TOKEN="$SLACK_BOT_TOKEN" \
    WHATSAPP_BOT_TOKEN="$WHATSAPP_BOT_TOKEN" \
    moltbot doctor --fix 2>/dev/null || true

    echo "[ordo] Starting moltbot gateway..."
    # Start the gateway with env vars explicitly passed
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
    DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
    SLACK_BOT_TOKEN="$SLACK_BOT_TOKEN" \
    WHATSAPP_BOT_TOKEN="$WHATSAPP_BOT_TOKEN" \
    nohup moltbot gateway --port 18789 --verbose > "$HOME/.moltbot/moltbot.log" 2>&1 &
    
    echo "[ordo] Gateway started (check ~/.moltbot/moltbot.log for logs)"
  fi
  
  echo "[ordo] Auto-configuration complete!"
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

cat > "$HOME/Desktop/code.desktop" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=VS Code (Web)
Comment=Open VS Code in browser
Exec=chromium --no-sandbox --app=https://vscode.dev
Icon=code
Terminal=false
Categories=Development;
EOF
chmod +x "$HOME/Desktop/code.desktop" 2>/dev/null || true

# Set up VNC password for KasmVNC
mkdir -p "$HOME/.vnc"
VNC_PASS="${VNC_PASSWORD:-ordodesktop}"

# KasmVNC password setup
echo -e "${VNC_PASS}\n${VNC_PASS}\n" | vncpasswd -u kasm-user -ow 2>/dev/null || true

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
echo "[ordo] Starting KasmVNC desktop on port 6901..."
vncserver :1 \
  -geometry "${VNC_RESOLUTION:-1920x1080}" \
  -depth "${VNC_COL_DEPTH:-24}" \
  -websocketPort 6901 \
  -disableBasicAuth \
  -SecurityTypes None \
  2>&1 &

# Wait for VNC to start
sleep 2

# Start ttyd with bash (terminal access on port 7681)
echo "[ordo] Starting web terminal on port 7681..."
echo "[ordo] Desktop ready!"
exec ttyd -W -p 7681 -i 0.0.0.0 bash -l
