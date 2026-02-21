#!/bin/bash

# =============================================================================
# setup-server.sh
# Bootstrap script for local Kubernetes deployment platform
# Target OS: Ubuntu/Debian
# Run as a non-root user with sudo privileges
# =============================================================================

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ── Config ────────────────────────────────────────────────────────────────────
MINIKUBE_CPUS=${MINIKUBE_CPUS:-4}
MINIKUBE_MEMORY=${MINIKUBE_MEMORY:-4096}
MINIKUBE_DRIVER=${MINIKUBE_DRIVER:-docker}
REGISTRY_PORT=${REGISTRY_PORT:-5000}
LOG_FILE="/var/log/server-setup.log"

# ── Helpers ───────────────────────────────────────────────────────────────────
log()     { echo -e "${GREEN}[✔]${NC} $1" | tee -a "$LOG_FILE"; }
info()    { echo -e "${BLUE}[→]${NC} $1" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}[✘]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }
section() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; \
            echo -e "${BLUE}  $1${NC}"; \
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }

# ── Preflight checks ──────────────────────────────────────────────────────────
preflight() {
  section "Preflight Checks"

  if [ "$EUID" -eq 0 ]; then
    error "Do not run this script as root. Run as a regular user with sudo access."
  fi

  if ! sudo -v 2>/dev/null; then
    error "User $USER does not have sudo privileges."
  fi

  if ! grep -qi "ubuntu\|debian" /etc/os-release 2>/dev/null; then
    error "This script is intended for Ubuntu/Debian only."
  fi

  TOTAL_MEM_MB=$(awk '/MemTotal/ { printf "%d", $2/1024 }' /proc/meminfo)
  if [ "$TOTAL_MEM_MB" -lt 6000 ]; then
    warn "Total RAM is ${TOTAL_MEM_MB}MB. Recommended is 6GB+. Adjusting minikube memory to 2048MB."
    MINIKUBE_MEMORY=2048
  fi

  FREE_DISK_GB=$(df / --output=avail -BG | tail -1 | tr -d 'G ')
  if [ "$FREE_DISK_GB" -lt 20 ]; then
    warn "Free disk space is ${FREE_DISK_GB}GB. Recommended is 20GB+."
  fi

  log "Preflight checks passed (user: $USER, RAM: ${TOTAL_MEM_MB}MB, Disk free: ${FREE_DISK_GB}GB)"
}

# ── Stage 1: System packages ──────────────────────────────────────────────────
install_system_deps() {
  section "Stage 1 — System Packages"

  info "Updating apt..."
  sudo apt-get update -qq

  info "Installing base dependencies..."
  sudo apt-get install -y -qq \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https \
    git \
    jq \
    socat \
    conntrack

  log "System packages installed"
}

# ── Stage 2: Docker ───────────────────────────────────────────────────────────
install_docker() {
  section "Stage 2 — Docker"

  if command -v docker &>/dev/null; then
    log "Docker already installed ($(docker --version)). Skipping."
    return
  fi

  info "Adding Docker's GPG key and apt repo..."
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update -qq
  sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin

  info "Adding $USER to the docker group..."
  sudo usermod -aG docker "$USER"

  sudo systemctl enable docker
  sudo systemctl start docker

  log "Docker installed ($(docker --version))"
  warn "You may need to log out and back in (or run 'newgrp docker') for group changes to take effect."
}

