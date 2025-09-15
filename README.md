# Experiment Notes

Agent: Cursor Agent, Auto
Prompt: I would like to create a bitcoin tip jar for a small local improv group. Please build it according to the guidance in the Bitcoin Builder Kit.
Context: [Indexed Docs - Bitcoin Builder Kit Alpha](https://bitcoin-builder-kit-docs.netlify.app/)

---

# Bitcoin Tip Jar for Improv Group

A beautiful bitcoin tip jar built with the Bitcoin Builder Kit for supporting local improv performances.

## Features

- 🎭 **Improv-themed design** with orange Bitcoin colors
- 💰 **Quick tip amounts** (1K, 5K, 10K, 20K sats)
- 📱 **QR code generation** for easy mobile payments
- 📋 **Copy address** functionality
- 📊 **Live statistics** tracking total tips received
- 📱 **Responsive design** works on all devices
- 🎉 **Tip notifications** with animations

## Bitcoin Builder Kit Components Used

- `<bitcoin-value>` - Display Bitcoin amounts with fiat conversion
- `<bitcoin-qr>` - Generate QR codes for Bitcoin payments
- `<bitcoin-address>` - Display Bitcoin addresses with copy functionality

## Getting Started

1. **Start the server:**
   ```bash
   npm start
   # or
   python3 -m http.server 8000
   ```

2. **Open your browser:**
   Navigate to `http://localhost:8000`

3. **Test the tip jar:**
   - Click the quick amount buttons to change tip amounts
   - Scan the QR code with your Bitcoin wallet
   - Use the demo button to simulate receiving tips

## Customization

### Change the Bitcoin Address
Edit the `walletAddress` in `script.js`:
```javascript
this.walletAddress = 'your-bitcoin-address-here';
```

### Modify Tip Amounts
Update the quick amount buttons in `index.html`:
```html
<button class="amount-btn" data-amount="0.0001">1,000 sats</button>
```

### Update Group Information
Change the group name and description in `index.html`:
```html
<h1>🎭 Your Group Name</h1>
<p class="subtitle">Your custom message here!</p>
```

## Technical Details

- **Framework:** Vanilla JavaScript with Bitcoin Builder Kit
- **Styling:** Custom CSS with Bitcoin orange theme
- **Storage:** LocalStorage for tip statistics
- **Responsive:** Mobile-first design approach

## Production Deployment

1. Replace the example Bitcoin address with your actual address
2. Remove the demo button from `script.js`
3. Deploy to your preferred hosting service
4. Consider adding backend integration for real-time tip tracking

## License

MIT License - Feel free to use for your own projects!