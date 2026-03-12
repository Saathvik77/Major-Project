const fs = require('fs');
const path = require('path');

const src = 'C:/Users/pehla/.gemini/antigravity/brain/fbc32a63-5171-4ebd-8ab7-0b1c34942e21/glassmorphism_illustration_1773285388495.png';
const dest = 'c:/Users/pehla/OneDrive/Desktop/smart life scheduler/smart-life-scheduler-frontend/src/IllustrationData.js';

console.log('Checking source...');
if (!fs.existsSync(src)) {
    console.error('Source file does not exist at ' + src);
    process.exit(1);
}

try {
    console.log('Reading source image...');
    const data = fs.readFileSync(src);
    const base64 = data.toString('base64');
    const content = 'export const illustrationBase64 = "data:image/png;base64,' + base64 + '";';
    
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    
    console.log('Writing Base64 JS file...');
    fs.writeFileSync(dest, content);
    console.log('Successfully written ' + content.length + ' chars to ' + dest);
} catch (err) {
    console.error('Operation failed:', err.message);
}
