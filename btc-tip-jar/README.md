# Improv Troupe Bitcoin Tip Jar 🎭⚡

A Bitcoin Lightning tip jar built with React, TypeScript, and the Bitcoin Builder Kit, specifically designed for improv comedy groups to accept tips from their audience.

## Features

- 🎭 **Improv-themed branding** with comedy-focused messaging and emojis
- ⚡ **Lightning Network payments** via Voltage API
- 💰 **Real-time Bitcoin pricing** from Kraken API
- 🎨 **Beautiful UI** using Bitcoin Builder Kit components
- 📱 **Mobile-responsive** design
- 🔧 **Custom tip amounts** with built-in calculator
- 📋 **One-click payment copying**
- 🎯 **QR code generation** for easy mobile payments

## Preset Tip Options

- 🎭 **$5 - "Bravo!"** - For those good chuckles
- 👏 **$10 - "Amazing!"** - When the jokes land perfectly
- 🌟 **$20 - "Spectacular!"** - For outstanding performances
- 🎪 **$50 - "Show-stopping!"** - When you absolutely killed it
- 💡 **Custom Amount** - Let supporters choose their own amount

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your API credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Voltage API Configuration (Required)
VITE_VOLTAGE_API_KEY=your_voltage_api_key_here
VITE_VOLTAGE_ORG_ID=your_voltage_org_id_here
VITE_VOLTAGE_ENV_ID=your_voltage_env_id_here
VITE_VOLTAGE_WALLET_ID=your_voltage_wallet_id_here

# Customization (Optional)
VITE_TIP_JAR_NAME="Your Improv Group Name"
VITE_TIP_JAR_SLOGAN="Your custom slogan here!"
```

### 3. Voltage Setup

1. Create an account at [Voltage](https://voltage.cloud)
2. Select the **Payments** product
3. Create an environment (e.g., "staging" for testing)
4. Create a **mutinynet developer wallet** for testing
5. Copy the Organization ID, Environment ID, and Wallet ID from the developer info
6. Create an API key for your environment
7. Add all these values to your `.env` file

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8888` (using Netlify Dev for proper environment handling).

## Testing

To test the tip jar:

1. Select a tip amount or enter a custom amount
2. Click "Continue" to generate a Lightning invoice
3. Use a mutinynet-compatible wallet to pay the invoice
4. The QR code will update to show payment completion

For testing, you can:
- Create a second Voltage mutinynet wallet to pay invoices
- Use the [Mutinynet Faucet](https://faucet.mutinynet.com/) to get test Bitcoin
- Use any mutinynet-compatible Lightning wallet

## Deployment

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set your build command to `npm run build`
3. Set your publish directory to `dist`
4. Add your environment variables in Netlify's dashboard
5. Deploy!

### Environment Variables for Production

Make sure to set these in your Netlify dashboard:
- `VITE_VOLTAGE_API_KEY`
- `VITE_VOLTAGE_ORG_ID`
- `VITE_VOLTAGE_ENV_ID`
- `VITE_VOLTAGE_WALLET_ID`
- `VITE_TIP_JAR_NAME` (optional)
- `VITE_TIP_JAR_SLOGAN` (optional)

## Customization

### Branding
- Update `VITE_TIP_JAR_NAME` and `VITE_TIP_JAR_SLOGAN` in your `.env` file
- Modify the emoji and messages in the tip options within `src/App.tsx`
- Customize the avatar text in `src/components/Recipient.tsx`

### Tip Amounts
Edit the `baseTipOptions` array in `src/App.tsx` to change the preset tip amounts, emojis, and messages.

### Styling
The app uses Bitcoin Builder Kit components and TailwindCSS. You can customize the styling by modifying the component props and CSS classes.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Bitcoin Builder Kit** for Bitcoin-specific UI components
- **Voltage API** for Lightning Network payments
- **Kraken API** for real-time Bitcoin pricing
- **Netlify** for hosting and serverless functions

## Support

This tip jar is built for improv groups to easily accept Bitcoin tips from their audiences. Perfect for:
- Post-show tip collection
- Online performance donations
- Workshop and class tips
- General troupe support

## Contributing

Feel free to submit issues and pull requests to improve the tip jar for the improv community!

## License

MIT License - feel free to use this for your improv group or adapt it for other performance groups!