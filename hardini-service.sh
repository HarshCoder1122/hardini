#!/bin/bash

# Hardini Backend Service - Permanent background process
# This script creates a systemd service that runs 24/7

SERVICE_NAME="hardini-backend"
SERVICE_DESCRIPTION="Hardini Agriculture App Backend Server"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get absolute path of script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_info "========================================"
print_info "       HARDINI PERMANENT SERVICE"
print_info "========================================"
echo ""

# Check if running as root for service creation
if [[ "$1" == "--install" ]]; then
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (sudo) to install the service."
        echo "Usage: sudo ./hardini-service.sh --install"
        exit 1
    fi
fi

# Function to create systemd service
create_systemd_service() {
    print_info "Creating systemd service for Hardini backend..."

    SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

    # Create service file
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=${SERVICE_DESCRIPTION}
After=network.target
Wants=network.target

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=${SCRIPT_DIR}
ExecStart=${SCRIPT_DIR}/backend/run-server.sh
Restart=always
RestartSec=5
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

# Security settings
NoNewPrivileges=yes
ProtectHome=yes
ProtectSystem=strict
ReadWritePaths=${SCRIPT_DIR}
PrivateTmp=yes

[Install]
WantedBy=multi-user.target
EOF

    print_success "Systemd service file created: $SERVICE_FILE"

    # Create the runner script
    RUNNER_SCRIPT="${SCRIPT_DIR}/backend/run-server.sh"
    mkdir -p "${SCRIPT_DIR}/backend"

    cat > "$RUNNER_SCRIPT" << 'EOF'
#!/bin/bash

# Infinite loop with auto-restart on failure
while true; do
    echo "$(date '+%Y-%m-%d %H:%M:%S'): Starting Hardini Backend Server..."

    # Change to backend directory and run server
    cd "$(dirname "$0")" 2>/dev/null || exit 1

    # Run the server
    if node server.js; then
        echo "$(date '+%Y-%m-%d %H:%M:%S'): Server exited normally"
    else
        echo "$(date '+%Y-%m-%d %H:%M:%S'): Server crashed with exit code $?"
    fi

    echo "$(date '+%Y-%m-%d %H:%M:%S'): Restarting server in 5 seconds..."
    sleep 5
done
EOF

    chmod +x "$RUNNER_SCRIPT"
    print_success "Runner script created and made executable"

    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable "${SERVICE_NAME}.service"

    print_success "Service installed and enabled!"
    print_info ""
    print_info "Service Management Commands:"
    print_info "  Start service:  sudo systemctl start ${SERVICE_NAME}"
    print_info "  Stop service:   sudo systemctl stop ${SERVICE_NAME}"
    print_info "  Status:         sudo systemctl status ${SERVICE_NAME}"
    print_info "  Logs:           sudo journalctl -u ${SERVICE_NAME} -f"
    print_info "  Restart:        sudo systemctl restart ${SERVICE_NAME}"
    print_info "  Disable:        sudo systemctl disable ${SERVICE_NAME}"
}

# Function to manage service
manage_service() {
    if command -v systemctl &> /dev/null; then
        case "$1" in
            "start")
                print_info "Starting Hardini service..."
                sudo systemctl start "${SERVICE_NAME}.service"
                sleep 2
                sudo systemctl status "${SERVICE_NAME}.service" --no-pager
                ;;
            "stop")
                print_info "Stopping Hardini service..."
                sudo systemctl stop "${SERVICE_NAME}.service"
                ;;
            "restart")
                print_info "Restarting Hardini service..."
                sudo systemctl restart "${SERVICE_NAME}.service"
                sleep 2
                sudo systemctl status "${SERVICE_NAME}.service" --no-pager
                ;;
            "status")
                sudo systemctl status "${SERVICE_NAME}.service" -l
                ;;
            "logs")
                print_info "Showing recent logs (press Ctrl+C to exit):"
                sudo journalctl -u "${SERVICE_NAME}.service" -f --since "1 hour ago"
                ;;
            "uninstall")
                print_warning "Uninstalling Hardini service..."
                sudo systemctl stop "${SERVICE_NAME}.service" 2>/dev/null || true
                sudo systemctl disable "${SERVICE_NAME}.service" 2>/dev/null || true
                sudo rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
                sudo systemctl daemon-reload
                rm -f "${SCRIPT_DIR}/backend/run-server.sh"
                print_success "Service uninstalled completely"
                ;;
            *)
                echo "Usage: $0 {start|stop|restart|status|logs|uninstall}"
                echo "Or: sudo $0 --install (to install as service)"
                ;;
        esac
    else
        print_error "systemctl not found. This script is designed for systems with systemd."
        print_info "On Windows, use: start-hardini-service.ps1"
        exit 1
    fi
}

# Check requirements
print_info "Checking system requirements..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi
print_success "✓ Node.js found"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found!"
    echo "Please run this script from the Hardini app root directory."
    exit 1
fi
print_success "✓ Backend directory found"

# Check if server.js exists
if [ ! -f "backend/server.js" ]; then
    print_error "server.js not found in backend directory!"
    exit 1
fi
print_success "✓ Server file found"

# Main execution
case "$1" in
    "--install")
        create_systemd_service
        ;;
    "start"|"stop"|"restart"|"status"|"logs"|"uninstall")
        manage_service "$1"
        ;;
    *)
        echo "Hardini Permanent Backend Service"
        echo ""
        echo "Usage:"
        echo "  Install as system service (run once): sudo $0 --install"
        echo "  Start service:                        $0 start"
        echo "  Stop service:                         $0 stop"
        echo "  Restart service:                      $0 restart"
        echo "  Check status:                         $0 status"
        echo "  View logs:                           $0 logs"
        echo "  Uninstall service:                   $0 uninstall"
        echo ""
        echo "For Windows: Use start-hardini-service.ps1 instead"
        ;;
esac

print_info ""
print_info "Backend will run on: http://localhost:3001"
print_info "API endpoints:"
print_info "  Health: http://localhost:3001/api/health"
print_info "  Reels:  http://localhost:3001/api/reels"
