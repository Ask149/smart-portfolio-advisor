# Smart Portfolio Advisor - Setup Guide

This guide provides comprehensive setup instructions for the Smart Portfolio Advisor application across different operating systems and environments.

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: Version 14.0.0 or higher
- **NPM**: Version 6.0.0 or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 100MB for application and dependencies
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended Environment
- **Node.js**: Latest LTS version (18.x or 20.x)
- **NPM**: Latest stable version
- **RAM**: 8GB or more
- **Storage**: 500MB free space
- **Internet**: Stable connection for CDN resources

## 🚀 Quick Setup Options

### Option 1: Automated Setup (Recommended)

The easiest way to get started is using our automated setup scripts:

#### macOS/Linux
```bash
git clone https://github.com/Ask149/smart-portfolio-advisor.git
cd smart-portfolio-advisor
./setup.sh
```

#### Windows
```cmd
git clone https://github.com/Ask149/smart-portfolio-advisor.git
cd smart-portfolio-advisor
setup.bat
```

### Option 2: Manual Setup

If you prefer manual control over the setup process:

#### Step 1: Clone Repository
```bash
git clone https://github.com/Ask149/smart-portfolio-advisor.git
cd smart-portfolio-advisor
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Verify Installation
```bash
npm run health-check
npm run validate
```

#### Step 4: Start Application
```bash
npm start
```

## 🛠️ Platform-Specific Instructions

### macOS Setup

#### Prerequisites
1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js via Homebrew**:
   ```bash
   brew install node
   ```

3. **Verify Installation**:
   ```bash
   node --version
   npm --version
   ```

#### Alternative: Direct Download
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the macOS installer
3. Run the installer and follow instructions

### Windows Setup

#### Prerequisites
1. **Download Node.js**:
   - Visit [nodejs.org](https://nodejs.org/)
   - Download the Windows installer (.msi)
   - Run installer as Administrator

2. **Verify Installation**:
   ```cmd
   node --version
   npm --version
   ```

#### Alternative: Chocolatey
If you have Chocolatey installed:
```cmd
choco install nodejs
```

#### Alternative: Winget
If you have Windows Package Manager:
```cmd
winget install OpenJS.NodeJS
```

### Linux Setup

#### Ubuntu/Debian
```bash
# Update package index
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

#### CentOS/RHEL/Fedora
```bash
# CentOS/RHEL
sudo yum install nodejs npm

# Fedora
sudo dnf install nodejs npm
```

#### Arch Linux
```bash
sudo pacman -S nodejs npm
```

#### Alternative: NodeSource Repository
For latest versions:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🔧 Development Environment Setup

### Visual Studio Code (Recommended)

1. **Install VS Code**:
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

2. **Recommended Extensions**:
   ```bash
   # Install via command palette (Ctrl+Shift+P)
   ext install ms-vscode.vscode-javascript
   ext install bradlc.vscode-tailwindcss
   ext install esbenp.prettier-vscode
   ext install ms-vscode.live-server
   ```

3. **Workspace Settings**:
   Create `.vscode/settings.json`:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "liveServer.settings.port": 8080,
     "javascript.suggest.autoImports": true
   }
   ```

### Alternative Editors

#### WebStorm
1. Open project folder
2. Configure Node.js interpreter
3. Enable code formatting

#### Sublime Text
1. Install Package Control
2. Install SublimeLinter
3. Configure JavaScript linting

## 🐳 Docker Setup (Optional)

For containerized development:

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 8080

CMD ["npm", "start"]
```

### Build and Run
```bash
docker build -t smart-portfolio-advisor .
docker run -p 8080:8080 smart-portfolio-advisor
```

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

Run with:
```bash
docker-compose up
```

## 🌐 Browser Configuration

### Chrome Setup
1. Enable Developer Tools
2. Install extensions:
   - Vue.js devtools (if using Vue)
   - React DevTools (if using React)
   - LiveReload

### Firefox Setup
1. Enable Developer Tools
2. Install Firebug (optional)
3. Configure network settings for localhost

### Safari Setup (macOS)
1. Enable Develop menu
2. Allow localhost connections
3. Clear cache regularly during development

## 🧪 Testing Your Setup

### Health Check
Run the comprehensive health check:
```bash
npm run health-check
```

This checks:
- Node.js version compatibility
- NPM functionality
- File structure integrity
- Dependency availability

### Validation Tests
Run validation tests:
```bash
npm run validate
```

This validates:
- Browser compatibility
- Application features
- Performance metrics
- Code quality

### Manual Verification
1. **Start the application**:
   ```bash
   npm start
   ```

2. **Check browser access**:
   - Open `http://localhost:8080`
   - Verify demo banner appears
   - Test basic navigation

3. **Verify features**:
   - Portfolio setup wizard
   - Chart rendering
   - Responsive design

## 🚨 Troubleshooting

### Common Issues

#### Node.js Version Conflicts
```bash
# Check current version
node --version

# Use nvm to manage versions (Unix/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Use nvm-windows for Windows
# Download from: https://github.com/coreybutler/nvm-windows
```

#### NPM Permission Issues (Unix/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use different port
npm start -- --port 3000
```

#### Package Installation Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use alternative registry
npm install --registry https://registry.npmjs.org/
```

### Windows-Specific Issues

#### Execution Policy (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Path Issues
Add Node.js to PATH:
1. Open System Properties
2. Click Environment Variables
3. Add Node.js installation path to PATH

### macOS-Specific Issues

#### Permission Denied
```bash
# Fix permissions
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Xcode Command Line Tools
```bash
xcode-select --install
```

### Linux-Specific Issues

#### Missing Build Tools
```bash
# Ubuntu/Debian
sudo apt install build-essential

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
```

## 📊 Performance Optimization

### Development Mode
For faster development:
```bash
npm run dev
```

This enables:
- Live reload
- Source maps
- Development error messages
- Hot module replacement

### Production Mode
For deployment:
```bash
npm start
```

This provides:
- Optimized bundles
- Compressed assets
- Error handling
- Performance monitoring

## 🔐 Security Considerations

### Local Development
- Application runs on localhost only
- No external API calls in demo mode
- All data is client-side

### Production Deployment
- Use HTTPS in production
- Implement CSP headers
- Validate all inputs
- Regular security updates

## 📱 Mobile Development

### Testing on Mobile Devices
1. **Find your local IP**:
   ```bash
   # macOS/Linux
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```

2. **Access from mobile**:
   - Connect to same WiFi network
   - Visit `http://YOUR-IP:8080`

### Responsive Testing
- Use browser dev tools
- Test various screen sizes
- Verify touch interactions

## 🌟 Next Steps

After successful setup:

1. **Explore the application**:
   - Complete the portfolio wizard
   - Examine the dashboard
   - Try different features

2. **Customize for your needs**:
   - Modify demo data
   - Adjust styling
   - Add new features

3. **Deploy to production**:
   - Choose hosting platform
   - Configure domain
   - Set up analytics

## 🆘 Getting Help

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Search existing GitHub issues**
3. **Create a new issue with**:
   - Operating system details
   - Node.js/NPM versions
   - Error messages
   - Steps to reproduce

**Happy coding! 🚀**
