// Node.js script to generate PWA icons
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVGIcon = (size) => {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white">123</text>
  <text x="80%" y="25%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.12}" fill="white">🔊</text>
</svg>`;
};

// Create placeholder PNG data (base64 encoded 1x1 transparent pixel)
const createPlaceholderIcon = () => {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
};

const sizes = [192, 512];

// Create icons directory if it doesn't exist
if (!fs.existsSync('icons')) {
  fs.mkdirSync('icons');
}

// Generate SVG files for each size
sizes.forEach(size => {
  const svg = createSVGIcon(size);
  fs.writeFileSync(`icons/icon-${size}x${size}.svg`, svg);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log('SVG icons generated successfully!');
console.log('To convert to PNG, you can:');
console.log('1. Open create-icons.html in your browser and download PNG icons');
console.log('2. Use online SVG to PNG converters');
console.log('3. Use tools like Inkscape or ImageMagick');