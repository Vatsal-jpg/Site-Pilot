const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'sitebuilder/src/lib/htmlRenderer.ts');
let content = fs.readFileSync(targetPath, 'utf8');

const funcsToAdd = `
function getHeroImage(tokens: BrandTokens, query: string, width: number = 1200, height: number = 800): string {
  if (tokens.uploadedImages && tokens.uploadedImages.length > 0) {
    return tokens.uploadedImages[0];
  }
  return getImageUrl(query, width, height);
}

function getGalleryImage(tokens: BrandTokens, query: string, index: number, width: number = 800, height: number = 800): string {
  if (tokens.uploadedImages && tokens.uploadedImages.length > index) {
    return tokens.uploadedImages[index];
  }
  return getImageUrl(query + index, width, height);
}
`;

if (!content.includes('function getHeroImage')) {
    content = content.replace('function getImageUrl', funcsToAdd + '\nfunction getImageUrl');
}

const renderSectionIdx = content.indexOf('export function renderSection');
if (renderSectionIdx !== -1) {
    let before = content.slice(0, renderSectionIdx);
    let str = content.slice(renderSectionIdx);

    // Hero replacements
    str = str.replace(/getImageUrl\(s\.imageQuery \|\| s\.headline, 800, 1000\)/g, "getHeroImage(tokens, s.imageQuery || s.headline || '', 800, 1000)");
    str = str.replace(/getImageUrl\(s\.imageQuery \|\| s\.headline, 1920, 1080\)/g, "getHeroImage(tokens, s.imageQuery || s.headline || '', 1920, 1080)");
    str = str.replace(/getImageUrl\(s\.imageQuery \|\| s\.headline, 800, 800\)/g, "getHeroImage(tokens, s.imageQuery || s.headline || '', 800, 800)");

    // Gallery replacements
    str = str.replace(
        /mapArray\(s\.images, img => `<img src="\$\{getImageUrl\(img\.alt \|\| 'photo', 600, 600\)\}"/g,
        "mapArray(s.images, (img, i) => `<img src=\"${getGalleryImage(tokens, img.alt || 'photo', i, 600, 600)}\""
    );

    fs.writeFileSync(targetPath, before + str);
    console.log('Image logic replaced');
}
