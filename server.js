const express = require('express');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1');
require('dotenv').config();

// Create bip32 instance using BIP32Factory
const bip32 = BIP32Factory(ecc);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Bitcoin network (testnet for development, mainnet for production)
const network = bitcoin.networks.testnet;

// Generate a new mnemonic for demo purposes (in production, this should be stored securely)
const mnemonic = process.env.MNEMONIC || bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedSync(mnemonic);
const root = bip32.fromSeed(seed, network);

// Derive a child key for receiving addresses
const path_template = "m/84'/1'/0'/0/"; // BIP84 for native segwit testnet

let addressIndex = 0;

// Generate a new receiving address
function generateAddress() {
    const child = root.derivePath(path_template + addressIndex);
    addressIndex++;
    
    const { address } = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: network
    });
    
    return address;
}

// API endpoints
app.get('/api/new-address', async (req, res) => {
    try {
        const address = generateAddress();
        const qrCodeDataUrl = await QRCode.toDataURL(`bitcoin:${address}`);
        
        res.json({
            address: address,
            qrCode: qrCodeDataUrl
        });
    } catch (error) {
        console.error('Error generating address:', error);
        res.status(500).json({ error: 'Failed to generate address' });
    }
});

app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'running',
        network: network === bitcoin.networks.testnet ? 'testnet' : 'mainnet',
        addressesGenerated: addressIndex
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bitcoin tip jar server running on http://0.0.0.0:${PORT}`);
    console.log(`Network: ${network === bitcoin.networks.testnet ? 'testnet' : 'mainnet'}`);
    if (!process.env.MNEMONIC) {
        console.log(`Demo mnemonic (save this for production): ${mnemonic}`);
    }
});