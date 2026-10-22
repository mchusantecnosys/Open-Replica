#!/usr/bin/env bash
# ==============================================================================
# install.sh — OpenCode & Google Antigravity IDE/CLI Installer for replica-skill
# Installs 11 clean-room agent skills (/replica-recon .. /replica-deploy)
# and 5 zero-dependency Python verification scripts.
#
# Usage:
#   ./install.sh --global [--agent both|opencode|antigravity]
#   ./install.sh --local [TARGET_DIR] [--agent both|opencode|antigravity]
# ==============================================================================
set -euo pipefail

MODE="--local"
TARGET_DIR="."
AGENT="both"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --global|-g)
      MODE="--global"
      shift
      ;;
    --local|-l)
      MODE="--local"
      if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
        TARGET_DIR="$2"
        shift
      fi
      shift
      ;;
    --agent|-a)
      AGENT="${2:-both}"
      shift 2
      ;;
    --help|-h)
      echo "Usage: ./install.sh [--global | --local <dir>] [--agent both|opencode|antigravity]"
      exit 0
      ;;
    *)
      TARGET_DIR="$1"
      shift
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -d "$SCRIPT_DIR/.agents/skills" ]]; then
  SOURCE_SKILLS_DIR="$SCRIPT_DIR/.agents/skills"
elif [[ -d "$SCRIPT_DIR/skills" ]]; then
  SOURCE_SKILLS_DIR="$SCRIPT_DIR/skills"
else
  echo "Error: Could not locate .agents/skills directory next to install.sh" >&2
  exit 1
fi

install_into() {
  local dest="$1"
  local label="$2"
  mkdir -p "$dest"
  local abs_src
  local abs_dest
  abs_src="$(cd "$SOURCE_SKILLS_DIR" && pwd)"
  abs_dest="$(cd "$dest" && pwd)"
  if [[ "$abs_src" != "$abs_dest" ]]; then
    cp -R "$SOURCE_SKILLS_DIR/"* "$dest/"
  fi
  chmod +x "$dest"/replica-*/scripts/*.py 2>/dev/null || true
  echo "✓ [$label] Installed 11 skills + 5 Python verifiers -> $dest"
}

if [[ "$MODE" == "--global" ]]; then
  if [[ "$AGENT" == "both" || "$AGENT" == "opencode" ]]; then
    install_into "$HOME/.config/opencode/skills" "OpenCode Global"
  fi
  if [[ "$AGENT" == "both" || "$AGENT" == "antigravity" ]]; then
    install_into "$HOME/.gemini/config/skills" "Google Antigravity Global"
  fi
  echo ""
  echo "replica-skill global installation complete."
  echo "Invoke '/replica-recon <target-app>' in OpenCode or Google Antigravity to start."
else
  if [[ "$AGENT" == "both" || "$AGENT" == "opencode" ]]; then
    install_into "$TARGET_DIR/.opencode/skills" "OpenCode Workspace"
  fi
  if [[ "$AGENT" == "both" || "$AGENT" == "antigravity" ]]; then
    install_into "$TARGET_DIR/.agents/skills" "Google Antigravity Workspace"
  fi
  mkdir -p "$TARGET_DIR/replica/screens" "$TARGET_DIR/replica/clone-screens"
  echo "✓ [Workspace] Created artifact directories -> $TARGET_DIR/replica/{screens,clone-screens}"
  echo ""
  echo "replica-skill local installation complete in: $TARGET_DIR"
  echo "Invoke '/replica-recon <target-app>' in OpenCode or Google Antigravity to start."
fi
