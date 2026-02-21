const fs = require('fs');
const file = 'sitebuilder/src/lib/htmlRenderer.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('\\`;\n\nexport function renderPageToHTML', '`;\n\nexport function renderPageToHTML');
// Also try with \r\n
content = content.replace('\\`;\r\n\r\nexport function renderPageToHTML', '`;\r\n\r\nexport function renderPageToHTML');
fs.writeFileSync(file, content);
console.log('Fixed backtick escape');
