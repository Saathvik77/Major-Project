import fs from 'fs';

const content = fs.readFileSync('c:/Users/pehla/OneDrive/Desktop/smart life scheduler/smart-life-scheduler-frontend/src/pages/Analytics.jsx', 'utf8');

const stack = [];
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const tags = line.match(/<[a-zA-Z][^>]*>|<\/[a-zA-Z][^>]*>/g) || [];
  
  for (const tag of tags) {
    if (tag.endsWith('/>')) continue;
    
    if (tag.startsWith('</')) {
      const tagName = tag.match(/<\/([a-zA-Z0-9]+)/)[1];
      if (stack.length === 0) {
        console.log(`Error: Unexpected closing tag ${tag} at line ${i + 1}`);
      } else {
        const last = stack.pop();
        if (last.name !== tagName) {
          console.log(`Error: Tag mismatch. Expected </${last.name}> (from line ${last.line}) but found ${tag} at line ${i + 1}`);
        }
      }
    } else {
      const tagName = tag.match(/<([a-zA-Z0-9]+)/)[1];
      stack.push({ name: tagName, line: i + 1 });
    }
  }
}

if (stack.length > 0) {
  console.log('Unclosed tags:');
  stack.forEach(t => console.log(`  <${t.name}> at line ${t.line}`));
} else {
  console.log('All tags are balanced!');
}
