// Simple script to generate placeholder assets
// Run with: node scripts/generate-assets.js

const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('⚠️  Placeholder assets need to be created manually.');
console.log('📝 For now, the build will use default Expo assets.');
console.log('');
console.log('To create proper assets:');
console.log('1. Visit https://www.appicon.co/');
console.log('2. Generate icon.png (1024x1024)');
console.log('3. Generate adaptive-icon.png (1024x1024)');
console.log('4. Generate splash.png (1242x2436)');
console.log('5. Place them in the assets/ folder');

