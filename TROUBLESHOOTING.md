# Troubleshooting Guide

## Metro Bundler Connection Timeout (SocketTimeoutException)

If you see an error like:
```
java.net.SocketTimeoutException: failed to connect to /192.168.0.104 (port 8081)
```

This is a **development server connection issue**, not an app code problem. Here's how to fix it:

### Solution 1: Check Metro Bundler is Running
1. Make sure you've started the Metro bundler:
   ```bash
   npm start
   ```
2. Wait for it to fully start (you should see "Metro waiting on...")

### Solution 2: Check Network Connection
1. Ensure your device/emulator and computer are on the same Wi-Fi network
2. Check firewall settings - port 8081 might be blocked
3. Try using `localhost` instead of IP address:
   ```bash
   npm start -- --localhost
   ```

### Solution 3: Use Tunnel Mode (Expo)
If you're using Expo, try tunnel mode:
```bash
npm start -- --tunnel
```

### Solution 4: Clear Cache and Restart
```bash
# Clear Metro bundler cache
npm start -- --reset-cache

# Or clear Expo cache
expo start -c
```

### Solution 5: Check Port 8081
1. Make sure port 8081 is not being used by another process
2. Try using a different port:
   ```bash
   npm start -- --port 8082
   ```

### Solution 6: For Android Emulator
If using Android emulator, try:
```bash
# Use localhost instead of network IP
adb reverse tcp:8081 tcp:8081
npm start
```

### Solution 7: Check Firewall/Antivirus
- Temporarily disable firewall/antivirus to test
- Add port 8081 to firewall exceptions
- Allow Node.js through firewall

### Solution 8: Restart Everything
1. Close Metro bundler (Ctrl+C)
2. Close the app on device/emulator
3. Restart Metro: `npm start`
4. Reload the app

## Note
The app code has been updated to handle these errors gracefully. Even if you see this error, the app should continue working once the connection is established.

