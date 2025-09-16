#!/bin/bash

echo "🎭 Setting up Improv Comedy Bitcoin Tip Jar..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Voltage Payments API Configuration
# Get these from your Voltage Payments dashboard
VITE_VOLTAGE_API_KEY=your_voltage_api_key_here
VITE_VOLTAGE_ORG_ID=your_org_id_here
VITE_VOLTAGE_ENV_ID=your_env_id_here
VITE_VOLTAGE_WALLET_ID=your_wallet_id_here

# Improv Group Configuration
VITE_TIP_JAR_NAME=Local Improv Comedy
VITE_TIP_JAR_SLOGAN=Support our local improv troupe!
EOF
    echo "✅ Created .env.local file - please update with your Voltage API credentials"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Update .env.local with your Voltage API credentials"
echo "2. Run 'pnpm run dev' to start the development server"
echo "3. Visit http://localhost:5173 to see your tip jar"
echo ""
echo "For deployment instructions, see README.md"
