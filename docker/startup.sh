#!/bin/bash
# Ordo.sh - Startup script for Ubuntu + XFCE + noVNC
set -e

export HOME=/home/ordo
export DISPLAY=:1
cd $HOME

echo "[ordo] Starting Ordo Desktop..."

# ============================================================================
# VNC SETUP
# ============================================================================
mkdir -p ~/.vnc

# Set VNC password
echo "${VNC_PASSWORD:-ordo}" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# VNC startup script (starts XFCE)
cat > ~/.vnc/xstartup << 'EOF'
#!/bin/bash
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS
exec startxfce4
EOF
chmod +x ~/.vnc/xstartup

# Start VNC server
echo "[ordo] Starting VNC server..."
vncserver :1 -geometry ${VNC_RESOLUTION:-1920x1080} -depth 24 -localhost no

# ============================================================================
# NOVNC (browser-based VNC)
# ============================================================================
echo "[ordo] Starting noVNC on port 6080..."
websockify --web=/usr/share/novnc 6080 localhost:5901 &

# ============================================================================
# OPENCLAW AUTO-CONFIG
# ============================================================================
if [ "$ORDO_AUTO_CONFIG" = "true" ]; then
    echo "[ordo] Auto-configuring OpenClaw..."
    
    CONFIG_DIR="$HOME/.openclaw"
    CONFIG_FILE="$CONFIG_DIR/openclaw.json"
    mkdir -p "$CONFIG_DIR"
    
    # Build config
    config='{
        "agents": {
            "defaults": {
                "workspace": "~/ordo",
                "model": { "primary": "anthropic/claude-opus-4-20250514" }
            }
        },
        "gateway": { "port": 18789, "mode": "local" },
        "channels": {}
    }'
    
    [ -n "$TELEGRAM_TOKEN" ] && config=$(echo "$config" | jq '.channels.telegram = { "enabled": true }') && export TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN"
    [ -n "$DISCORD_TOKEN" ] && config=$(echo "$config" | jq '.channels.discord = { "enabled": true }') && export DISCORD_BOT_TOKEN="$DISCORD_TOKEN"
    [ -n "$SLACK_TOKEN" ] && config=$(echo "$config" | jq '.channels.slack = { "enabled": true }') && export SLACK_BOT_TOKEN="$SLACK_TOKEN"
    
    echo "$config" | jq '.' > "$CONFIG_FILE"
    
    # Save env vars
    [ -n "$ANTHROPIC_API_KEY" ] && echo "export ANTHROPIC_API_KEY='$ANTHROPIC_API_KEY'" >> ~/.bashrc
    [ -n "$OPENAI_API_KEY" ] && echo "export OPENAI_API_KEY='$OPENAI_API_KEY'" >> ~/.bashrc
    [ -n "$TELEGRAM_BOT_TOKEN" ] && echo "export TELEGRAM_BOT_TOKEN='$TELEGRAM_BOT_TOKEN'" >> ~/.bashrc
    [ -n "$DISCORD_BOT_TOKEN" ] && echo "export DISCORD_BOT_TOKEN='$DISCORD_BOT_TOKEN'" >> ~/.bashrc
    
    # Start gateway if configured
    channel_count=$(echo "$config" | jq '.channels | length')
    if [ -n "$ANTHROPIC_API_KEY" ] && [ "$channel_count" -gt 0 ]; then
        echo "[ordo] Starting OpenClaw gateway..."
        nohup openclaw gateway --port 18789 > ~/.openclaw/openclaw.log 2>&1 &
    fi
fi

# ============================================================================
# AUTO-START GATEWAY (if already configured)
# ============================================================================
if [ -f "$HOME/.openclaw/openclaw.json" ]; then
    echo "[ordo] Found OpenClaw config, starting gateway..."
    nohup openclaw gateway --port 18789 > ~/.openclaw/openclaw.log 2>&1 &
    sleep 2
    echo "[ordo] Gateway started (check ~/.openclaw/openclaw.log for logs)"
fi

# ============================================================================
# WEB TERMINAL
# ============================================================================
echo "[ordo] Starting web terminal on port 7681..."
echo ""
echo "========================================"
echo "  Ordo Desktop Ready!"
echo "========================================"
echo ""
echo "  Desktop: http://localhost:6080/vnc.html"
echo "  Terminal: http://localhost:7681"
echo ""
echo "  VNC Password: ${VNC_PASSWORD:-ordo}"
echo ""

# Start ttyd (this keeps the container running)
# -l flag makes bash source .bashrc
exec ttyd -W -p 7681 bash --login -i
