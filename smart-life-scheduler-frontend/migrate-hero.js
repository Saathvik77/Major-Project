const fs = require('fs');
const path = require('path');

const targetDir = 'c:\\Users\\pehla\\OneDrive\Desktop\\smart life scheduler\\smart-life-scheduler-frontend\\public\\assets';
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const brainDir = 'C:\\Users\\pehla\\.gemini\\antigravity\brain\\58cc9d40-35c8-4ffa-978c-8bdcbed4cff6';
const srcFile = 'dashboard_hero_desk_png_1774257869463.png';
const destFile = 'dashboard_hero.png';

const srcPath = path.join(brainDir, srcFile);
const destPath = path.join(targetDir, destFile);

try {
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${srcFile} to ${destFile}`);
    } else {
        console.error(`Source file not found: ${srcPath}`);
    }
} catch (e) {
    console.error(`Error copying: ${e.message}`);
}
