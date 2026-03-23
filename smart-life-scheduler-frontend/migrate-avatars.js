const fs = require('fs');
const path = require('path');

const targetDir = 'c:\\Users\\pehla\\OneDrive\\Desktop\\smart life scheduler\\smart-life-scheduler-frontend\\public\\assets';
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const brainDir = 'C:\\Users\\pehla\\.gemini\\antigravity\\brain\\58cc9d40-35c8-4ffa-978c-8bdcbed4cff6';
const files = {
    'male_3d_avatar_1774251745202.png': 'male_avatar.png',
    'female_3d_avatar_1774251763378.png': 'female_avatar.png'
};

for (const [src, dest] of Object.entries(files)) {
    const srcPath = path.join(brainDir, src);
    const destPath = path.join(targetDir, dest);
    try {
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${src} to ${dest}`);
        } else {
            console.error(`Source file not found: ${srcPath}`);
        }
    } catch (e) {
        console.error(`Error copying ${src}: ${e.message}`);
    }
}
