const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\pehla\\.gemini\\antigravity\\brain\\be65af77-5f83-4a80-9ec3-38d6a33c961b\\dashboard_3d_illustration_1773902702976.png';
const dest = 'c:\\Users\\pehla\\OneDrive\Desktop\\smart life scheduler\\smart-life-scheduler-frontend\\public\\assets\\3d\\dashboard_hero.png';

try {
  const data = fs.readFileSync(src);
  fs.writeFileSync(dest, data);
  console.log('Successfully wrote binary to ' + dest);
} catch (err) {
  console.error('Error:', err.message);
}
