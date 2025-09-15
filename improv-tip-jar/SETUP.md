# Improv Tip Jar Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure your group:**
   - Copy `.env.example` to `.env.local`
   - Update the environment variables with your group's information:
     - `VITE_TIP_JAR_NAME`: Your improv group's name
     - `VITE_TIP_JAR_SLOGAN`: Your custom message (e.g., "Support our comedy!")

3. **Set up Voltage API:**
   - Sign up at [Voltage](https://voltageapi.com/)
   - Get your API credentials
   - Update the Voltage environment variables in `.env.local`

4. **Run locally:**
   ```bash
   pnpm dev:vite
   ```

5. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set the environment variables in Netlify's dashboard
   - Deploy!

## Customization

### Tip Amounts and Messages
Edit `src/App.tsx` to customize the tip options:

```typescript
const baseTipOptions = [
  {
    id: 1,
    primaryAmount: 10,
    emoji: '😂',
    message: 'Hilarious!',
    selected: false
  },
  // Add more options...
]
```

### Group Branding
- Update `VITE_TIP_JAR_NAME` for your group's name
- Update `VITE_TIP_JAR_SLOGAN` for your custom message
- Replace the avatar image in `src/assets/avatars/` with your group's logo

### Colors and Styling
The app uses the Bitcoin Builder Kit design system. You can customize colors by modifying the CSS variables in `src/index.css`.

## Features

- **Lightning Network payments** - Fast, low-cost Bitcoin transactions
- **Custom tip amounts** - Let audience members choose their own amount
- **Mobile-friendly** - Works great on phones and tablets
- **Real-time Bitcoin prices** - Automatic conversion from USD to Bitcoin
- **QR code display** - Easy scanning for payments

## Support

For technical support, check the original [Bitcoin Tip Jar repository](https://github.com/sbddesign/btc-tip-jar) or the [Voltage API documentation](https://docs.voltageapi.com/).
