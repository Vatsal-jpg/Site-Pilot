const fs = require('fs');
const file = 'sitebuilder/src/lib/htmlRenderer.ts';
let content = fs.readFileSync(file, 'utf8');

// Fix the backslashed backtick at the end of RESPONSIVE_CSS
content = content.replace('409:\n}\n\\`;', '409:\n}\n`;');
content = content.replace('  }\n}\n\\`;', '  }\n}\n`;');

// Be more aggressive
content = content.replace('\\`;\n\nexport function renderPageToHTML', '`;\n\nexport function renderPageToHTML');

// Fix DOCTYPE segment
const badHeader = `return \`< !DOCTYPE html>
  <html lang="en" >
    <head>
    <meta charset="UTF-8" >
      <meta name="viewport" content = "width=device-width, initial-scale=1.0" >
        <title>\${ esc(page.name) } </title>
          < link rel = "preconnect" href = "https://fonts.googleapis.com" >
            <link href="https://fonts.googleapis.com/css2?family=\${fontHeadingUrl}:wght@400;600;700;800&family=\${fontBodyUrl}:wght@300;400;500;600&display=swap" rel = "stylesheet" >
              <style>
    :root {
  --color - primary: \${ tokens.colorPrimary };
  --color - bg: \${ tokens.colorBg };
  --color - text: \${ tokens.colorText };
  --font - heading: '\${tokens.fontHeading}', sans - serif;
  --font - body: '\${tokens.fontBody}', sans - serif;
  --radius: \${ tokens.borderRadius };
}
    * { margin: 0; padding: 0; box- sizing: border - box; }
    body { background: var(--color - bg); color: var(--color - text); font - family: var(--font - body); }
    a { text - decoration: none; }
    img { max - width: 100 %; }
    
    \${ RESPONSIVE_CSS }
</style>
  </head>
  <body>
  \${ sectionsHTML }
</body>
  </html>\`;`;

const fixedHeader = `return \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${esc(page.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=\${fontHeadingUrl}:wght@400;600;700;800&family=\${fontBodyUrl}:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: \${tokens.colorPrimary};
      --color-bg: \${tokens.colorBg};
      --color-text: \${tokens.colorText};
      --font-heading: '\${tokens.fontHeading}', sans-serif;
      --font-body: '\${tokens.fontBody}', sans-serif;
      --radius: \${tokens.borderRadius};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); }
    a { text-decoration: none; }
    img { max-width: 100%; }
    
    \${RESPONSIVE_CSS}
  </style>
</head>
<body>
  \${sectionsHTML}
</body>
</html>\`;`;

content = content.replace(badHeader, fixedHeader);

// In case format differs:
const badHeaderRegex = /return `< !DOCTYPE html>[\s\S]*?<\/html>`;/;
content = content.replace(badHeaderRegex, fixedHeader);


fs.writeFileSync(file, content);
console.log('Fixed syntax errors');
