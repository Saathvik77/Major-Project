const fs = require('fs');
const path = require('path');

const targetDir = 'c:\\Users\\pehla\\OneDrive\\Desktop\\smart life scheduler\\smart-life-scheduler-frontend\\public\\assets\\3d';
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const brainDir = 'C:\\Users\\pehla\\.gemini\\antigravity\\brain\\d27c5697-ffdc-46ae-baff-363c69783ae7';
const files = {
    '3d_productivity_cube_subtle_1773253300095.png': 'productivity_cube.png',
    '3d_ai_assistant_orb_subtle_1773253332681.png': 'ai_assistant_orb.png',
    '3d_analytics_chart_subtle_1773253316736.png': 'analytics_chart.png',
    '3d_reports_doc_1773255336707.png': 'reports_doc.png',
    '3d_health_heart_1773255358453.png': 'health_heart.png'
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
