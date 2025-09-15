// Bitcoin Tip Jar JavaScript
class BitcoinTipJar {
    constructor() {
        this.currentAmount = 0.0001; // Default 1,000 sats
        this.totalTips = 0;
        this.tipCount = 0;
        this.walletAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'; // Example address - replace with actual
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTipAmount();
        this.loadStats();
    }

    setupEventListeners() {
        // Quick amount buttons
        const amountButtons = document.querySelectorAll('.amount-btn');
        amountButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const amount = parseFloat(e.target.dataset.amount);
                this.setTipAmount(amount);
                
                // Update button states
                amountButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Set initial active button
        document.querySelector('[data-amount="0.0001"]').classList.add('active');
    }

    setTipAmount(amount) {
        this.currentAmount = amount;
        this.updateTipAmount();
    }

    updateTipAmount() {
        const tipAmountElement = document.getElementById('tipAmount');
        const tipQRElement = document.getElementById('tipQR');
        const tipAddressElement = document.getElementById('tipAddress');

        if (tipAmountElement) {
            tipAmountElement.setAttribute('value', this.currentAmount.toString());
        }

        if (tipQRElement) {
            // Create Bitcoin URI for QR code
            const bitcoinURI = `bitcoin:${this.walletAddress}?amount=${this.currentAmount}&label=Improv%20Group%20Tip`;
            tipQRElement.setAttribute('value', bitcoinURI);
        }

        if (tipAddressElement) {
            tipAddressElement.setAttribute('value', this.walletAddress);
        }
    }

    loadStats() {
        // Load stats from localStorage or initialize
        const savedStats = localStorage.getItem('improvTipStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            this.totalTips = stats.totalTips || 0;
            this.tipCount = stats.tipCount || 0;
        }

        this.updateStatsDisplay();
    }

    saveStats() {
        const stats = {
            totalTips: this.totalTips,
            tipCount: this.tipCount,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('improvTipStats', JSON.stringify(stats));
    }

    updateStatsDisplay() {
        const totalTipsElement = document.getElementById('totalTips');
        const tipCountElement = document.getElementById('tipCount');

        if (totalTipsElement) {
            totalTipsElement.setAttribute('value', this.totalTips.toString());
        }

        if (tipCountElement) {
            tipCountElement.textContent = this.tipCount.toString();
        }
    }

    // Simulate receiving a tip (in a real app, this would be handled by a backend)
    simulateTip(amount) {
        this.totalTips += amount;
        this.tipCount += 1;
        this.updateStatsDisplay();
        this.saveStats();
        
        // Show tip received animation
        this.showTipReceivedAnimation(amount);
    }

    showTipReceivedAnimation(amount) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'tip-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 Tip Received!</h3>
                <bitcoin-value value="${amount}" unit="BTC" show-fiat="true" fiat-currency="USD"></bitcoin-value>
                <p>Thank you for supporting our improv group!</p>
            </div>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f7931a;
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation keyframes
        if (!document.querySelector('#tip-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'tip-animation-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Method to manually add a tip (for testing or manual entry)
    addTip(amount) {
        this.simulateTip(amount);
    }
}

// Initialize the tip jar when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tipJar = new BitcoinTipJar();
    
    // Add some demo functionality
    console.log('Bitcoin Tip Jar initialized!');
    console.log('Use window.tipJar.addTip(0.0001) to simulate receiving a tip');
    
    // Add a demo button for testing (remove in production)
    const demoButton = document.createElement('button');
    demoButton.textContent = 'Demo: Add 1,000 sats tip';
    demoButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #28a745;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
        z-index: 1000;
    `;
    demoButton.addEventListener('click', () => {
        window.tipJar.addTip(0.0001);
    });
    document.body.appendChild(demoButton);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BitcoinTipJar;
}
