const fs = require('fs');
const path = require('path');

const BRAIN_DIR = 'C:\\Users\\pehla\\.gemini\\antigravity\\brain\\be65af77-5f83-4a80-9ec3-38d6a33c961b';
const PUBLIC_DIR = path.join(__dirname, 'public');
const ASSETS_3D_DIR = path.join(PUBLIC_DIR, 'assets', '3d');

// Ensure directory exists
if (!fs.existsSync(ASSETS_3D_DIR)) {
    fs.mkdirSync(ASSETS_3D_DIR, { recursive: true });
}

const filesToMigrate = [
    { 
        src: path.join(BRAIN_DIR, 'dashboard_3d_illustration_1773902702976.png'), 
        dest: path.join(ASSETS_3D_DIR, 'dashboard_hero.png') 
    }
];

filesToMigrate.forEach(file => {
    if (fs.existsSync(file.src)) {
        try {
            fs.copyFileSync(file.src, file.dest);
            console.log(`Successfully migrated: ${path.basename(file.src)} -> ${file.dest}`);
        } catch (err) {
            console.error(`Error migrating ${file.src}:`, err.message);
        }
    } else {
        console.error(`Source file not found: ${file.src}`);
    }
});
