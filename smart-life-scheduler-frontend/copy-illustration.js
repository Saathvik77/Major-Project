const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\pehla\\.gemini\\antigravity\\brain\\fbc32a63-5171-4ebd-8ab7-0b1c34942e21\\glassmorphism_illustration_1773285388495.png';
const dest = path.join(__dirname, 'public', 'assets', '3d', 'glass_illustration.png');

try {
    if (!fs.existsSync(src)) {
        console.error('Source file not found: ' + src);
        process.exit(1);
    }
    fs.copyFileSync(src, dest);
    console.log('Successfully copied to ' + dest);
} catch (err) {
    console.error('Error copying file:', err.message);
    process.exit(1);
}
