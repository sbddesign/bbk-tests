# Improv Comedy Bitcoin Tip Jar

A Bitcoin Lightning Network tip jar for your local improv comedy group, built with the Bitcoin Builder Kit.

## Features

- 🎭 Improv-themed messaging and branding
- 💰 Preset tip amounts with comedy-themed labels (Laugh, Giggle, Chuckle, ROFL)
- ⚡ Lightning Network payments via Voltage API
- 📱 Responsive design with QR code display
- 🎨 Beautiful UI using Bitcoin Builder Kit components
- 🔄 Real-time payment status checking
- 🌐 Netlify deployment ready

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Voltage Payments API account (free for mutinynet)
- Kraken API access (free)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   - Get your Voltage API credentials from [Voltage](https://voltage.cloud)
   - Set your improv group name and slogan

### Development

Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:8888` (configured for Netlify compatibility).

For Netlify development:
```bash
pnpm dev:netlify
```

### Production Build

Build for production:
```bash
pnpm build
```

## Customization

### Group Branding

Update the following environment variables in your `.env` file:

- `VITE_TIP_JAR_NAME`: Your improv group's name
- `VITE_TIP_JAR_SLOGAN`: Your group's tagline

### Tip Amounts

Edit the `baseTipOptions` array in `src/App.tsx` to customize:
- Tip amounts (USD)
- Emoji reactions
- Comedy-themed messages

### Styling

The app uses TailwindCSS with Bitcoin Builder Kit design tokens. You can customize:
- Colors via CSS variables
- Layout and spacing
- Component styling

## Voltage API Setup

1. Create an account with [Voltage](https://voltage.cloud)
2. Select the Payments product
3. Create an environment (call it "staging" or "production")
4. Create a wallet (mutinynet for testing, mainnet for production)
5. Go to the wallet and click on the developer toggle at the top of the screen to show developer info
6. Copy and paste the Organization ID, Environment ID, and Wallet ID into your `.env` file
7. Click on the account dropdown and go to API Keys
8. Create an API key for your staging environment, copy it, and paste it into `.env`
9. Make a 2nd wallet in Voltage (also mutinynet) which you can use to test paying to the first wallet

### Environment Variables

Create a `.env` file with your real Voltage API credentials:

```bash
VITE_VOLTAGE_API_KEY=your_real_api_key_here
VITE_VOLTAGE_ORG_ID=your_org_id_here
VITE_VOLTAGE_ENV_ID=your_env_id_here
VITE_VOLTAGE_WALLET_ID=your_wallet_id_here
VITE_TIP_JAR_NAME="Your Improv Group Name"
VITE_TIP_JAR_SLOGAN="Your group slogan"
```

**Important**: Replace the example values with your actual Voltage API credentials. The app will not work with mock data.

## Testing

To test with real payments:

1. Set up your Voltage API credentials in `.env`
2. Use a mutinynet wallet for testing
3. Test payments with the Mutinynet faucet or compatible wallets
4. The app will automatically check payment status every 3 seconds
5. Once payment is received, the UI will show a success state

## Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_VOLTAGE_API_KEY`
   - `VITE_VOLTAGE_ORG_ID`
   - `VITE_VOLTAGE_ENV_ID`
   - `VITE_VOLTAGE_WALLET_ID`
   - `VITE_TIP_JAR_NAME`
   - `VITE_TIP_JAR_SLOGAN`

### Other Platforms

- **Vercel**: Import your project and set environment variables
- **GitHub Pages**: Use GitHub Actions for deployment

## Support

For issues and questions:
- Check the [Bitcoin Builder Kit documentation](https://bitcoin-builder-kit-docs.netlify.app/)
- Review the [Voltage API documentation](https://docs.voltage.cloud/)

## License

MIT License - feel free to use this for your improv group or other creative projects!