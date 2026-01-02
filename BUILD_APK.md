# Building and Installing APK on Mobile Device

## Method 1: Using EAS Build (Recommended - Easiest)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS Build
```bash
eas build:configure
```
This will create an `eas.json` file.

### Step 4: Build APK
```bash
# Build APK for Android
eas build --platform android --profile preview

# Or build AAB (for Play Store)
eas build --platform android --profile production
```

### Step 5: Download and Install
1. EAS will provide a download link
2. Download the APK to your phone
3. Enable "Install from Unknown Sources" in Android settings
4. Open the APK file and install

---

## Method 2: Using Expo Build (Classic - May be deprecated)

### Step 1: Install Expo CLI
```bash
npm install -g expo-cli
```

### Step 2: Build APK
```bash
expo build:android -t apk
```

### Step 3: Download and Install
1. Wait for build to complete (takes 10-20 minutes)
2. Download the APK from the provided link
3. Transfer to your phone and install

---

## Method 3: Local Development Build (Advanced)

### Step 1: Install Android Studio
- Download and install Android Studio
- Install Android SDK and build tools

### Step 2: Generate Keystore
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Step 3: Configure app.json
Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "package": "com.monthlybudgetplanner",
      "versionCode": 1
    }
  }
}
```

### Step 4: Build Locally
```bash
npx expo run:android --variant release
```

---

## Quick Method: Using Expo Go (For Testing)

If you just want to test the app quickly:

1. **Install Expo Go** on your Android device from Play Store

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Connect your phone:**
   - Same Wi-Fi: Scan QR code with Expo Go
   - Different network: Use `npm run start:lan` or tunnel mode

**Note:** Expo Go has limitations and may not support all native features.

---

## Installing APK on Your Phone

### Step 1: Enable Unknown Sources
1. Go to **Settings** → **Security** (or **Apps** → **Special access**)
2. Enable **"Install unknown apps"** or **"Unknown sources"**
3. Select your file manager/browser

### Step 2: Transfer APK
- **Option A:** Download directly on phone from the build link
- **Option B:** Transfer via USB, email, or cloud storage

### Step 3: Install
1. Open the APK file on your phone
2. Tap **"Install"**
3. Wait for installation to complete
4. Tap **"Open"** to launch the app

---

## Troubleshooting

### "App not installed" Error
- Check if you have enough storage space
- Uninstall any previous version first
- Make sure APK is for the correct architecture (arm64-v8a, armeabi-v7a, x86_64)

### Build Fails
- Make sure you have a valid `app.json` configuration
- Check that all dependencies are installed: `npm install`
- Try clearing cache: `npm start -- --reset-cache`

### Can't Connect to Build Service
- Check your internet connection
- Make sure you're logged in: `eas login`
- Try again after a few minutes

---

## Recommended Approach

For first-time users, I recommend **Method 1 (EAS Build)** as it's the easiest and most reliable:

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure
eas build:configure

# 4. Build APK
eas build --platform android --profile preview

# 5. Download and install on your phone
```

The build will take 10-20 minutes, and you'll get a download link via email or in the terminal.





