#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🔍 Smart Portfolio Advisor - Setup Validation\n');

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

async function checkCommand(command, description) {
    try {
        await execAsync(`which ${command}`);
        colorLog(`✅ ${description}: Available`, 'green');
        return true;
    } catch (error) {
        colorLog(`❌ ${description}: Not found`, 'red');
        return false;
    }
}

async function checkNodeModules() {
    const nodeModulesExists = fs.existsSync('node_modules');
    const packageLockExists = fs.existsSync('package-lock.json');
    
    if (nodeModulesExists && packageLockExists) {
        colorLog('✅ Dependencies: Installed', 'green');
        return true;
    } else if (!nodeModulesExists) {
        colorLog('❌ Dependencies: node_modules not found', 'red');
        return false;
    } else {
        colorLog('⚠️  Dependencies: Partially installed', 'yellow');
        return false;
    }
}

async function validateBrowserCompatibility() {
    colorLog('🌐 Browser Compatibility Check:', 'blue');
    
    // Check if the HTML uses modern features correctly
    try {
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        const jsContent = fs.readFileSync('app.js', 'utf8');
        
        const checks = [
            {
                name: 'DOCTYPE declaration',
                test: htmlContent.includes('<!DOCTYPE html>'),
                importance: 'critical'
            },
            {
                name: 'Viewport meta tag',
                test: htmlContent.includes('viewport'),
                importance: 'important'
            },
            {
                name: 'Chart.js integration',
                test: htmlContent.includes('chart.js') || htmlContent.includes('Chart.js'),
                importance: 'critical'
            },
            {
                name: 'ES6+ features (const/let)',
                test: jsContent.includes('const ') && jsContent.includes('let '),
                importance: 'important'
            },
            {
                name: 'Async/await usage',
                test: jsContent.includes('async ') && jsContent.includes('await '),
                importance: 'modern'
            },
            {
                name: 'CSS Grid/Flexbox',
                test: fs.readFileSync('style.css', 'utf8').includes('grid') || fs.readFileSync('style.css', 'utf8').includes('flex'),
                importance: 'important'
            }
        ];
        
        let criticalPassed = 0;
        let criticalTotal = 0;
        
        checks.forEach(check => {
            const status = check.test ? '✅' : '❌';
            const color = check.test ? 'green' : (check.importance === 'critical' ? 'red' : 'yellow');
            
            colorLog(`${status} ${check.name} (${check.importance})`, color);
            
            if (check.importance === 'critical') {
                criticalTotal++;
                if (check.test) criticalPassed++;
            }
        });
        
        return criticalPassed === criticalTotal;
        
    } catch (error) {
        colorLog(`❌ Browser compatibility check failed: ${error.message}`, 'red');
        return false;
    }
}

async function testApplicationFeatures() {
    colorLog('🧪 Application Feature Tests:', 'blue');
    
    try {
        const jsContent = fs.readFileSync('app.js', 'utf8');
        
        const features = [
            {
                name: 'Portfolio Data Service',
                test: jsContent.includes('PortfolioDataService') && jsContent.includes('calculatePortfolioMetrics')
            },
            {
                name: 'Market Data Service',
                test: jsContent.includes('MarketDataService') && jsContent.includes('getPrice')
            },
            {
                name: 'Chart Integration',
                test: jsContent.includes('Chart') && jsContent.includes('createCharts')
            },
            {
                name: 'Error Handling',
                test: jsContent.includes('try') && jsContent.includes('catch')
            },
            {
                name: 'Event Listeners',
                test: jsContent.includes('addEventListener') || jsContent.includes('onclick')
            },
            {
                name: 'Responsive Design',
                test: fs.readFileSync('style.css', 'utf8').includes('@media')
            }
        ];
        
        let passed = 0;
        
        features.forEach(feature => {
            const status = feature.test ? '✅' : '❌';
            const color = feature.test ? 'green' : 'red';
            
            colorLog(`${status} ${feature.name}`, color);
            if (feature.test) passed++;
        });
        
        const percentage = Math.round((passed / features.length) * 100);
        colorLog(`📊 Feature coverage: ${passed}/${features.length} (${percentage}%)`, percentage >= 80 ? 'green' : 'yellow');
        
        return percentage >= 80;
        
    } catch (error) {
        colorLog(`❌ Feature test failed: ${error.message}`, 'red');
        return false;
    }
}

