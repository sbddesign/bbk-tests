# Improv Comedy Bitcoin Tip Jar

A Bitcoin Lightning Network tip jar for local improv comedy groups, built with Vite, TypeScript, React, and the Bitcoin Builder Kit UI components.

## Features

- 🎭 Improv-themed branding and messaging
- ⚡ Bitcoin Lightning Network payments
- 💰 Real-time Bitcoin price conversion
- 📱 Responsive design with Tailwind CSS
- 🔒 Secure payment processing via Voltage API

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with your Voltage API credentials:
   ```env
   VITE_VOLTAGE_API_KEY=your_voltage_api_key_here
   VITE_VOLTAGE_ORG_ID=your_org_id_here
   VITE_VOLTAGE_ENV_ID=your_env_id_here
   VITE_VOLTAGE_WALLET_ID=your_wallet_id_here
   ```

3. **Run development server:**
   ```bash
   pnpm run dev
   ```

4. **Build for production:**
   ```bash
   pnpm run build
   ```

## Deployment

Deploy to Netlify with the included configuration. Make sure to set the environment variables in your Netlify dashboard.

## Customization

- Update the improv group name and messaging in `src/App.tsx`
- Modify tip amounts in the `baseTipOptions` array
- Customize colors and styling in the Tailwind classes

## Requirements

- Node.js 18+
- Voltage Payments API account
- Netlify account for deployment