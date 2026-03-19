const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\pehla\\.gemini\\antigravity\\brain\\be65af77-5f83-4a80-9ec3-38d6a33c961b\\dashboard_3d_illustration_1773902702976.png';
const dest = 'c:\\Users\\pehla\\OneDrive\\Desktop\\smart life scheduler\\smart-life-scheduler-frontend\\src\\constants\\heroImage.js';

try {
  const data = fs.readFileSync(src);
  const base64 = data.toString('base64');
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const content = `export const DASHBOARD_HERO_IMAGE = "data:image/png;base64,${base64}";\n`;
  fs.writeFileSync(dest, content);
  console.log('Successfully generated Data URL in ' + dest);
} catch (err) {
  console.error('Error:', err.message);
}
