const fs = require('fs');
const path = require('path');

const source = "C:\\Users\\pehla\\.gemini\\antigravity\\brain\\be65af77-5f83-4a80-9ec3-38d6a33c961b\\user_dashboard_blurred_1773907792776.png";
const destination = "c:\\Users\\pehla\\OneDrive\\Desktop\\smart life scheduler\\smart-life-scheduler-frontend\\public\\user_dashboard_blurred.png";

try {
    fs.copyFileSync(source, destination);
    console.log(`Successfully copied ${source} to ${destination}`);
} catch (err) {
    console.error(`Error copying file: ${err.message}`);
    process.exit(1);
}
