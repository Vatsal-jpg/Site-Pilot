const fs = require('fs');
const file = 'sitebuilder/src/lib/htmlRenderer.ts';
let content = fs.readFileSync(file, 'utf8');

const badChunk = `    case 'TestimonialGrid':
    case 'TestimonialCarousel':
      return \`< section class="\${name === 'TestimonialGrid' ? 'c-testimonial-grid' : 'c-testimonial-carousel'}" style = "background:#080808;padding:100px 48px;font-family:var(--font-body)" >
        <div class="c-testimonial-grid__inner" style = "max-width:1200px;margin:0 auto" >
          <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,48px);font-weight:700;color:#fff;letter-spacing:-0.02em;text-align:center;margin-bottom:64px" > \${ esc(s.headline || 'What people say') } </h2>
            < div class="\${name === 'TestimonialGrid' ? 'c-testimonial-grid__grid' : 'c-testimonial-carousel__grid'}" style = "display:grid;grid-template-columns:repeat(\${name === 'TestimonialCarousel' ? 1 : 3},1fr);gap:24px" >
              \${
        mapArray(s.items, (item, i) => \`
            <div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:32px;\${name === 'TestimonialCarousel' && i > 0 ? 'display:none' : ''}">
              <div style="color:var(--color-primary);font-size:32px;margin-bottom:16px;opacity:0.6">"</div>
              <p style="font-size:\${name === 'TestimonialCarousel' ? '24px' : '15px'};color:rgba(255,255,255,0.7);line-height:1.8;margin-bottom:24px">\${esc(item.quote || 'Amazing product!')}</p>
              <div style="display:flex;align-items:center;gap:12px">
                <img src="\${getImageUrl('person', 100, 100)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover" />
                <div>
                  <div style="font-size:14px;font-weight:600;color:#fff">\${esc(item.name || 'User')}</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.4)">\${esc(item.role || 'Customer')}</div>
                </div>
              </div>
            </div>\`)
      }
      </div>
        </div>
        </section>\`;`;

const fixedChunk = `      </section>\`;

    case 'TestimonialGrid':
    case 'TestimonialCarousel':
      return \`<section class="\${name === 'TestimonialGrid' ? 'c-testimonial-grid' : 'c-testimonial-carousel'}" style="background:#080808;padding:100px 48px;font-family:var(--font-body)">
        <div class="c-testimonial-grid__inner" style="max-width:1200px;margin:0 auto">
          <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,48px);font-weight:700;color:#fff;letter-spacing:-0.02em;text-align:center;margin-bottom:64px">\${esc(s.headline || 'What people say')}</h2>
          <div class="\${name === 'TestimonialGrid' ? 'c-testimonial-grid__grid' : 'c-testimonial-carousel__grid'}" style="display:grid;grid-template-columns:repeat(\${name === 'TestimonialCarousel' ? 1 : 3},1fr);gap:24px">
            \${mapArray(s.items, (item, i) => \`
            <div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:32px;\${name === 'TestimonialCarousel' && i > 0 ? 'display:none' : ''}">
              <div style="color:var(--color-primary);font-size:32px;margin-bottom:16px;opacity:0.6">"</div>
              <p style="font-size:\${name === 'TestimonialCarousel' ? '24px' : '15px'};color:rgba(255,255,255,0.7);line-height:1.8;margin-bottom:24px">\${esc(item.quote || 'Amazing product!')}</p>
              <div style="display:flex;align-items:center;gap:12px">
                <img src="\${getImageUrl('person', 100, 100)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover" />
                <div>
                  <div style="font-size:14px;font-weight:600;color:#fff">\${esc(item.name || 'User')}</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.4)">\${esc(item.role || 'Customer')}</div>
                </div>
              </div>
            </div>\`)}
          </div>
        </div>
      </section>\`;`;

// use regex because exact spacing could differ
const fixRegex = / {4}case 'TestimonialGrid':[\s\S]*?<\/section>`[;]?/m;

if (fixRegex.test(content)) {
    content = content.replace(fixRegex, fixedChunk);
    fs.writeFileSync(file, content);
    console.log('Fixed TestimonialGrid chunk');
} else {
    console.log("Regex didn't match");
}
