const fs = require('fs');
const path = require('path');

const b64Path = 'C:\\Users\\arsha\\.gemini\\antigravity\\scratch\\arspin\\avatar_b64.txt';
const indexPath = 'C:\\Users\\arsha\\.gemini\\antigravity\\scratch\\arspin\\index.html';
const jsPath = 'C:\\Users\\arsha\\.gemini\\antigravity\\scratch\\arspin\\app.js';
const outPath = 'C:\\Users\\arsha\\.gemini\\antigravity\\brain\\4e82f2e8-7e86-47dd-8490-80060423342c\\arspin.html';

const b64 = fs.readFileSync(b64Path, 'utf8').trim();
let html = fs.readFileSync(indexPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

html = html.replace('src="avatar.png"', `src="data:image/png;base64,${b64}"`);
html = html.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);

fs.writeFileSync(outPath, html, 'utf8');
console.log('Successfully generated arspin.html artifact!');
