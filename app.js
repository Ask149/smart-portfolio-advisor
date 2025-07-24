// Smart Portfolio Advisor - Demo Application
// A comprehensive portfolio management tool showcasing financial application development

// Application State
let portfolioData = null;
let configStatus = { isExample: true, source: 'demo', initialized: false };
let migrationService = null;
let currentStep = 1;
let charts = {};
let priceUpdateInterval = null;

// Market data service with caching
class MarketDataService {
    constructor() {
        this.fallbackData = {
            'MSFT': 425.50, 'VOO': 583.34, 'NVDA': 172.84, 'ARKK': 77.00,
            'GOOGL': 194.38, 'TEM': 64.10, 'XLE': 86.61, 'QQQM': 95.25,
            'PLTR': 42.15, 'AAPL': 225.75, 'AMZN': 185.25, 'VTI': 285.60,
            'VXUS': 68.45, 'VB': 245.30, 'SPY': 582.90, 'QQQ': 520.75
        };
    }

    async getPrice(symbol) {
        try {
            // In a real implementation, this would fetch from an API
            // For demo purposes, use realistic but fictional data
            const basePrice = this.fallbackData[symbol] || 100;
            // Add small random variation to simulate market movement
            const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
            return basePrice * (1 + variation);
        } catch (error) {
            console.warn(`MarketDataService: Failed to get price for ${symbol}, using fallback`, error);
            return this.fallbackData[symbol] || 100;
        }
    }

    async getPrices(symbols) {
        const prices = {};
        for (const symbol of symbols) {
            prices[symbol] = await this.getPrice(symbol);
        }
        return prices;
    }
}

// Portfolio Data Service
class PortfolioDataService {
    constructor() {
        this.marketDataService = new MarketDataService();
    }

    async initialize() {
        console.log('PortfolioDataService: Initializing demo mode...');
        try {
            portfolioData = this.createDemoPortfolio();
            configStatus = { isExample: true, source: 'demo', initialized: true };
            await this.calculatePortfolioMetrics();
            return true;
        } catch (error) {
            console.error('Initialization failed:', error);
            portfolioData = this.createMinimalPortfolio();
            configStatus = { isExample: true, source: 'emergency', initialized: false };
            return false;
        }
    }

    createDemoPortfolio() {
        return {
            platforms: {
                robinhood: {
                    cash: 2500.00,
                    holdings: [
                        { symbol: "VOO", shares: 5.0, avgCost: 583.34, description: "Vanguard S&P 500 ETF" },
                        { symbol: "NVDA", shares: 2.0, avgCost: 172.84, description: "NVIDIA Corporation" },
                        { symbol: "ARKK", shares: 3.0, avgCost: 77.00, description: "ARK Innovation ETF" },
                        { symbol: "GOOGL", shares: 2.5, avgCost: 194.38, description: "Alphabet Inc" },
                        { symbol: "MSFT", shares: 8.0, avgCost: 425.50, description: "Microsoft Corporation" }
                    ]
                },
                fidelity: {
                    msftESPP: { shares: 15.0, avgCost: 380.00, description: "Employee Stock Purchase Plan" },
                    holdings: []
                },
                retirement401k: {
                    totalBalance: 25000.00,
                    employerMatch: 2000.00,
                    funds: [{ name: "Target Date 2060 Fund", allocation: 100, description: "Diversified retirement fund" }]
                },
                msftRSU: {
                    shares: 5.0,
                    avgCost: 425.50,
                    description: "Restricted Stock Units"
                }
            },
            settings: {
                monthlyInvestment: 500,
                riskTolerance: 'moderate',
                investmentTimeline: 'medium',
                specialConsiderations: {
                    employerStock: "MSFT",
                    concentrationThreshold: 30,
                    timelineMonths: 24
                }
            },
            calculated: {
                totalValue: 0,
                msftConcentration: 0,
                diversificationScore: 0,
                platformBreakdown: {},
                dailyChange: 0,
                lastUpdated: null
            }
        };
    }

    createMinimalPortfolio() {
        return {
            platforms: {
                robinhood: { cash: 1000, holdings: [] },
                fidelity: { msftESPP: { shares: 0, avgCost: 0 }, holdings: [] },
                retirement401k: { totalBalance: 10000, employerMatch: 500, funds: [] },
                msftRSU: { shares: 0, avgCost: 0 }
            },
            settings: { monthlyInvestment: 500, riskTolerance: 'moderate', investmentTimeline: 'medium' },
            calculated: { totalValue: 0, msftConcentration: 0, diversificationScore: 0, platformBreakdown: {}, dailyChange: 0, lastUpdated: null }
        };
    }

