# Creating App Assets

The build failed because assets are missing. Here's how to create them quickly:

## Quick Solution: Use Online Tools

### Option 1: AppIcon.co (Easiest)
1. Visit: https://www.appicon.co/
2. Upload any image or use their generator
3. Download the generated assets
4. Extract and place in `assets/` folder:
   - `icon.png` (1024x1024)
   - `adaptive-icon.png` (1024x1024) 
   - `splash.png` (1242x2436)

### Option 2: Expo Asset Generator
1. Visit: https://github.com/expo/expo-cli/tree/main/packages/asset-generator
2. Or use: `npx @expo/asset-generator`

### Option 3: Simple Placeholder (For Testing)
Create a simple 1024x1024 orange square with text "MBP" (Monthly Budget Planner) using any image editor.

## Current Status
I've updated `app.json` to not require assets for now, but Expo still needs at least an icon for production builds.

## After Creating Assets
1. Place files in `assets/` folder:
   - `icon.png`
   - `adaptive-icon.png` (optional but recommended)
   - `splash.png` (optional)
   - `favicon.png` (optional, for web)

2. Update `app.json` to reference them:
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#000000"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      }
    }
  }
}
```

3. Try building again:
```bash
npm run build:android
```

