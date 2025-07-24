#!/bin/bash

# Smart Portfolio Advisor - Automated Setup Script
# Compatible with macOS and Linux

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to print section headers
print_header() {
    echo
    print_color $CYAN "=========================================="
    print_color $CYAN "$1"
    print_color $CYAN "=========================================="
    echo
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        local version=$(node --version)
        local major_version=$(echo $version | cut -d'.' -f1 | sed 's/v//')
        
        if [ "$major_version" -ge 14 ]; then
            print_color $GREEN "✅ Node.js $version (>= 14.0.0 required)"
            return 0
        else
            print_color $RED "❌ Node.js $version is too old (>= 14.0.0 required)"
            return 1
        fi
    else
        print_color $RED "❌ Node.js not found"
        return 1
    fi
}

# Function to install Node.js
install_nodejs() {
    print_color $YELLOW "🔧 Installing Node.js..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            print_color $BLUE "Using Homebrew to install Node.js..."
            brew install node
        else
            print_color $YELLOW "Homebrew not found. Please install Node.js manually from https://nodejs.org/"
            print_color $YELLOW "Or install Homebrew first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists apt-get; then
            # Ubuntu/Debian
            print_color $BLUE "Using apt to install Node.js..."
            sudo apt-get update
            sudo apt-get install -y nodejs npm
        elif command_exists yum; then
            # CentOS/RHEL
            print_color $BLUE "Using yum to install Node.js..."
            sudo yum install -y nodejs npm
        elif command_exists dnf; then
            # Fedora
            print_color $BLUE "Using dnf to install Node.js..."
            sudo dnf install -y nodejs npm
        else
            print_color $YELLOW "Package manager not recognized. Please install Node.js manually from https://nodejs.org/"
            exit 1
        fi
    else
        print_color $YELLOW "OS not recognized. Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
}

# Function to setup the project
setup_project() {
    print_color $BLUE "📦 Installing project dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_color $RED "❌ package.json not found. Are you in the right directory?"
        exit 1
    fi
    
    # Install dependencies
    npm install
    
    if [ $? -eq 0 ]; then
        print_color $GREEN "✅ Dependencies installed successfully"
    else
        print_color $RED "❌ Failed to install dependencies"
        exit 1
    fi
}

# Function to run health checks
run_health_check() {
    print_color $BLUE "🏥 Running health checks..."
    
    if [ -f "scripts/health-check.js" ]; then
        npm run health-check
    else
        print_color $YELLOW "⚠️  Health check script not found, skipping..."
    fi
}

# Function to run validation
run_validation() {
    print_color $BLUE "🔍 Running setup validation..."
    
    if [ -f "scripts/validate-setup.js" ]; then
        npm run validate
    else
        print_color $YELLOW "⚠️  Validation script not found, skipping..."
    fi
}

# Function to display completion message
show_completion() {
    print_header "🎉 Setup Complete!"
    
    print_color $GREEN "Your Smart Portfolio Advisor is ready to use!"
    echo
    print_color $CYAN "📋 Available Commands:"
    print_color $WHITE "  npm start          - Launch the application"
    print_color $WHITE "  npm run dev        - Start development server with live reload"
    print_color $WHITE "  npm run health-check - Check system health"
    print_color $WHITE "  npm run validate   - Validate setup"
    print_color $WHITE "  npm test           - Run all tests"
    echo
    print_color $CYAN "🚀 Quick Start:"
    print_color $YELLOW "  npm start"
    echo
    print_color $CYAN "🌐 The application will open automatically in your default browser"
    print_color $CYAN "   or visit: http://localhost:8080"
    echo
}

# Function to handle errors
handle_error() {
    print_color $RED "❌ Setup failed at: $1"
    print_color $YELLOW "💡 Troubleshooting tips:"
    print_color $WHITE "  - Ensure you have internet connectivity"
    print_color $WHITE "  - Try running with sudo if permission issues occur"
    print_color $WHITE "  - Check if you're in the correct directory"
    print_color $WHITE "  - Manually install Node.js from https://nodejs.org/"
    echo
    print_color $CYAN "🆘 Need help? Check the README.md or open an issue on GitHub"
    exit 1
}

# Main setup function
main() {
    print_header "🚀 Smart Portfolio Advisor Setup"
    
    print_color $BLUE "🔍 Checking system requirements..."
    
    # Check and install Node.js if needed
    if ! check_node_version; then
        print_color $YELLOW "📥 Node.js installation required"
        read -p "$(print_color $CYAN "Install Node.js automatically? (y/n): ")" -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_nodejs || handle_error "Node.js installation"
            check_node_version || handle_error "Node.js version verification"
        else
            print_color $YELLOW "Please install Node.js manually and run this script again"
            exit 1
        fi
    fi
    
    # Check npm
    if command_exists npm; then
        local npm_version=$(npm --version)
        print_color $GREEN "✅ npm $npm_version"
    else
        print_color $RED "❌ npm not found"
        handle_error "npm not available"
    fi
    
    # Setup project
    setup_project || handle_error "Project setup"
    
    # Run health check
    run_health_check
    
    # Run validation
    run_validation
    
    # Show completion message
    show_completion
    
    # Ask if user wants to start the application
    echo
    read -p "$(print_color $CYAN "Would you like to start the application now? (y/n): ")" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_color $GREEN "🚀 Starting Smart Portfolio Advisor..."
        npm start
    else
        print_color $BLUE "👍 Setup complete! Run 'npm start' when you're ready."
    fi
}

# Trap errors
trap 'handle_error "Unknown error"' ERR

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "index.html" ]; then
    print_color $RED "❌ This doesn't appear to be the Smart Portfolio Advisor directory"
    print_color $YELLOW "Please navigate to the project directory and run this script again"
    exit 1
fi

# Run main function
main "$@"
