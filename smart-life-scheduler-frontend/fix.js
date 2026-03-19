const fs = require('fs');
const file = 'c:\\\\Users\\\\pehla\\\\OneDrive\\\\Desktop\\\\smart life scheduler\\\\smart-life-scheduler-frontend\\\\src\\\\Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\s*<div className=\"flex items-center gap-2 mb-8\">[\\s\\S]*?Neural Analytics Engine Active[\\s\\S]*?<\\/div >\\s *<\\/div>/g, '');
fs.writeFileSync(file, content);
console.log('Fixed');
