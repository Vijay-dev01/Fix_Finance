# SMS Tracking - Development vs Production Build

## ⚠️ Important: SMS Tracking Requires Custom Build

The SMS tracking feature uses `react-native-get-sms-android`, which is a **native module**. This means:

### ❌ Won't Work With:
- **Expo Go** - Expo Go doesn't include custom native modules
- **Standard `npm start`** - Only works for JavaScript code

### ✅ Will Work With:

## Option 1: Development Build (For Testing)

You can create a development build that includes the native SMS module:

```bash
# Install Expo CLI tools
npm install -g @expo/cli

# Create a development build
npx expo run:android
```

This will:
- Compile native code including SMS module
- Install on connected device/emulator
- Allow hot reloading for development
- Include all native modules

**Note:** First time setup requires Android Studio and takes longer.

## Option 2: Production Build (Recommended for Real Use)

Build a production APK with EAS:

```bash
npm run build:android
```

This creates a standalone APK with:
- All native modules compiled
- SMS permissions included
- Ready for installation on any Android device

## Quick Comparison

| Method | SMS Tracking | Setup Time | Best For |
|--------|-------------|------------|----------|
| Expo Go | ❌ No | Instant | Quick JS testing |
| Development Build | ✅ Yes | 5-10 min | Active development |
| Production APK | ✅ Yes | 15-20 min | Real device use |

## Testing SMS Feature

### For Development:
1. Use `npx expo run:android` to create development build
2. Grant SMS permission when prompted
3. Test SMS reading functionality
4. Hot reload works for JS changes

### For Production:
1. Build APK: `npm run build:android`
2. Install APK on device
3. Grant SMS permission
4. Use SMS tracking feature

## Why Native Modules Need Custom Builds

Native modules like `react-native-get-sms-android` require:
- Native Android code compilation
- Linking to Android SDK
- Permission declarations in AndroidManifest.xml
- These aren't included in Expo Go's pre-built runtime

## Alternative: Test Without SMS (Development)

If you want to test other features without building:

1. The SMS screen will show "SMS module not available" message
2. Other features (manual transactions, categories, etc.) work fine
3. You can test the UI and flow
4. SMS functionality will work once you build the APK

---

**Recommendation:** For testing SMS feature, use `npx expo run:android` for development build, or build the APK for production use.

