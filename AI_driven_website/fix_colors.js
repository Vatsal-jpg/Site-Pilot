const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'sitebuilder/src/lib/htmlRenderer.ts');
let content = fs.readFileSync(targetPath, 'utf8');

const renderSectionIdx = content.indexOf('export function renderSection');
if (renderSectionIdx !== -1) {
    const before = content.slice(0, renderSectionIdx);
    let renderSectionStr = content.slice(renderSectionIdx);

    // Replace background colors with variables
    renderSectionStr = renderSectionStr.replace(/#0f0f0f/g, 'var(--color-bg)');
    renderSectionStr = renderSectionStr.replace(/#111(?![0-9a-fA-F])/g, 'var(--color-bg)');
    renderSectionStr = renderSectionStr.replace(/#1a1a1a/g, 'var(--color-surface)');
    renderSectionStr = renderSectionStr.replace(/#242424/g, 'var(--color-surface)');

    // Also we want to inject uploaded images logic. Let's do a search and replace for img src in hero
    // Right now they look like: src="${getImageUrl(...)}"
    // Wait, let's keep image injection for a manual replacement to be safe.

    fs.writeFileSync(targetPath, before + renderSectionStr);
    console.log('Colors replaced successfully');
} else {
    console.log('Could not find renderSection');
}
