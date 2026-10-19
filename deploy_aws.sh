#!/usr/bin/env bash
# ==============================================================================
# CodeBeast AI - Automated 1-Click AWS EC2 / Lightsail Deployment Script
# Target OS: Ubuntu 22.04 LTS / 24.04 LTS
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 Starting Automated AWS Deployment for CodeBeast AI"
echo "=========================================================="

# 1. Update system packages
echo "[1/6] Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git nginx certbot python3-certbot-nginx

# 2. Install Docker & Docker Compose if missing
echo "[2/6] Verifying Docker Engine..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
fi

# 3. Clone or pull latest code
REPO_DIR="$HOME/CODE-BEAST-AI"
if [ ! -d "$REPO_DIR" ]; then
    echo "[3/6] Cloning repository to $REPO_DIR..."
    git clone https://github.com/ibanmondal/CODE-BEAST-AI.git "$REPO_DIR"
    cd "$REPO_DIR"
else
    echo "[3/6] Repository exists. Pulling latest main branch..."
    cd "$REPO_DIR"
    git pull origin main
fi

# 4. Check or create .env file
echo "[4/6] Checking production environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  ACTION REQUIRED: .env created from .env.example."
    echo "Please configure your GROQ_API_KEY and GITHUB_TOKEN inside $REPO_DIR/.env"
    echo ""
fi

# Detect Public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s ifconfig.me || echo "localhost")
echo "Detected Public IP: $PUBLIC_IP"

# 5. Build and launch Docker Compose stack
echo "[5/6] Building and launching multi-agent containers..."
sudo docker compose -f docker-compose.prod.yml up -d --build

# 6. Configure Nginx Reverse Proxy
echo "[6/6] Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/codebeast > /dev/null <<EOF
server {
    listen 80;
    server_name $PUBLIC_IP;

    # Frontend Next.js UI
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # FastAPI REST Endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket Real-Time Stream
    location /api/v1/ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Interactive API Docs
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/codebeast /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo ""
echo "=========================================================="
echo "✅ CodeBeast AI is LIVE on AWS!"
echo "=========================================================="
echo "🌐 Web Dashboard:    http://$PUBLIC_IP"
echo "🔌 API Docs:         http://$PUBLIC_IP/docs"
echo "📡 Live Telemetry:   http://$PUBLIC_IP/live"
echo "=========================================================="
