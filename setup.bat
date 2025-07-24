@echo off
setlocal enabledelayedexpansion

:: Smart Portfolio Advisor - Automated Setup Script for Windows
:: Compatible with Windows 10/11 and Windows Server

title Smart Portfolio Advisor Setup

:: Color codes (using built-in Windows color command)
set "RED=color 0C"
set "GREEN=color 0A"
set "YELLOW=color 0E"
set "BLUE=color 0B"
set "CYAN=color 0B"
set "WHITE=color 0F"
set "RESET=color 07"

:: Function to print section headers
:print_header
echo.
echo ==========================================
echo %~1
echo ==========================================
echo.
goto :eof

:: Function to check if command exists
:command_exists
where %1 >nul 2>&1
goto :eof

:: Function to check Node.js version
:check_node_version
call :command_exists node
if errorlevel 1 (
    echo ❌ Node.js not found
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:v=%
for /f "tokens=1 delims=." %%a in ("%NODE_VERSION%") do set MAJOR_VERSION=%%a

if %MAJOR_VERSION% geq 14 (
    echo ✅ Node.js v%NODE_VERSION% ^(^>= 14.0.0 required^)
    exit /b 0
) else (
    echo ❌ Node.js v%NODE_VERSION% is too old ^(^>= 14.0.0 required^)
    exit /b 1
)

:: Function to install Node.js
:install_nodejs
echo 🔧 Installing Node.js...
echo.
echo This will open the Node.js download page in your browser.
echo Please download and install Node.js, then run this script again.
echo.
pause
start https://nodejs.org/
exit /b 1

:: Function to setup the project
:setup_project
echo 📦 Installing project dependencies...

if not exist "package.json" (
    echo ❌ package.json not found. Are you in the right directory?
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
) else (
    echo ✅ Dependencies installed successfully
)
goto :eof

:: Function to run health checks
:run_health_check
echo 🏥 Running health checks...

if exist "scripts\health-check.js" (
    call npm run health-check
) else (
    echo ⚠️  Health check script not found, skipping...
)
goto :eof

:: Function to run validation
:run_validation
echo 🔍 Running setup validation...

if exist "scripts\validate-setup.js" (
    call npm run validate
) else (
    echo ⚠️  Validation script not found, skipping...
)
goto :eof

:: Function to display completion message
:show_completion
call :print_header "🎉 Setup Complete!"

echo ✅ Your Smart Portfolio Advisor is ready to use!
echo.
echo 📋 Available Commands:
echo   npm start          - Launch the application
echo   npm run dev        - Start development server with live reload
echo   npm run health-check - Check system health
echo   npm run validate   - Validate setup
echo   npm test           - Run all tests
echo.
echo 🚀 Quick Start:
echo   npm start
echo.
echo 🌐 The application will open automatically in your default browser
echo    or visit: http://localhost:8080
echo.
goto :eof

:: Function to handle errors
:handle_error
%RED%
echo ❌ Setup failed at: %~1
%YELLOW%
echo 💡 Troubleshooting tips:
%WHITE%
echo   - Ensure you have internet connectivity
echo   - Run Command Prompt as Administrator if permission issues occur
echo   - Check if you're in the correct directory
echo   - Manually install Node.js from https://nodejs.org/
echo.
%CYAN%
echo 🆘 Need help? Check the README.md or open an issue on GitHub
%RESET%
exit /b 1

:: Main setup function
:main
%RESET%
call :print_header "🚀 Smart Portfolio Advisor Setup"

echo 🔍 Checking system requirements...

:: Check Node.js
call :check_node_version
if errorlevel 1 (
    echo.
    echo 📥 Node.js installation required
    echo.
    set /p "INSTALL_NODE=Install Node.js now? (y/n): "
    
    if /i "!INSTALL_NODE!"=="y" (
        call :install_nodejs
        if errorlevel 1 call :handle_error "Node.js installation"
    ) else (
        echo Please install Node.js manually and run this script again
        pause
        exit /b 1
    )
)

:: Check npm
call :command_exists npm
if errorlevel 1 (
    echo ❌ npm not found
    call :handle_error "npm not available"
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm v!NPM_VERSION!
)

:: Setup project
call :setup_project
if errorlevel 1 call :handle_error "Project setup"

:: Run health check
call :run_health_check

:: Run validation
call :run_validation

:: Show completion message
call :show_completion

:: Ask if user wants to start the application
echo.
set /p "START_NOW=Would you like to start the application now? (y/n): "

if /i "!START_NOW!"=="y" (
    echo 🚀 Starting Smart Portfolio Advisor...
    call npm start
) else (
    echo 👍 Setup complete! Run 'npm start' when you're ready.
)

goto :eof

:: Check if we're in the right directory
if not exist "package.json" (
    %RED%
    echo ❌ This doesn't appear to be the Smart Portfolio Advisor directory
    %YELLOW%
    echo Please navigate to the project directory and run this script again
    %RESET%
    pause
    exit /b 1
)

if not exist "index.html" (
    %RED%
    echo ❌ This doesn't appear to be the Smart Portfolio Advisor directory
    %YELLOW%
    echo Please navigate to the project directory and run this script again
    %RESET%
    pause
    exit /b 1
)

:: Run main function
call :main

:: Keep window open on error
if errorlevel 1 pause

endlocal
