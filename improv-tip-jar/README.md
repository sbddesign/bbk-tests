# Improv Comedy Bitcoin Tip Jar

A Bitcoin Lightning Network tip jar for your local improv comedy group, built with the Bitcoin Builder Kit.

## Features

- 🎭 Improv-themed messaging and branding
- 💰 Preset tip amounts with comedy-themed labels (Laugh, Giggle, Chuckle, ROFL)
- ⚡ Lightning Network payments via Voltage API
- 📱 Responsive design with QR code display
- 🎨 Beautiful UI using Bitcoin Builder Kit components

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

The app will be available at `http://localhost:5173`.

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
5. Get your API credentials from the developer panel
6. Create an API key for your environment

## Testing

For testing purposes, the app uses mock payment data. To test with real payments:

1. Set up your Voltage API credentials
2. Use a mutinynet wallet for testing
3. Test payments with the Mutinynet faucet or compatible wallets

## Deployment

The app can be deployed to any static hosting service:

- **Netlify**: Connect your GitHub repository
- **Vercel**: Import your project
- **GitHub Pages**: Use GitHub Actions for deployment

## Support

For issues and questions:
- Check the [Bitcoin Builder Kit documentation](https://bitcoin-builder-kit-docs.netlify.app/)
- Review the [Voltage API documentation](https://docs.voltage.cloud/)

## License

MIT License - feel free to use this for your improv group or other creative projects!