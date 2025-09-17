# Voltage API Setup Guide 🚀

This guide will help you set up your Voltage API credentials to make the Bitcoin tip jar functional.

## Step 1: Create Voltage Account

1. Go to [https://voltage.cloud](https://voltage.cloud)
2. Sign up for a free account
3. Verify your email and log in

## Step 2: Set Up Payments

1. **Select Product**: Choose "Payments" from the dashboard
2. **Create Environment**: 
   - Click "Create Environment"
   - Name it "staging" or "development"
   - Select **mutinynet** for testing (free testnet Bitcoin)
3. **Create Wallet**:
   - Click "Create Wallet" in your environment
   - Choose "Developer Wallet" 
   - Select **mutinynet** network

## Step 3: Get API Credentials

1. **Developer Info**:
   - Go to your wallet dashboard
   - Toggle the "Developer" switch at the top to show developer info
   - Copy these values:
     - **Organization ID** 
     - **Environment ID**
     - **Wallet ID**

2. **API Key**:
   - Click on your account dropdown (top right)
   - Select "API Keys"
   - Click "Create API Key"
   - Select your staging environment
   - Copy the generated API key (starts with `vltg_`)

## Step 4: Configure Your Tip Jar

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your actual values:
   ```env
   VITE_VOLTAGE_API_KEY=vltg_your_actual_api_key_here
   VITE_VOLTAGE_ORG_ID=your-actual-org-id-here
   VITE_VOLTAGE_ENV_ID=your-actual-env-id-here
   VITE_VOLTAGE_WALLET_ID=your-actual-wallet-id-here
   
   # Optional customization
   VITE_TIP_JAR_NAME="Your Improv Group Name"
   VITE_TIP_JAR_SLOGAN="Your custom slogan!"
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

## Step 5: Test Payments

To test that payments work:

1. **Create a second wallet** in Voltage (for sending test payments)
2. **Or use the Mutinynet Faucet**: [https://faucet.mutinynet.com/](https://faucet.mutinynet.com/)
3. **Or use any mutinynet Lightning wallet** (like Phoenix, Breez, etc. set to testnet)

### Testing Process:
1. Select a tip amount in your tip jar
2. Click "Continue" 
3. A QR code should appear with a Lightning invoice
4. Pay the invoice with your test wallet
5. The tip jar should show "Payment Complete!"

## 🔒 Security Notes

- Never commit your `.env` file to git (it's already in `.gitignore`)
- For production, create a **mainnet** wallet instead of mutinynet
- Keep your API keys secure and rotate them regularly

## 🎭 Customization

Update these variables in your `.env` file:
- `VITE_TIP_JAR_NAME`: Your improv group's name
- `VITE_TIP_JAR_SLOGAN`: Custom message for your audience

You can also modify tip amounts and messages by editing `src/App.tsx`.

## 🚀 Production Deployment

When ready for production:
1. Create a mainnet Voltage wallet
2. Update all environment variables to use mainnet credentials
3. Set environment variables in your Netlify dashboard
4. Deploy!

## Need Help?

- [Voltage Documentation](https://voltage.cloud/docs)
- [Mutinynet Faucet](https://faucet.mutinynet.com/)
- [Bitcoin Builder Kit Docs](https://bitcoin-builder-kit-docs.netlify.app/)

Happy tipping! 🎪⚡
