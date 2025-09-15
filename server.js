const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
require('dotenv').config();

// Create bip32 instance using BIP32Factory
const bip32 = BIP32Factory(ecc);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Demo XPUB for testnet (safe for testing - replace with your own for production)
const DEMO_TESTNET_XPUB = 'tpubDDY3qb1bAQK1F7pbUmkFkHH5xf4JHfbqG4qoaF9nYvnMHk2Cjz9QcT5xQ9qn7J7tJj7h3j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h7j7h';

// Configuration validation
const config = {
  network: process.env.NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet,
  xpub: process.env.XPUB || DEMO_TESTNET_XPUB,
  esploraUrl: process.env.ESPLORA_URL || 'https://blockstream.info/testnet/api',
  derivationPath: process.env.DERIVATION_PATH || "m/84'/1'/0'/0/",
  dbFile: process.env.DB_FILE || './data/tipjar.json'
};

// Warn if using demo XPUB
if (!process.env.XPUB) {
  console.warn('⚠️  WARNING: Using demo XPUB for testing. Set XPUB environment variable for production use.');
}

// Initialize database directory
const dbDir = path.dirname(config.dbFile);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database operations
function loadDatabase() {
  try {
    if (fs.existsSync(config.dbFile)) {
      return JSON.parse(fs.readFileSync(config.dbFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading database:', error.message);
  }
  
  return {
    addressIndex: 0,
    addresses: [],
    payments: []
  };
}

function saveDatabase(data) {
  try {
    fs.writeFileSync(config.dbFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving database:', error.message);
  }
}

// Initialize database
let db = loadDatabase();

// Parse xpub and create watch-only wallet
let xpubNode;
try {
  xpubNode = bip32.fromBase58(config.xpub, config.network);
} catch (error) {
  console.error('ERROR: Invalid XPUB format:', error.message);
  process.exit(1);
}

// Generate a new receiving address using watch-only wallet
function generateAddress() {
    const index = db.addressIndex;
    const child = xpubNode.derive(0).derive(index); // External chain (0) for receiving
    
    const { address } = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: config.network
    });
    
    // Store address info
    const addressInfo = {
        index: index,
        address: address,
        derivationPath: `${config.derivationPath}0/${index}`,
        createdAt: new Date().toISOString(),
        received: 0,
        confirmed: 0
    };
    
    db.addresses.push(addressInfo);
    db.addressIndex++;
    saveDatabase(db);
    
    return addressInfo;
}

// Check payments for an address using Esplora API
async function checkAddressPayments(address) {
    try {
        const response = await fetch(`${config.esploraUrl}/address/${address}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
            received: data.chain_stats.funded_txo_sum + data.mempool_stats.funded_txo_sum,
            confirmed: data.chain_stats.funded_txo_sum,
            txCount: data.chain_stats.funded_txo_count + data.mempool_stats.funded_txo_count
        };
    } catch (error) {
        console.error(`Error checking payments for ${address}:`, error.message);
        return null;
    }
}

// Update payment status for all addresses
async function updatePaymentStatus() {
    for (const addr of db.addresses) {
        const payments = await checkAddressPayments(addr.address);
        if (payments) {
            const wasUpdated = addr.received !== payments.received || addr.confirmed !== payments.confirmed;
            addr.received = payments.received;
            addr.confirmed = payments.confirmed;
            addr.txCount = payments.txCount;
            addr.lastChecked = new Date().toISOString();
            
            if (wasUpdated && payments.received > 0) {
                console.log(`💰 Payment detected! Address ${addr.address} received ${payments.received} sats`);
            }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    saveDatabase(db);
}

// API endpoints
app.get('/api/new-address', async (req, res) => {
    try {
        const addressInfo = generateAddress();
        const bitcoinUri = `bitcoin:${addressInfo.address}?label=Improv%20Group%20Tip`;
        const qrCodeDataUrl = await QRCode.toDataURL(bitcoinUri);
        
        res.json({
            address: addressInfo.address,
            qrCode: qrCodeDataUrl,
            derivationPath: addressInfo.derivationPath,
            index: addressInfo.index
        });
    } catch (error) {
        console.error('Error generating address:', error);
        res.status(500).json({ error: 'Failed to generate address' });
    }
});

app.get('/api/address/:address/payments', async (req, res) => {
    try {
        const address = req.params.address;
        const payments = await checkAddressPayments(address);
        
        if (!payments) {
            return res.status(500).json({ error: 'Failed to check payments' });
        }
        
        res.json(payments);
    } catch (error) {
        console.error('Error checking payments:', error);
        res.status(500).json({ error: 'Failed to check payments' });
    }
});

app.get('/api/addresses', (req, res) => {
    res.json({
        addresses: db.addresses,
        totalAddresses: db.addresses.length,
        totalReceived: db.addresses.reduce((sum, addr) => sum + addr.received, 0),
        totalConfirmed: db.addresses.reduce((sum, addr) => sum + addr.confirmed, 0)
    });
});

app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'running',
        network: config.network === bitcoin.networks.testnet ? 'testnet' : 'mainnet',
        addressesGenerated: db.addressIndex,
        totalReceived: db.addresses.reduce((sum, addr) => sum + addr.received, 0),
        totalConfirmed: db.addresses.reduce((sum, addr) => sum + addr.confirmed, 0)
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start periodic payment monitoring (every 30 seconds)
setInterval(async () => {
    if (db.addresses.length > 0) {
        await updatePaymentStatus();
    }
}, 30000);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎭 Bitcoin Tip Jar server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Network: ${config.network === bitcoin.networks.testnet ? 'testnet' : 'mainnet'}`);
    console.log(`💾 Database: ${config.dbFile}`);
    console.log(`🔍 Blockchain API: ${config.esploraUrl}`);
    console.log(`📍 Addresses generated: ${db.addressIndex}`);
    console.log(`💰 Total received: ${db.addresses.reduce((sum, addr) => sum + addr.received, 0)} sats`);
    console.log('✅ Secure watch-only wallet initialized');
});