    async calculatePortfolioMetrics() {
        if (!portfolioData || !this.marketDataService) return;
        
        let totalValue = 0, msftValue = 0;
        const platformBreakdown = {};
        
        try {
            // Get all required stock prices
            const allSymbols = [
                ...portfolioData.platforms.robinhood.holdings.map(h => h.symbol),
                'MSFT' // Always include MSFT for calculations
            ];
            const prices = await this.marketDataService.getPrices([...new Set(allSymbols)]);
            
            // Robinhood
            let robinhoodValue = portfolioData.platforms.robinhood.cash;
            portfolioData.platforms.robinhood.holdings.forEach(holding => {
                const currentPrice = prices[holding.symbol] || holding.avgCost;
                const value = holding.shares * currentPrice;
                robinhoodValue += value;
                if (holding.symbol === 'MSFT') msftValue += value;
            });
            platformBreakdown.robinhood = robinhoodValue;
            totalValue += robinhoodValue;
            
            // Fidelity ESPP
            const msftPrice = prices.MSFT || 425.50;
            const esppValue = portfolioData.platforms.fidelity.msftESPP.shares * msftPrice;
            msftValue += esppValue;
            platformBreakdown.fidelity = esppValue;
            totalValue += esppValue;
            
            // 401k
            platformBreakdown.retirement401k = portfolioData.platforms.retirement401k.totalBalance;
            totalValue += portfolioData.platforms.retirement401k.totalBalance;
            
            // RSU
            const rsuValue = portfolioData.platforms.msftRSU.shares * msftPrice;
            msftValue += rsuValue;
            platformBreakdown.msftRSU = rsuValue;
            totalValue += rsuValue;
            
            portfolioData.calculated = {
                ...portfolioData.calculated,
                totalValue,
                msftConcentration: totalValue > 0 ? (msftValue / totalValue) * 100 : 0,
                diversificationScore: Math.min(10, Math.max(1, new Set([
                    ...portfolioData.platforms.robinhood.holdings.map(h => h.symbol),
                    ...(portfolioData.platforms.fidelity.msftESPP.shares > 0 ? ['MSFT'] : []),
                    ...(portfolioData.platforms.msftRSU.shares > 0 ? ['MSFT'] : []),
                    ...(portfolioData.platforms.retirement401k.totalBalance > 0 ? ['401K'] : [])
                ]).size * 1.5)),
                platformBreakdown,
                msftValue,
                lastUpdated: new Date().toISOString(),
                dailyChange: (Math.random() - 0.5) * 2, // Random daily change for demo
                pricesUsed: prices
            };
            
            console.log('PortfolioDataService: Demo metrics calculated', { totalValue, msftConcentration: portfolioData.calculated.msftConcentration });
        } catch (error) {
            console.error('PortfolioDataService: Failed to calculate metrics', error);
        }
    }

    async savePortfolioData() {
        // In demo mode, just log the save operation
        console.log('Portfolio data saved (demo mode)');
    }
}