async function checkPerformance() {
    colorLog('⚡ Performance Checks:', 'blue');
    
    try {
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        const cssContent = fs.readFileSync('style.css', 'utf8');
        const jsContent = fs.readFileSync('app.js', 'utf8');
        
        const checks = [
            {
                name: 'HTML file size',
                test: htmlContent.length < 50000, // 50KB
                value: `${Math.round(htmlContent.length / 1024)}KB`
            },
            {
                name: 'CSS file size',
                test: cssContent.length < 100000, // 100KB
                value: `${Math.round(cssContent.length / 1024)}KB`
            },
            {
                name: 'JS file size',
                test: jsContent.length < 200000, // 200KB
                value: `${Math.round(jsContent.length / 1024)}KB`
            },
            {
                name: 'External dependencies',
                test: (htmlContent.match(/https?:\/\//g) || []).length < 5,
                value: `${(htmlContent.match(/https?:\/\//g) || []).length} external URLs`
            }
        ];
        
        let passed = 0;
        
        checks.forEach(check => {
            const status = check.test ? '✅' : '⚠️';
            const color = check.test ? 'green' : 'yellow';
            
            colorLog(`${status} ${check.name}: ${check.value}`, color);
            if (check.test) passed++;
        });
        
        return passed >= 3;
        
    } catch (error) {
        colorLog(`❌ Performance check failed: ${error.message}`, 'red');
        return false;
    }
}

async function generateReport(results) {
    colorLog('📋 Validation Report:', 'magenta');
    console.log();
    
    const categories = [
        { name: 'System Requirements', result: results.system },
        { name: 'Dependencies', result: results.dependencies },
        { name: 'Browser Compatibility', result: results.browser },
        { name: 'Application Features', result: results.features },
        { name: 'Performance', result: results.performance }
    ];
    
    let passed = 0;
    
    categories.forEach(category => {
        const status = category.result ? '✅' : '❌';
        const color = category.result ? 'green' : 'red';
        
        colorLog(`${status} ${category.name}`, color);
        if (category.result) passed++;
    });
    
    console.log();
    
    const overallScore = Math.round((passed / categories.length) * 100);
    
    if (overallScore >= 80) {
        colorLog(`🎉 Overall Score: ${overallScore}% - Excellent!`, 'green');
        colorLog('✨ Your Smart Portfolio Advisor is ready for production!', 'cyan');
    } else if (overallScore >= 60) {
        colorLog(`👍 Overall Score: ${overallScore}% - Good`, 'yellow');
        colorLog('🔧 Some improvements recommended, but application should work.', 'cyan');
    } else {
        colorLog(`⚠️  Overall Score: ${overallScore}% - Needs Attention`, 'red');
        colorLog('🛠️  Please address the issues above before deploying.', 'cyan');
    }
    
    return overallScore >= 60;
}

// Main validation function
async function runValidation() {
    colorLog('Starting comprehensive setup validation...', 'cyan');
    console.log();
    
    const results = {};
    
    // System requirements
    colorLog('💻 System Requirements:', 'blue');
    const nodeAvailable = await checkCommand('node', 'Node.js');
    const npmAvailable = await checkCommand('npm', 'NPM');
    results.system = nodeAvailable && npmAvailable;
    console.log();
    
    // Dependencies
    colorLog('📦 Dependencies:', 'blue');
    results.dependencies = await checkNodeModules();
    console.log();
    
    // Browser compatibility
    results.browser = await validateBrowserCompatibility();
    console.log();
    
    // Application features
    results.features = await testApplicationFeatures();
    console.log();
    
    // Performance
    results.performance = await checkPerformance();
    console.log();
    
    // Generate final report
    const success = await generateReport(results);
    
    console.log();
    colorLog('💡 Next Steps:', 'cyan');
    
    if (success) {
        colorLog('🚀 Run "npm start" to launch your application', 'green');
        colorLog('🌐 Run "npm run dev" for development with live reload', 'green');
    } else {
        colorLog('📋 Fix the issues mentioned above', 'yellow');
        colorLog('🔄 Run "npm run validate" again after fixes', 'yellow');
        
        if (!results.dependencies) {
            colorLog('💡 Try: npm install', 'cyan');
        }
    }
    
    return success;
}

// Run validation
if (require.main === module) {
    runValidation().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        colorLog(`💥 Validation failed: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runValidation };