# ── Stage 3: kubectl ──────────────────────────────────────────────────────────
install_kubectl() {
  section "Stage 3 — kubectl"

  if command -v kubectl &>/dev/null; then
    log "kubectl already installed. Skipping."
    return
  fi

  info "Downloading kubectl..."
  KUBECTL_VERSION=$(curl -sSL https://dl.k8s.io/release/stable.txt)
  curl -sSLO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
  sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
  rm kubectl

  log "kubectl installed"
}

# ── Stage 4: minikube ─────────────────────────────────────────────────────────
install_minikube() {
  section "Stage 4 — Minikube"

  if command -v minikube &>/dev/null; then
    log "Minikube already installed ($(minikube version --short)). Skipping."
    return
  fi

  info "Downloading minikube..."
  curl -sSLO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
  sudo install minikube-linux-amd64 /usr/local/bin/minikube
  rm minikube-linux-amd64

  log "Minikube installed ($(minikube version --short))"
}

# ── Stage 5: Start minikube cluster ──────────────────────────────────────────
start_minikube() {
  section "Stage 5 — Starting Minikube Cluster"

  if minikube status 2>/dev/null | grep -q "Running"; then
    log "Minikube cluster is already running. Skipping."
    return
  fi

  if minikube status 2>/dev/null | grep -q "Stopped"; then
    info "Minikube exists but is stopped. Starting it..."
    minikube start
    log "Minikube started"
    return
  fi

  info "Starting a fresh minikube cluster..."
  info "  Driver  : $MINIKUBE_DRIVER"
  info "  CPUs    : $MINIKUBE_CPUS"
  info "  Memory  : ${MINIKUBE_MEMORY}MB"

  sg docker -c "minikube start \
    --driver=$MINIKUBE_DRIVER \
    --cpus=$MINIKUBE_CPUS \
    --memory=$MINIKUBE_MEMORY \
    --embed-certs"

  log "Minikube cluster is up"
  kubectl get nodes
}

# ── Stage 6: Enable addons ────────────────────────────────────────────────────
enable_addons() {
  section "Stage 6 — Enabling Minikube Addons"

  info "Enabling registry addon..."
  minikube addons enable registry

  info "Enabling ingress addon (Nginx)..."
  minikube addons enable ingress

  info "Enabling ingress-dns addon..."
  minikube addons enable ingress-dns

  info "Enabling metrics-server..."
  minikube addons enable metrics-server

  log "Addons enabled"

  info "Waiting for ingress-nginx controller to be ready..."
  kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=90s && log "Nginx Ingress controller is ready" \
    || warn "Ingress controller not ready within timeout. Check: kubectl get pods -n ingress-nginx"
}

# ── Stage 7: Configure local registry access ──────────────────────────────────
configure_registry() {
  section "Stage 7 — Local Registry Configuration"

  MINIKUBE_IP=$(minikube ip)

  if grep -q "minikube-registry" /etc/hosts; then
    log "/etc/hosts already has minikube-registry entry. Skipping."
  else
    echo "$MINIKUBE_IP  minikube-registry" | sudo tee -a /etc/hosts > /dev/null
    log "Added minikube-registry → $MINIKUBE_IP to /etc/hosts"
  fi

  DAEMON_JSON="/etc/docker/daemon.json"
  if [ -f "$DAEMON_JSON" ] && grep -q "insecure-registries" "$DAEMON_JSON"; then
    log "Docker daemon already configured for insecure registry. Skipping."
  else
    info "Configuring Docker daemon for local insecure registry..."
    if [ -f "$DAEMON_JSON" ]; then
      sudo jq ". + {\"insecure-registries\": [\"$MINIKUBE_IP:5000\", \"localhost:5000\"]}" \
        "$DAEMON_JSON" | sudo tee "$DAEMON_JSON.tmp" > /dev/null
      sudo mv "$DAEMON_JSON.tmp" "$DAEMON_JSON"
    else
      echo "{\"insecure-registries\": [\"$MINIKUBE_IP:5000\", \"localhost:5000\"]}" | sudo tee "$DAEMON_JSON" > /dev/null
    fi
    sudo systemctl restart docker
    log "Docker daemon configured for local registry"
    info "Restarting minikube to apply docker daemon changes..."
    minikube stop
    sg docker -c "minikube start"
  fi

  log "Registry accessible at: localhost:$REGISTRY_PORT (via kubectl port-forward)"
}

# ── Stage 8: Registry port-forward as a systemd service ──────────────────────
setup_registry_portforward_service() {
  section "Stage 8 — Registry Port-Forward as a Service"

  SERVICE_FILE="/etc/systemd/system/minikube-registry-forward.service"

  if [ -f "$SERVICE_FILE" ]; then
    log "Registry port-forward service already exists. Skipping."
    return
  fi

  info "Creating systemd service for registry port-forward..."

  sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Minikube Registry Port Forward
After=network.target

[Service]
User=$USER
ExecStartPre=/bin/sleep 10
ExecStart=/usr/local/bin/kubectl port-forward --namespace kube-system service/registry $REGISTRY_PORT:80
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable minikube-registry-forward
  sudo systemctl start minikube-registry-forward

  log "Registry port-forward service installed and started"
}

# ── Stage 9: Create build directories ────────────────────────────────────────
setup_directories() {
  section "Stage 9 — Creating Build Directories"

  sudo mkdir -p /opt/deploy-platform/{builds,logs,manifests}
  sudo chown -R "$USER":"$USER" /opt/deploy-platform

  log "Build directories created at /opt/deploy-platform"
}

# ── Stage 10: Install host nginx (LAN reverse proxy) ─────────────────────────
install_host_nginx() {
  section "Stage 10 — Host Nginx (LAN Reverse Proxy)"

  if command -v nginx &>/dev/null; then
    log "Nginx already installed. Skipping install."
  else
    info "Installing nginx..."
    sudo apt-get install -y -qq nginx
    log "Nginx installed"
  fi

  MINIKUBE_IP=$(minikube ip)
  LAN_IP=$(ip route | grep default | grep -oP 'src \K[^ ]+' | head -1)

  # Per-site configs directory — owned by current user so API server
  # can write new site configs without needing sudo at deploy time
  sudo mkdir -p /etc/nginx/deploy-platform
  sudo chown -R "$USER":"$USER" /etc/nginx/deploy-platform

  # Main include file loaded by nginx — pulls in all per-site configs
  INCLUDE_CONF="/etc/nginx/conf.d/deploy-platform.conf"
  if [ ! -f "$INCLUDE_CONF" ]; then
    sudo tee "$INCLUDE_CONF" > /dev/null <<'EOF'
# Auto-managed by deploy-platform — do not edit manually
include /etc/nginx/deploy-platform/*.conf;
EOF
    log "Created nginx include config at $INCLUDE_CONF"
  else
    log "Nginx include config already exists. Skipping."
  fi

  # Default catch-all shown when no slug matches the Host header
  DEFAULT_CONF="/etc/nginx/deploy-platform/000-default.conf"
  if [ ! -f "$DEFAULT_CONF" ]; then
    cat > "$DEFAULT_CONF" <<'EOF'
server {
    listen 80 default_server;
    server_name _;
    return 200 'deploy-platform: no site found for this host\n';
    add_header Content-Type text/plain;
}
EOF
    log "Created default catch-all nginx config"
  fi

  # Remove stock nginx default site to avoid port 80 conflicts
  if [ -f "/etc/nginx/sites-enabled/default" ]; then
    sudo rm /etc/nginx/sites-enabled/default
    log "Removed nginx default site"
  fi

  # Validate and reload nginx
  sudo nginx -t && sudo systemctl reload nginx
  sudo systemctl enable nginx

  log "Host nginx is running on port 80"
  info "LAN IP      : $LAN_IP"
  info "Minikube IP : $MINIKUBE_IP"
  info "Sites dir   : /etc/nginx/deploy-platform/"
}

# ── Stage 11: Verify everything ───────────────────────────────────────────────
verify() {
  section "Stage 11 — Verification"

  local all_good=true

  check() {
    local label=$1
    local cmd=$2
    if eval "$cmd" &>/dev/null; then
      log "$label"
    else
      warn "FAILED: $label"
      all_good=false
    fi
  }

  check "Docker is running"          "docker info"
  check "kubectl can reach cluster"  "kubectl cluster-info"
  check "Minikube is running"        "minikube status | grep -q Running"
  check "Ingress addon enabled"      "minikube addons list | grep ingress | grep -q enabled"
  check "Registry addon enabled"     "minikube addons list | grep registry | grep -qw enabled"
  check "Build directories exist"    "test -d /opt/deploy-platform/builds"
  check "Host nginx is running"      "systemctl is-active nginx"
  check "Nginx sites dir exists"     "test -d /etc/nginx/deploy-platform"

  echo ""
  if $all_good; then
    log "All checks passed. Your deployment platform infrastructure is ready."
  else
    warn "Some checks failed. Review the warnings above."
  fi
}

# ── Summary ───────────────────────────────────────────────────────────────────
print_summary() {
  MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "unknown")
  LAN_IP=$(ip route | grep default | grep -oP 'src \K[^ ]+' | head -1 || echo "unknown")

  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  Setup Complete — Deployment Platform Summary${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  LAN IP (access from network) : ${BLUE}$LAN_IP${NC}"
  echo -e "  Minikube IP (internal)        : ${BLUE}$MINIKUBE_IP${NC}"
  echo -e "  Local Registry               : ${BLUE}localhost:$REGISTRY_PORT${NC}"
  echo -e "  Build directory              : ${BLUE}/opt/deploy-platform/builds${NC}"
  echo -e "  Logs directory               : ${BLUE}/opt/deploy-platform/logs${NC}"
  echo -e "  Nginx sites directory        : ${BLUE}/etc/nginx/deploy-platform/${NC}"
  echo -e "  Setup log                    : ${BLUE}$LOG_FILE${NC}"
  echo ""
  echo -e "  After deploying a site with slug 'mysite':"
  echo -e "  → On any LAN machine, add to /etc/hosts:"
  echo -e "    ${YELLOW}$LAN_IP  mysite.localhost${NC}"
  echo -e "  → Then open: ${BLUE}http://mysite.localhost${NC}"
  echo ""
  echo -e "  Useful commands:"
  echo -e "    ${YELLOW}minikube status${NC}           — cluster status"
  echo -e "    ${YELLOW}kubectl get pods -A${NC}       — all running pods"
  echo -e "    ${YELLOW}kubectl get ingress${NC}       — all ingress routes"
  echo -e "    ${YELLOW}ls /etc/nginx/deploy-platform/${NC} — all deployed site configs"
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  sudo touch "$LOG_FILE"
  sudo chmod 666 "$LOG_FILE"

  echo "" | tee -a "$LOG_FILE"
  info "Starting server setup at $(date)" | tee -a "$LOG_FILE"

  preflight
  install_system_deps
  install_docker
  install_kubectl
  install_minikube
  start_minikube
  enable_addons
  configure_registry
  setup_registry_portforward_service
  setup_directories
  install_host_nginx
  verify
  print_summary
}

main "$@"