// Initialize services
const portfolioDataService = new PortfolioDataService();

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function formatPercentage(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function showNotification(message, type = 'info') {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const notification = document.createElement('div');
    notification.style.cssText = `position:fixed;top:20px;right:20px;z-index:1000;background:white;border:1px solid #ddd;border-radius:8px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:400px;color:#333;font-weight:500;`;
    notification.innerHTML = `<span style="color:#333;">${icons[type]} ${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

// Status Update Functions
function updateDatabaseStatus(status = 'Demo Mode') {
    const elements = [
        { id: 'dbStatus', text: `📊 Status: ${status}` },
        { id: 'dataSourceIndicator', text: 'Demo Data' },
        { id: 'portfolioDataSource', text: 'Demo Portfolio' }
    ];
    elements.forEach(({ id, text }) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });
}

// Portfolio Setup Functions
async function setupPortfolio() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('portfolioSetup').classList.remove('hidden');
    updateProgressBar();
    await populateActualData();
}

async function populateActualData() {
    if (!portfolioData) return;
    
    const fields = [
        ['robinhoodCash', portfolioData.platforms.robinhood.cash],
        ['msftESPPShares', portfolioData.platforms.fidelity.msftESPP.shares],
        ['msftESPPCost', portfolioData.platforms.fidelity.msftESPP.avgCost],
        ['total401k', portfolioData.platforms.retirement401k.totalBalance],
        ['employerMatch', portfolioData.platforms.retirement401k.employerMatch],
        ['msftRSUShares', portfolioData.platforms.msftRSU.shares],
        ['monthlyInvestment', portfolioData.settings.monthlyInvestment]
    ];
    
    fields.forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    });
    
    // Populate holdings
    const container = document.getElementById('robinhoodHoldings');
    if (container) {
        container.innerHTML = '';
        portfolioData.platforms.robinhood.holdings.forEach(holding => {
            addHolding('robinhood');
            const lastInput = container.lastElementChild;
            lastInput.querySelector('.symbol-input').value = holding.symbol;
            lastInput.querySelector('.shares-input').value = holding.shares;
            lastInput.querySelector('.cost-input').value = holding.avgCost;
        });
    }
}

function changeStep(direction) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep = Math.max(1, Math.min(4, currentStep + direction));
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgressBar();
    updateNavigationButtons();
}

function updateProgressBar() {
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (fill) fill.style.width = `${(currentStep / 4) * 100}%`;
    if (text) text.textContent = `Step ${currentStep} of 4`;
}

function updateNavigationButtons() {
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const finish = document.getElementById('finishBtn');
    
    if (prev) prev.disabled = currentStep === 1;
    if (next) next.classList.toggle('hidden', currentStep === 4);
    if (finish) finish.classList.toggle('hidden', currentStep !== 4);
}

function addHolding(platform) {
    const container = document.getElementById(`${platform}Holdings`);
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'holding-input';
    div.innerHTML = `
        <div class="form-group">
            <label class="form-label">Symbol</label>
            <input type="text" class="form-control symbol-input" placeholder="AAPL">
        </div>
        <div class="form-group">
            <label class="form-label">Shares</label>
            <input type="number" class="form-control shares-input" placeholder="10" step="0.01">
        </div>
        <div class="form-group">
            <label class="form-label">Avg Cost ($)</label>
            <input type="number" class="form-control cost-input" placeholder="225.75" step="0.01">
        </div>
        <button type="button" class="btn btn--outline btn--sm" onclick="removeHolding(this)">×</button>
    `;
    container.appendChild(div);
}

function removeHolding(button) {
    button.parentElement.remove();
}

function addFund() {
    const container = document.getElementById('retirementFunds');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'fund-input';
    div.innerHTML = `
        <div class="form-group">
            <label class="form-label">Fund Name</label>
            <input type="text" class="form-control fund-name" placeholder="Target Date 2060 Fund">
        </div>
        <div class="form-group">
            <label class="form-label">Allocation (%)</label>
            <input type="number" class="form-control fund-allocation" placeholder="100" min="0" max="100">
        </div>
        <button type="button" class="btn btn--outline btn--sm" onclick="removeFund(this)">×</button>
    `;
    container.appendChild(div);
}

function removeFund(button) {
    button.parentElement.remove();
}

async function finishSetup() {
    try {
        // Save current form data
        portfolioData.platforms.robinhood.cash = parseFloat(document.getElementById('robinhoodCash').value) || 0;
        portfolioData.settings.monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value) || 500;
        
        // Collect updated holdings from form
        const holdingsContainer = document.getElementById('robinhoodHoldings');
        if (holdingsContainer) {
            const holdingInputs = holdingsContainer.querySelectorAll('.holding-input');
            portfolioData.platforms.robinhood.holdings = Array.from(holdingInputs).map(input => ({
                symbol: input.querySelector('.symbol-input').value.toUpperCase(),
                shares: parseFloat(input.querySelector('.shares-input').value) || 0,
                avgCost: parseFloat(input.querySelector('.cost-input').value) || 0
            })).filter(holding => holding.symbol && holding.shares > 0);
        }
        
        // Update other platform data
        portfolioData.platforms.fidelity.msftESPP.shares = parseFloat(document.getElementById('msftESPPShares').value) || 0;
        portfolioData.platforms.fidelity.msftESPP.avgCost = parseFloat(document.getElementById('msftESPPCost').value) || 380;
        portfolioData.platforms.retirement401k.totalBalance = parseFloat(document.getElementById('total401k').value) || 0;
        portfolioData.platforms.retirement401k.employerMatch = parseFloat(document.getElementById('employerMatch').value) || 0;
        portfolioData.platforms.msftRSU.shares = parseFloat(document.getElementById('msftRSUShares').value) || 0;
        
        await portfolioDataService.calculatePortfolioMetrics();
        await portfolioDataService.savePortfolioData();
        
        document.getElementById('portfolioSetup').classList.add('hidden');
        document.getElementById('mainDashboard').classList.remove('hidden');
        
        await initializeDashboard();
        showNotification('Portfolio setup completed!', 'success');
    } catch (error) {
        console.error('Setup failed:', error);
        showNotification('Setup completed with issues', 'warning');
    }
}

// Dashboard Functions
async function initializeDashboard() {
    if (!portfolioData) return;
    
    updateOverviewStats();
    generateRecommendations();
    generateStrategicOpportunities();
    createCharts();
    updateAllocationSuggestions();
    initializeNavigation();
    showDemoBanner();
}

function updateOverviewStats() {
    if (!portfolioData) return;
    
    const { totalValue, msftConcentration, dailyChange } = portfolioData.calculated;
    
    const updates = [
        ['totalPortfolioValue', formatCurrency(totalValue)],
        ['dailyChange', formatPercentage(dailyChange || 0.8)],
        ['msftConcentration', `${msftConcentration.toFixed(1)}%`],
        ['monthlyInvestmentAmount', formatCurrency(portfolioData.settings.monthlyInvestment)]
    ];
    
    updates.forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

function generateRecommendations() {
    if (!portfolioData) return;
    
    const recommendations = [
        { action: "DIVERSIFY", symbol: "INTL", reasoning: "Add international exposure", confidence: 85, targetAmount: 1000 },
        { action: "REBALANCE", symbol: "BONDS", reasoning: "Consider bond allocation", confidence: 78, targetAmount: 500 },
        { action: "HOLD", symbol: "VOO", reasoning: "Core holding performing well", confidence: 90, targetAmount: 500 }
    ];
    
    const container = document.getElementById('recommendationsGrid');
    if (container) {
        container.innerHTML = recommendations.map((rec, i) => `
            <div class="card recommendation-card" data-index="${i}">
                <div class="card__body">
                    <div class="recommendation-action">${rec.action}</div>
                    <div class="recommendation-symbol">${rec.symbol}</div>
                    <div class="recommendation-reasoning">${rec.reasoning}</div>
                    <div class="recommendation-meta">Target: ${formatCurrency(rec.targetAmount)}</div>
                    <button class="btn btn--primary btn--sm" onclick="acceptRecommendation(${i})">Accept</button>
                </div>
            </div>
        `).join('');
    }
}

function generateStrategicOpportunities() {
    if (!portfolioData) return;
    
    const opportunities = [
        { title: 'Diversification Opportunity', description: 'Consider international exposure', priority: 'medium', score: 7.5 },
        { title: 'Rebalancing Strategy', description: 'Review asset allocation', priority: 'low', score: 6.2 }
    ];
    
    const container = document.getElementById('strategicOpportunitiesGrid');
    if (container) {
        container.innerHTML = opportunities.map((opp, i) => `
            <div class="card opportunity-card">
                <div class="card__body">
                    <div class="opportunity-priority ${opp.priority}">${opp.priority.toUpperCase()}</div>
                    <h4>${opp.title}</h4>
                    <p>${opp.description}</p>
                    <div class="opportunity-score">${opp.score}/10</div>
                    <button class="btn btn--primary btn--sm" onclick="acceptOpportunity(${i})">Take Action</button>
                </div>
            </div>
        `).join('');
    }
}

function updateAllocationSuggestions() {
    if (!portfolioData) return;
    
    const suggestions = [
        { name: 'International Diversification (VXUS)', amount: 200, reasoning: 'Global exposure' },
        { name: 'Broad Market ETFs (VTI)', amount: 150, reasoning: 'Core holding' },
        { name: 'Bond Allocation (BND)', amount: 100, reasoning: 'Stability' },
        { name: 'Small Cap Value (VB)', amount: 50, reasoning: 'Diversification' }
    ];
    
    const container = document.getElementById('allocationBreakdown');
    if (container) {
        container.innerHTML = suggestions.map(s => `
            <div class="allocation-item">
                <div>
                    <div class="allocation-name">${s.name}</div>
                    <div class="allocation-reasoning">${s.reasoning}</div>
                </div>
                <div class="allocation-amount">${formatCurrency(s.amount)}</div>
            </div>
        `).join('');
    }
}

function createCharts() {
    if (!portfolioData || !window.Chart) return;
    
    // Allocation Chart
    const ctx = document.getElementById('allocationChart');
    if (ctx) {
        const { platformBreakdown } = portfolioData.calculated;
        if (charts.allocation) charts.allocation.destroy();
        
        charts.allocation = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Brokerage', 'ESPP', '401(k)', 'RSU'],
                datasets: [{
                    data: [platformBreakdown.robinhood || 0, platformBreakdown.fidelity || 0, platformBreakdown.retirement401k || 0, platformBreakdown.msftRSU || 0],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Concentration Chart
    const concentrationCtx = document.getElementById('concentrationChart');
    if (concentrationCtx) {
        const { msftConcentration } = portfolioData.calculated;
        if (charts.concentration) charts.concentration.destroy();
        
        charts.concentration = new Chart(concentrationCtx, {
            type: 'bar',
            data: {
                labels: ['Current Concentration', 'Recommended Max', 'Ideal Target'],
                datasets: [{
                    label: 'Percentage',
                    data: [msftConcentration, 30, 20],
                    backgroundColor: [
                        msftConcentration > 30 ? '#DB4545' : '#FFC185',
                        '#1FB8CD',
                        '#B4413C'
                    ]
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(50, msftConcentration + 5),
                        ticks: { callback: function(value) { return value + '%'; } }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}

function initializeNavigation() {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const target = link.getAttribute('href').substring(1);
            const element = document.getElementById(target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function showDemoBanner() {
    const banner = document.createElement('div');
    banner.id = 'demoBanner';
    banner.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:1001;background:#e8f5e8;border-bottom:1px solid #4caf50;text-align:center;padding:12px;color:#2e7d32;`;
    banner.innerHTML = `
        <span>🚀 Demo Mode - This is a showcase application with sample data</span>
        <button onclick="dismissDemoBanner()" style="margin-left:8px;padding:4px 8px;background:transparent;color:#2e7d32;border:1px solid #4caf50;border-radius:4px;cursor:pointer;">×</button>
    `;
    document.body.appendChild(banner);
    document.body.style.paddingTop = '60px';
}

function dismissDemoBanner() {
    const banner = document.getElementById('demoBanner');
    if (banner) {
        banner.remove();
        document.body.style.paddingTop = '0';
    }
}

// Action Functions
function acceptRecommendation(index) {
    const recommendations = [
        { action: "DIVERSIFY", symbol: "INTL", reasoning: "Add international exposure", confidence: 85, targetAmount: 1000 },
        { action: "REBALANCE", symbol: "BONDS", reasoning: "Consider bond allocation", confidence: 78, targetAmount: 500 },
        { action: "HOLD", symbol: "VOO", reasoning: "Core holding performing well", confidence: 90, targetAmount: 500 }
    ];
    
    const recommendation = recommendations[index];
    if (!recommendation) return;
    
    let actionPlan = '';
    switch (recommendation.action) {
        case 'DIVERSIFY':
            actionPlan = `Add ${formatCurrency(recommendation.targetAmount)} to international funds for better global exposure.`;
            break;
        case 'REBALANCE':
            actionPlan = `Consider allocating ${formatCurrency(recommendation.targetAmount)} to bonds for portfolio stability.`;
            break;
        case 'HOLD':
            actionPlan = `Continue holding ${recommendation.symbol}. Consider adding ${formatCurrency(recommendation.targetAmount)} more.`;
            break;
    }
    
    showNotification(`✅ Recommendation Accepted: ${actionPlan}`, 'success');
    
    const card = document.querySelector(`[data-index="${index}"]`);
    if (card) {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        setTimeout(() => card.remove(), 500);
    }
}

function acceptOpportunity(index) {
    const opportunities = [
        { title: 'Diversification Opportunity', description: 'Consider international exposure', priority: 'medium', score: 7.5 },
        { title: 'Rebalancing Strategy', description: 'Review asset allocation', priority: 'low', score: 6.2 }
    ];
    
    const opportunity = opportunities[index];
    if (!opportunity) return;
    
    showNotification(`🎯 Opportunity Action Plan: Working on ${opportunity.title}`, 'success');
}

function editPortfolio() {
    setupPortfolio();
}

function resetPortfolio() {
    if (confirm('Reset all portfolio data?')) {
        location.reload();
    }
}

async function refreshDashboard() {
    if (!portfolioData) return;
    
    showNotification('Refreshing portfolio data...', 'info');
    
    try {
        await portfolioDataService.calculatePortfolioMetrics();
        updateOverviewStats();
        generateRecommendations();
        generateStrategicOpportunities();
        createCharts();
        updateAllocationSuggestions();
        updateDatabaseStatus('Demo Mode');
        
        showNotification('Dashboard refreshed successfully!', 'success');
    } catch (error) {
        console.error('Dashboard refresh failed:', error);
        showNotification('Refresh completed with issues', 'warning');
    }
}

function updateRiskTolerance() {
    const slider = document.getElementById('riskSlider');
    const valueDisplay = document.getElementById('riskValue');
    
    if (!slider || !valueDisplay) return;
    
    const value = parseInt(slider.value);
    valueDisplay.textContent = value;
    
    if (portfolioData) {
        portfolioData.settings.riskTolerance = value <= 3 ? 'conservative' : 
                                                value <= 7 ? 'moderate' : 'aggressive';
        portfolioDataService.savePortfolioData();
        updateAllocationSuggestions();
        showNotification(`Risk tolerance updated to ${portfolioData.settings.riskTolerance}`, 'success');
    }
}

async function exportData() {
    try {
        const data = { portfolioData, timestamp: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully!', 'success');
    } catch (error) {
        showNotification('Export failed', 'error');
    }
}

function importData() {
    document.getElementById('importFileInput').click();
}

async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.portfolioData) {
            portfolioData = data.portfolioData;
            await portfolioDataService.calculatePortfolioMetrics();
            updateOverviewStats();
            showNotification('Data imported successfully!', 'success');
        }
    } catch (error) {
        showNotification('Import failed', 'error');
    }
}

