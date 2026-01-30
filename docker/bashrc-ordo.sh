# Ordo.sh bash config
export PS1="\[\033[1;32m\]ordo\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ "

# Modern CLI aliases
alias ll="eza -la --icons --git 2>/dev/null || ls -la"
alias la="eza -a --icons 2>/dev/null || ls -a"
alias l="eza --icons 2>/dev/null || ls"
alias lt="eza --tree --icons -L 2 2>/dev/null || tree -L 2"
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

# Python shortcuts
alias py="python3"

# AI tool aliases
# OpenClaw aliases (ordo = main command)
alias ordo="openclaw"
alias claw="openclaw"
alias claude="claude-code"
alias ai="open-interpreter"

# Starship prompt (if available)
if command -v starship &> /dev/null; then
  eval "$(starship init bash)"
fi

# Zoxide (smarter cd) - if available
if command -v zoxide &> /dev/null; then
  eval "$(zoxide init bash)"
fi

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
  # Show runtime versions
  NODE_V=$(node -v 2>/dev/null || echo "n/a")
  PY_V=$(python3 --version 2>/dev/null | cut -d' ' -f2 || echo "n/a")
  GO_V=$(go version 2>/dev/null | cut -d' ' -f3 || echo "n/a")
  echo "  Runtimes: Node $NODE_V | Python $PY_V | Go $GO_V"
  echo ""
  echo "  AI Tools:"
  echo "    ordo       - AI assistant gateway (openclaw)"
  echo "    claude     - Claude Code CLI"
  echo "    aider      - AI pair programming"
  echo "    ai         - Open Interpreter"
  echo ""
  echo "  Commands:"
  echo "    ordo status      - Check bot status"
  echo "    ordo doctor      - Diagnose issues"
  echo "    ordo --help      - All commands"
  echo ""
fi
