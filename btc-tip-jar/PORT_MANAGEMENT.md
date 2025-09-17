# Port Management Commands

## Useful commands for managing ports and processes:

### Check what's running on a specific port:
```bash
# Check port 5173 (Vite default)
lsof -i :5173

# Check port 8888 (Netlify dev)
lsof -i :8888
```

### Kill processes on specific ports:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 8888
lsof -ti:8888 | xargs kill -9
```

### Kill processes by name:
```bash
# Kill all netlify dev processes
pkill -f "netlify dev"

# Kill all vite processes
pkill -f "vite"

# Kill all node processes (be careful with this one!)
pkill node
```

### Check all listening ports:
```bash
# Show all listening ports
netstat -an | grep LISTEN

# Show only ports with process info
lsof -i -P -n | grep LISTEN
```

## If you're still having issues:

1. **Kill all related processes:**
   ```bash
   pkill -f "netlify"
   pkill -f "vite"
   lsof -ti:5173 | xargs kill -9
   lsof -ti:8888 | xargs kill -9
   ```

2. **Start fresh:**
   ```bash
   npm run dev
   ```

3. **Alternative: Run Vite directly (without Netlify dev):**
   ```bash
   npm run start
   # This will run on http://localhost:5173
   ```

## The Fix Applied:

Updated `netlify.toml` to properly configure the development server:
```toml
[dev]
  command = "npm run start"  # Uses Vite directly
  port = 8888               # Netlify dev serves on this port
  targetPort = 5173         # Vite runs on this port internally
```

This tells Netlify dev to:
- Start Vite on port 5173 internally
- Proxy requests through Netlify dev on port 8888
- Handle environment variables and serverless functions properly
