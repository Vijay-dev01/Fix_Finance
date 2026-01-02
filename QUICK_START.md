# Quick Start Guide

## Starting the App

### Option 1: LAN Mode (Recommended for Same Network)
If your device/emulator and computer are on the same Wi-Fi network:
```bash
npm run start:lan
```
Then scan the QR code with Expo Go or press `a` for Android.

### Option 2: Localhost (For Android Emulator)
If using Android emulator:
```bash
# First, set up port forwarding
adb reverse tcp:8081 tcp:8081

# Then start with localhost
npm run start:localhost
```

### Option 3: Regular Mode
Standard Expo start:
```bash
npm start
```
Then:
- Press `a` for Android emulator
- Scan QR code for physical device (same network required)

### Option 4: Direct Android Launch
```bash
npm run android
```

## Troubleshooting Connection Issues

### If you see "SocketTimeoutException" or connection errors:

1. **For Android Emulator:**
   ```bash
   adb reverse tcp:8081 tcp:8081
   npm run start:localhost
   ```

2. **For Physical Device (Same Wi-Fi):**
   ```bash
   npm run start:lan
   ```

3. **Clear Cache:**
   ```bash
   npm start -- --reset-cache
   ```

4. **Check Firewall:**
   - Make sure port 8081 is not blocked
   - Allow Node.js through firewall

5. **Restart Everything:**
   - Close Metro bundler (Ctrl+C)
   - Close app on device
   - Restart: `npm start`

## Note About Tunnel Mode
Tunnel mode (`--tunnel`) uses ngrok and can be slow or timeout. Use LAN mode instead if you're on the same network.





