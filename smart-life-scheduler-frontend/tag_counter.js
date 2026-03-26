import fs from 'fs';

const content = fs.readFileSync('c:/Users/pehla/OneDrive/Desktop/smart life scheduler/smart-life-scheduler-frontend/src/pages/Analytics.jsx', 'utf8');

const divOpen = (content.match(/<div/g) || []).length;
const divClose = (content.match(/<\/div>/g) || []).length;
const selfClosing = (content.match(/<div[^>]*\/>/g) || []).length;

console.log(`Div Open: ${divOpen}`);
console.log(`Div Close: ${divClose}`);
console.log(`Div Self-Closing: ${selfClosing}`);
console.log(`Balance: ${divOpen - selfClosing - divClose}`);

const headerOpen = (content.match(/<header/g) || []).length;
const headerClose = (content.match(/<\/header>/g) || []).length;
console.log(`Header: ${headerOpen} vs ${headerClose}`);

const buttonOpen = (content.match(/<button/g) || []).length;
const buttonClose = (content.match(/<\/button>/g) || []).length;
console.log(`Button: ${buttonOpen} vs ${buttonClose}`);

const componentOpen = (content.match(/<[A-Z]/g) || []).length;
const componentClose = (content.match(/<\/[A-Z]/g) || []).length;
console.log(`Components (Approx): ${componentOpen} vs ${componentClose}`);
