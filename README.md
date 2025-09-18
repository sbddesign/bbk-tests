# React + TypeScript + Vite
## Bitcoin Tip Jar (Improv Group)

Run locally with Netlify CLI and deploy to Netlify. UI by Bitcoin Builder Kit. Lightning invoices created via Voltage Payments API.

### Prereqs
- Node.js 18+
- Netlify CLI (`npm i -g netlify-cli`)

### Setup
1. Install deps:
   ```bash
   npm install
   ```
2. Create `.env` for local dev (Netlify reads from it):
   ```bash
   # UI
   VITE_TIP_JAR_NAME="Yes, And! Improv"
   VITE_TIP_JAR_SLOGAN="Fuel the funny — throw some sats!"

   # Voltage (mutinynet or production as configured in your account)
   VOLTAGE_API_URL="https://api.voltage.cloud/payments"
   VOLTAGE_API_KEY="YOUR_API_KEY"
   VOLTAGE_ORG_ID="YOUR_ORG_ID"
   VOLTAGE_ENV_ID="YOUR_ENV_ID"
   VOLTAGE_WALLET_ID="YOUR_WALLET_ID"
   ```
   Also set the same environment variables in your Netlify site settings.

### Local dev
```bash
netlify dev
```

### Build
```bash
npm run build
```

### Deploy
```bash
netlify deploy --prod
```

### Notes
- No mock data or mock APIs are used; invoices are created against Voltage Payments API.
- BTC price uses Kraken public API for USD→sats conversion.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
