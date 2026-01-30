# Ordo.sh bash config

# Prompt
export PS1="\[\033[1;32m\]ordo\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ "

# Aliases
alias ll="ls -la"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."

# Git
alias gs="git status"
alias gd="git diff"
alias gl="git log --oneline -20"
alias gp="git pull"

# Node
alias ni="npm install"
alias nr="npm run"
alias pi="pnpm install"
alias pr="pnpm run"

# Python
alias py="python3"

# OpenClaw
alias ordo="openclaw"
alias claw="openclaw"

# Welcome message
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
    echo "  Commands:"
    echo "    ordo status   - Check bot status"
    echo "    ordo doctor   - Diagnose issues"
    echo "    ordo gateway  - Start the gateway"
    echo ""
fi