// Enhanced initialization
async function initializeApplicationSafely() {
    try {
        console.log('🚀 Smart Portfolio Advisor Demo initializing...');
        
        const initialized = await portfolioDataService.initialize();
        
        if (initialized) {
            console.log('✅ Demo application initialized successfully');
            updateDatabaseStatus('Demo Mode');
            showNotification('Portfolio Advisor Demo ready!', 'success');
        } else {
            console.warn('⚠️ Application initialized with minimal data');
            updateDatabaseStatus('Minimal Mode');
        }
        
        setupEventListeners();
        
    } catch (error) {
        console.error('💥 Critical initialization failure', error);
        showNotification('Application loaded in emergency mode', 'error');
    }
}

function setupEventListeners() {
    try {
        const setupBtn = document.getElementById('setupPortfolioBtn');
        if (setupBtn) {
            setupBtn.addEventListener('click', setupPortfolio);
        }
        
        const riskSlider = document.getElementById('riskSlider');
        if (riskSlider) {
            riskSlider.addEventListener('input', updateRiskTolerance);
        }
        
        updateNavigationButtons();
        console.log('📱 Event listeners setup complete');
        
    } catch (error) {
        console.error('Event listener setup failed:', error);
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !e.shiftKey) {
            e.preventDefault();
            refreshDashboard();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportData();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            setupPortfolio();
        }
    });
}

// Main Application Initialization
document.addEventListener('DOMContentLoaded', initializeApplicationSafely);
document.addEventListener('DOMContentLoaded', setupKeyboardShortcuts);

// Make functions globally available
window.setupPortfolio = setupPortfolio;
window.changeStep = changeStep;
window.addHolding = addHolding;
window.addFund = addFund;
window.removeHolding = removeHolding;
window.removeFund = removeFund;
window.finishSetup = finishSetup;
window.acceptRecommendation = acceptRecommendation;
window.acceptOpportunity = acceptOpportunity;
window.editPortfolio = editPortfolio;
window.resetPortfolio = resetPortfolio;
window.refreshDashboard = refreshDashboard;
window.updateRiskTolerance = updateRiskTolerance;
window.exportData = exportData;
window.importData = importData;
window.handleFileImport = handleFileImport;
window.dismissDemoBanner = dismissDemoBanner;
