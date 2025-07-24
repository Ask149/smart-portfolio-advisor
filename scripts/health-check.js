#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏥 Smart Portfolio Advisor - Health Check\n');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    const color = exists ? 'green' : 'red';
    
    colorLog(`${status} ${description}: ${filePath}`, color);
    return exists;
}

function checkFileContent(filePath, description, requiredContent = []) {
    if (!fs.existsSync(filePath)) {
        colorLog(`❌ ${description}: File not found`, 'red');
        return false;
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (requiredContent.length === 0) {
            colorLog(`✅ ${description}: File exists and readable`, 'green');
            return true;
        }
        
        const missing = requiredContent.filter(item => !content.includes(item));
        
        if (missing.length === 0) {
            colorLog(`✅ ${description}: All required content found`, 'green');
            return true;
        } else {
            colorLog(`⚠️  ${description}: Missing content: ${missing.join(', ')}`, 'yellow');
            return false;
        }
    } catch (error) {
        colorLog(`❌ ${description}: Error reading file - ${error.message}`, 'red');
        return false;
    }
}

function checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.substring(1).split('.')[0]);
    
    if (majorVersion >= 14) {
        colorLog(`✅ Node.js version: ${version} (>= 14.0.0)`, 'green');
        return true;
    } else {
        colorLog(`❌ Node.js version: ${version} (requires >= 14.0.0)`, 'red');
        return false;
    }
}

function checkDirectoryStructure() {
    const requiredDirs = [
        'scripts'
    ];
    
    let allGood = true;
    
    requiredDirs.forEach(dir => {
        const exists = fs.existsSync(dir);
        const status = exists ? '✅' : '❌';
        const color = exists ? 'green' : 'red';
        
        colorLog(`${status} Directory: ${dir}`, color);
        if (!exists) allGood = false;
    });
    
    return allGood;
}

// Main health check
async function runHealthCheck() {
    colorLog('Starting comprehensive health check...', 'cyan');
    console.log();
    
    let overallHealth = true;
    
    // Check Node.js version
    colorLog('📋 System Requirements:', 'blue');
    overallHealth &= checkNodeVersion();
    console.log();
    
    // Check directory structure
    colorLog('📁 Directory Structure:', 'blue');
    overallHealth &= checkDirectoryStructure();
    console.log();
    
    // Check core files
    colorLog('📄 Core Application Files:', 'blue');
    overallHealth &= checkFile('index.html', 'Main HTML file');
    overallHealth &= checkFile('app.js', 'Main JavaScript file');
    overallHealth &= checkFile('style.css', 'Main CSS file');
    overallHealth &= checkFile('README.md', 'Documentation');
    overallHealth &= checkFile('LICENSE', 'License file');
    overallHealth &= checkFile('package.json', 'Package configuration');
    console.log();
    
    // Check HTML content
    colorLog('🔍 Content Validation:', 'blue');
    overallHealth &= checkFileContent('index.html', 'HTML structure', [
        '<!DOCTYPE html>',
        'Chart.js',
        'Smart Portfolio Advisor'
    ]);
    
    overallHealth &= checkFileContent('app.js', 'JavaScript functionality', [
        'PortfolioDataService',
        'MarketDataService',
        'Chart'
    ]);
    
    overallHealth &= checkFileContent('style.css', 'CSS styling', [
        ':root',
        '.card',
        'responsive'
    ]);
    console.log();
    
    // Check package.json structure
    colorLog('📦 Package Configuration:', 'blue');
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        const requiredFields = ['name', 'version', 'scripts', 'description'];
        const missingFields = requiredFields.filter(field => !packageJson[field]);
        
        if (missingFields.length === 0) {
            colorLog('✅ Package.json: All required fields present', 'green');
        } else {
            colorLog(`❌ Package.json: Missing fields: ${missingFields.join(', ')}`, 'red');
            overallHealth = false;
        }
        
        // Check scripts
        const requiredScripts = ['start', 'serve', 'dev'];
        const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
        
        if (missingScripts.length === 0) {
            colorLog('✅ NPM Scripts: All required scripts present', 'green');
        } else {
            colorLog(`❌ NPM Scripts: Missing: ${missingScripts.join(', ')}`, 'red');
            overallHealth = false;
        }
        
    } catch (error) {
        colorLog(`❌ Package.json: Invalid JSON - ${error.message}`, 'red');
        overallHealth = false;
    }
    console.log();
    
    // Final report
    colorLog('📊 Health Check Summary:', 'magenta');
    if (overallHealth) {
        colorLog('🎉 All checks passed! Your Smart Portfolio Advisor is ready to run.', 'green');
        colorLog('💡 Run "npm start" to launch the application.', 'cyan');
    } else {
        colorLog('⚠️  Some issues were found. Please address them before running the application.', 'yellow');
        colorLog('💡 Check the detailed output above for specific issues.', 'cyan');
    }
    console.log();
    
    return overallHealth;
}

// Run the health check
if (require.main === module) {
    runHealthCheck().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        colorLog(`💥 Health check failed: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runHealthCheck, checkFile, checkFileContent };
