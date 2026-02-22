import type { Page, Section, Site } from '@/lib/types';

export interface BrandTokens {
  colorPrimary: string;
  colorBg: string;
  colorSurface: string;
  colorText: string;
  colorAccent: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string;
  logoUrl?: string;
  uploadedImages: string[];
}

export function getBrandTokens(site: Site, branding?: any): BrandTokens {
  const palette = site.palette || branding?.palette || null;

  return {
    colorPrimary: branding?.primaryColor || palette?.primary || site.brandColor || '#6366f1',
    colorBg: branding?.bgColor || palette?.bg || '#0f0f0f',
    colorSurface: palette?.surface || '#1a1a1a',
    colorText: palette?.text || '#ffffff',
    colorAccent: branding?.accentColor || palette?.accent || branding?.primaryColor || site.brandColor || '#818cf8',
    fontHeading: branding?.fontHeading || 'Syne',
    fontBody: branding?.fontBody || 'Inter',
    borderRadius: branding?.borderRadius || '8px',
    logoUrl: branding?.logoUrl || site.logoUrl || undefined,
    uploadedImages: site.uploadedImages || [],
  };
}

function esc(str: unknown): string {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


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

function getImageUrl(query: string, width: number = 1200, height: number = 800): string {
  if (!query) return `https://picsum.photos/seed/placeholder/${width}/${height}`;
  const seed = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

const RESPONSIVE_CSS = `
/* ── NavBar ── */
@media (max-width: 768px) {
  .c-navbar { padding: 0 20px !important; }
  .c-navbar .nav-links { display: none !important; }
  .c-navbar .nav-cta { display: none !important; }
}

/* ── HeroSplit ── */
@media (max-width: 1024px) {
  .c-hero-split__grid {
    grid-template-columns: 1fr !important;
    gap: 48px !important;
  }
  .c-hero-split__grid img {
    height: 360px !important;
  }
}
@media (max-width: 768px) {
  .c-hero-split {
    padding: 60px 20px 60px !important;
    min-height: auto !important;
  }
  .c-hero-split h1 {
    font-size: 40px !important;
    line-height: 1.05 !important;
  }
  .c-hero-split p {
    font-size: 16px !important;
  }
  .c-hero-split__grid img {
    height: 260px !important;
  }
}

/* ── HeroCentered ── */
@media (max-width: 768px) {
  .c-hero-centered {
    padding: 80px 20px 60px !important;
  }
  .c-hero-centered h1 {
    font-size: 44px !important;
  }
  .c-hero-centered__ctas {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  .c-hero-centered__ctas a {
    text-align: center !important;
  }
}

/* ── HeroFullBleed ── */
@media (max-width: 768px) {
  .c-hero-fullbleed {
    padding: 80px 20px !important;
    min-height: 70vh !important;
  }
  .c-hero-fullbleed h1 {
    font-size: 40px !important;
  }
}

/* ── HeroMinimal ── */
@media (max-width: 768px) {
  .c-hero-minimal {
    padding: 80px 20px 60px !important;
  }
  .c-hero-minimal h1 {
    font-size: 40px !important;
  }
}

/* ── FeatureGrid ── */
@media (max-width: 1024px) {
  .c-feature-grid__items {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 640px) {
  .c-feature-grid {
    padding: 60px 20px !important;
  }
  .c-feature-grid__items {
    grid-template-columns: 1fr !important;
  }
}

/* ── FeatureList ── */
@media (max-width: 768px) {
  .c-feature-list {
    padding: 60px 20px !important;
  }
  .c-feature-list__item {
    grid-template-columns: 1fr !important;
    gap: 32px !important;
  }
  .c-feature-list__item img {
    height: 240px !important;
    order: -1 !important;
  }
}

/* ── TestimonialGrid ── */
@media (max-width: 1024px) {
  .c-testimonial-grid__items {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 640px) {
  .c-testimonial-grid {
    padding: 60px 20px !important;
  }
  .c-testimonial-grid__items {
    grid-template-columns: 1fr !important;
  }
}

/* ── Metrics ── */
@media (max-width: 768px) {
  .c-metrics {
    padding: 60px 20px !important;
  }
  .c-metrics__items {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 32px !important;
  }
  .c-metrics__items .stat-number {
    font-size: 40px !important;
  }
}
@media (max-width: 400px) {
  .c-metrics__items {
    grid-template-columns: 1fr !important;
  }
}

/* ── LogoBar ── */
@media (max-width: 768px) {
  .c-logo-bar {
    padding: 40px 20px !important;
  }
  .c-logo-bar .logos-row {
    gap: 24px !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
  }
}

/* ── CTABanner ── */
@media (max-width: 1024px) {
  .c-cta__inner {
    flex-direction: column !important;
    text-align: center !important;
    gap: 32px !important;
    padding: 60px 40px !important;
  }
  .c-cta__buttons {
    justify-content: center !important;
  }
}
@media (max-width: 640px) {
  .c-cta { padding: 20px !important; }
  .c-cta__inner { padding: 48px 28px !important; }
  .c-cta__buttons {
    flex-direction: column !important;
    width: 100% !important;
  }
  .c-cta__buttons a {
    text-align: center !important;
    width: 100% !important;
  }
}

/* ── PricingTable ── */
@media (max-width: 1024px) {
  .c-pricing__grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 640px) {
  .c-pricing {
    padding: 60px 20px !important;
  }
  .c-pricing__grid {
    grid-template-columns: 1fr !important;
    max-width: 400px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

/* ── TeamGrid ── */
@media (max-width: 1024px) {
  .c-team-grid__items {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}
@media (max-width: 768px) {
  .c-team-grid {
    padding: 60px 20px !important;
  }
  .c-team-grid__items {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 24px !important;
  }
}
@media (max-width: 480px) {
  .c-team-grid__items {
    grid-template-columns: 1fr !important;
  }
}

/* ── AboutSplit ── */
@media (max-width: 1024px) {
  .c-about-split__grid {
    grid-template-columns: 1fr !important;
    gap: 48px !important;
  }
}
@media (max-width: 768px) {
  .c-about-split {
    padding: 60px 20px !important;
  }
}

/* ── FAQ ── */
@media (max-width: 768px) {
  .c-faq {
    padding: 60px 20px !important;
  }
  .c-faq h2 {
    font-size: 32px !important;
  }
}

/* ── Gallery ── */
@media (max-width: 1024px) {
  .c-gallery__grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 640px) {
  .c-gallery {
    padding: 60px 20px !important;
  }
  .c-gallery__grid {
    grid-template-columns: 1fr !important;
  }
}

/* ── BlogFeed ── */
@media (max-width: 1024px) {
  .c-blog-feed__grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 640px) {
  .c-blog-feed {
    padding: 60px 20px !important;
  }
  .c-blog-feed__grid {
    grid-template-columns: 1fr !important;
  }
}

/* ── Values ── */
@media (max-width: 1024px) {
  .c-values__grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 640px) {
  .c-values {
    padding: 60px 20px !important;
  }
  .c-values__grid {
    grid-template-columns: 1fr !important;
  }
}

/* ── Timeline ── */
@media (max-width: 768px) {
  .c-timeline {
    padding: 60px 20px !important;
  }
  .c-timeline__items {
    padding-left: 20px !important;
  }
}

/* ── ContactForm ── */
@media (max-width: 768px) {
  .c-contact {
    padding: 60px 20px !important;
  }
}

/* ── NewsletterSignup ── */
@media (max-width: 768px) {
  .c-newsletter {
    padding: 60px 20px !important;
  }
  .c-newsletter .input-row {
    flex-direction: column !important;
  }
  .c-newsletter .input-row input {
    width: 100% !important;
    border-radius: 8px !important;
  }
  .c-newsletter .input-row button {
    width: 100% !important;
    border-radius: 8px !important;
  }
}

/* ── FooterFull ── */
@media (max-width: 1024px) {
  .c-footer-full__columns {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 40px !important;
  }
}
@media (max-width: 640px) {
  .c-footer-full {
    padding: 60px 20px 32px !important;
  }
  .c-footer-full__columns {
    grid-template-columns: 1fr !important;
  }
  .c-footer-full__bottom {
    flex-direction: column !important;
    gap: 16px !important;
    text-align: center !important;
  }
}

/* ── FooterMinimal ── */
@media (max-width: 640px) {
  .c-footer-minimal {
    padding: 32px 20px !important;
    flex-direction: column !important;
    gap: 20px !important;
    text-align: center !important;
  }
  .c-footer-minimal .footer-links {
    flex-wrap: wrap !important;
    justify-content: center !important;
  }
}

/* ── HeroWithForm ── */
@media (max-width: 1024px) {
  .c-hero-form {
    grid-template-columns: 1fr !important;
    padding: 60px 20px !important;
  }
}

/* ── Global section padding reduction on mobile ── */
@media (max-width: 768px) {
  section {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}
`;

export function renderPageToHTML(page: Page, tokens: BrandTokens): string {
  const sectionsHTML = page.sections
    .map((section) => renderSection(section, tokens))
    .join('\n');

  const fontHeadingUrl = encodeURIComponent(tokens.fontHeading);
  const fontBodyUrl = encodeURIComponent(tokens.fontBody);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(page.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=${fontHeadingUrl}:wght@400;600;700;800&family=${fontBodyUrl}:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: ${tokens.colorPrimary};
      --color-bg: ${tokens.colorBg};
      --color-surface: ${tokens.colorSurface};
      --color-text: ${tokens.colorText};
      --color-accent: ${tokens.colorAccent};
      --font-heading: '${tokens.fontHeading}', sans-serif;
      --font-body: '${tokens.fontBody}', sans-serif;
      --radius: ${tokens.borderRadius};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); }
    a { text-decoration: none; }
    img { max-width: 100%; }
    
    ${RESPONSIVE_CSS}
  </style>
</head>
<body>
  ${sectionsHTML}
</body>
</html>`;
}

export function renderSection(section: Section, tokens: BrandTokens): string {
  const s = section.slots;
  const name = section.componentType;

  const mapArray = (arr: any, fn: (item: any, i: number) => string) =>
    Array.isArray(arr) ? arr.map(fn).join('') : '';

  switch (name) {
    case 'NavBar':
    case 'NavBarCentered':
      return `<nav class="${name === 'NavBarCentered' ? 'c-navbar-centered' : 'c-navbar'}" style="position: sticky; top: 0; z-index: 100; background: var(--color-bg); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 0 48px; height: 68px; display: flex; align-items: center; justify-content: ${name === 'NavBarCentered' ? 'center' : 'space-between'}; font-family: var(--font-body);">
        <div style="display:flex;align-items:center;gap:32px">
          <img src="${esc(s.logoUrl || tokens.logoUrl || '')}" style="height:32px;object-fit:contain" onerror="this.style.display='none'" />
          ${!(s.logoUrl || tokens.logoUrl) ? `<span style="font-family:var(--font-heading);font-size:18px;font-weight:700;color:#fff">${esc(s.ctaLabel?.split(' ')[0] || 'Brand')}</span>` : ''}
          <div class="nav-links" style="display:flex;gap:24px;margin-left: ${name === 'NavBarCentered' ? '48px' : '0'}">
            ${mapArray(s.links, l => `<a href="${esc(l.url)}" style="color:rgba(255,255,255,0.7);font-size:14px;text-decoration:none;transition:color 0.2s">${esc(l.label)}</a>`)}
          </div>
        </div>
        ${name !== 'NavBarCentered' ? `<a class="nav-cta" href="${esc(s.ctaUrl || '#')}" style="background:var(--color-primary);color:#fff;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">${esc(s.ctaLabel || 'Get Started')}</a>` : ''}
      </nav>`;

    case 'MobileMenu':
      return `<div style="background:var(--color-bg);padding:24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
          <span style="font-family:var(--font-heading);font-size:18px;font-weight:700;color:#fff">${esc(s.title || 'Menu')}</span>
          <span style="color:#fff;font-size:24px">✕</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:24px">
          ${mapArray(s.links, l => `<a href="${esc(l.url)}" style="color:#fff;font-size:18px;font-family:var(--font-heading);font-weight:600;text-decoration:none">${esc(l.label)}</a>`)}
        </div>
      </div>`;

    case 'HeroSplit':
    case 'AboutSplit':
      return `<section class="${name === 'HeroSplit' ? 'c-hero-split' : 'c-about-split'}" style="background: var(--color-bg); padding: 120px 48px; min-height: 80vh; font-family: var(--font-body);">
        <div class="${name === 'HeroSplit' ? 'c-hero-split__grid' : 'c-about-split__grid'}" style="display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;">
          <div>
            ${s.eyebrow ? `<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:6px 14px;border-radius:100px;font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:32px;letter-spacing:0.05em;text-transform:uppercase">✦ ${esc(s.eyebrow)}</div>` : ''}
            <h1 style="font-family:var(--font-heading);font-size:clamp(48px,6vw,80px);font-weight:800;color:#ffffff;line-height:0.95;letter-spacing:-0.03em;margin-bottom:24px">${esc(s.headline || s.title || 'Awesome Headline')}</h1>
            <p style="font-size:18px;color:rgba(255,255,255,0.6);line-height:1.7;max-width:480px;margin-bottom:40px">${esc(s.subtext || s.content || 'A compelling description goes here.')}</p>
            <div style="display:flex;gap:16px;flex-wrap:wrap">
              ${s.ctaLabel ? `<a href="${esc(s.ctaUrl || '#')}" style="background:var(--color-primary);color:#fff;padding:14px 32px;border-radius:var(--radius);font-size:15px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:8px">${esc(s.ctaLabel)} →</a>` : ''}
              ${s.secondaryCtaLabel ? `<a href="#" style="border:1.5px solid rgba(255,255,255,0.2);color:#fff;background:transparent;padding:14px 32px;border-radius:var(--radius);font-size:15px;font-weight:500;text-decoration:none">${esc(s.secondaryCtaLabel)}</a>` : ''}
            </div>
          </div>
          <div style="position:relative">
            <div style="position:absolute;inset:-20px;background:radial-gradient(circle,var(--color-primary)20%,transparent 70%);opacity:0.15;filter:blur(40px)"></div>
            <img src="${getHeroImage(tokens, s.imageQuery || s.headline || '', 800, 1000)}" style="width:100%;height:520px;object-fit:cover;border-radius:16px;position:relative;box-shadow:0 40px 80px rgba(0,0,0,0.4)" />
          </div>
        </div>
      </section>`;

    case 'HeroCentered':
    case 'HeroMinimal':
      return `<section class="${name === 'HeroCentered' ? 'c-hero-centered' : 'c-hero-minimal'}" style="background:var(--color-bg);padding:160px 48px 120px;text-align:center;font-family:var(--font-body);position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:600px;height:300px;background:radial-gradient(ellipse,var(--color-primary) 30%,transparent 70%);opacity:0.12;filter:blur(60px)"></div>
        <div class="c-hero-centered__inner" style="position:relative;max-width:800px;margin:0 auto">
          ${s.badge || s.eyebrow ? `<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:6px 16px;border-radius:100px;font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:32px;letter-spacing:0.05em;text-transform:uppercase">${esc(s.badge || s.eyebrow)}</div>` : ''}
          <h1 style="font-family:var(--font-heading);font-size:clamp(52px,7vw,96px);font-weight:800;color:#fff;line-height:0.92;letter-spacing:-0.04em;margin-bottom:28px">${esc(s.headline || 'Impactful Headline')}</h1>
          ${s.subtext ? `<p style="font-size:20px;color:rgba(255,255,255,0.55);line-height:1.6;margin-bottom:48px">${esc(s.subtext)}</p>` : ''}
          <div class="c-hero-centered__buttons" style="display:flex;gap:16px;justify-content:center">
            ${s.ctaLabel ? `<a href="${esc(s.ctaUrl || '#')}" style="background:var(--color-primary);color:#fff;padding:16px 36px;border-radius:var(--radius);font-size:16px;font-weight:600;text-decoration:none">${esc(s.ctaLabel)}</a>` : ''}
            ${s.secondaryCtaLabel ? `<a href="#" style="border:1.5px solid rgba(255,255,255,0.15);color:#fff;background:transparent;padding:16px 36px;border-radius:var(--radius);font-size:16px;text-decoration:none">${esc(s.secondaryCtaLabel)}</a>` : ''}
          </div>
        </div>
      </section>`;

    case 'HeroFullBleed':
    case 'HeroWithVideo':
      return `<section class="${name === 'HeroFullBleed' ? 'c-hero-full-bleed' : 'c-hero-with-video'}" style="position:relative;height:80vh;display:flex;align-items:center;padding:48px;font-family:var(--font-body);overflow:hidden">
        <div style="position:absolute;inset:0">
          <img src="${getHeroImage(tokens, s.imageQuery || s.headline || '', 1920, 1080)}" style="width:100%;height:100%;object-fit:cover" />
          <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.2) 100%)"></div>
        </div>
        <div class="c-hero-full-bleed__inner" style="position:relative;z-index:10;max-width:600px">
          ${s.eyebrow ? `<div style="font-size:12px;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px;font-weight:600">${esc(s.eyebrow)}</div>` : ''}
          <h1 style="font-family:var(--font-heading);font-size:clamp(48px,6vw,80px);font-weight:800;color:#fff;line-height:0.95;margin-bottom:24px">${esc(s.headline || 'Discover Greatness')}</h1>
          <p style="font-size:18px;color:rgba(255,255,255,0.8);line-height:1.6;margin-bottom:40px">${esc(s.subtext)}</p>
          <a href="${esc(s.ctaUrl || '#')}" style="background:var(--color-primary);color:#fff;padding:16px 36px;border-radius:var(--radius);font-size:16px;font-weight:600;text-decoration:none">${esc(s.ctaLabel || 'Action')}</a>
        </div>
      </section>`;

    case 'HeroWithForm':
    case 'NewsletterSignup':
      return `<section class="${name === 'HeroWithForm' ? 'c-hero-with-form' : 'c-newsletter-signup'}" style="background:var(--color-bg);padding:${name === 'NewsletterSignup' ? '80px' : '120px'} 48px;font-family:var(--font-body);display:flex;justify-content:center">
        <div class="${name === 'HeroWithForm' ? 'c-hero-with-form__grid' : 'c-newsletter-signup__grid'}" style="max-width:1000px;width:100%;background:var(--color-bg);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:64px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center">
          <div>
            <h2 style="font-family:var(--font-heading);font-size:clamp(36px,4vw,56px);font-weight:800;color:#fff;line-height:1.05;margin-bottom:20px">${esc(s.headline || 'Join Us')}</h2>
            <p style="font-size:16px;color:rgba(255,255,255,0.6);line-height:1.6">${esc(s.subtext || 'Sign up for updates.')}</p>
          </div>
          <div style="background:#0a0a0a;padding:32px;border-radius:16px;border:1px solid rgba(255,255,255,0.05)">
            <div class="input-row">
              <input type="email" placeholder="${esc(s.inputPlaceholder || 'Email address')}" style="width:100%;background:var(--color-surface);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:14px;color:#fff;margin-bottom:16px;outline:none" />
              <button style="width:100%;background:var(--color-primary);color:#fff;border:none;padding:14px;border-radius:8px;font-weight:600;font-size:15px;cursor:pointer">${esc(s.buttonLabel || 'Subscribe')}</button>
            </div>
            <p style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:16px;text-align:center">${esc(s.disclaimer || 'We respect your privacy.')}</p>
          </div>
        </div>
      </section>`;

    case 'FeatureGrid':
    case 'FeatureList':
      return `<section class="${name === 'FeatureGrid' ? 'c-feature-grid' : 'c-feature-list'}" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="${name === 'FeatureGrid' ? 'c-feature-grid__inner' : 'c-feature-list__inner'}" style="max-width:1200px;margin:0 auto">
          <div style="text-align:center;margin-bottom:72px">
            ${s.eyebrow ? `<div style="font-size:12px;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px">${esc(s.eyebrow)}</div>` : ''}
            <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,52px);font-weight:700;color:#fff;letter-spacing:-0.02em;margin-bottom:16px">${esc(s.headline || 'Features')}</h2>
            <p style="font-size:17px;color:rgba(255,255,255,0.5);max-width:560px;margin:0 auto;line-height:1.7">${esc(s.subtext || 'Discover what makes us totally unique.')}</p>
          </div>
          <div class="${name === 'FeatureGrid' ? 'c-feature-grid__grid' : 'c-feature-list__grid'}" style="display:grid;grid-template-columns:repeat(${s.columns || 3},1fr);gap:${name === 'FeatureList' ? '24px' : '1px'};background:${name === 'FeatureList' ? 'transparent' : 'rgba(255,255,255,0.06)'};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
            ${mapArray(s.items, item => `
            <div style="background:var(--color-bg);padding:36px;border-radius:${name === 'FeatureList' ? '16px' : '0'};transition:background 0.2s">
              <div style="font-size:28px;margin-bottom:16px">${esc(item.icon || '✨')}</div>
              <h3 style="font-family:var(--font-heading);font-size:18px;font-weight:600;color:#fff;margin-bottom:10px">${esc(item.title || 'Feature')}</h3>
              <p style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7">${esc(item.desc || 'Feature description goes here.')}</p>
            </div>`)}
          </div>
        </div>
      </section>`;

    case 'FeatureSingle':
      return `<section class="c-feature-single" style="background:var(--color-bg);padding:120px 48px;font-family:var(--font-body)">
        <div class="c-feature-single__grid" style="max-width:1200px;margin:0 auto;display:flex;flex-direction:${s.imagePosition === 'left' ? 'row-reverse' : 'row'};gap:80px;align-items:center">
          <div style="flex:1">
             ${s.eyebrow ? `<div style="font-size:12px;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px;font-weight:600">${esc(s.eyebrow)}</div>` : ''}
             <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,48px);font-weight:700;color:#fff;line-height:1.1;margin-bottom:24px">${esc(s.headline || 'A focused feature')}</h2>
             <p style="font-size:17px;color:rgba(255,255,255,0.6);line-height:1.7;margin-bottom:32px">${esc(s.subtext || 'Here is an in-depth explanation of this amazing single feature.')}</p>
             <div style="display:flex;flex-direction:column;gap:16px">
               ${mapArray(s.bullets, bullet => `<div style="display:flex;align-items:center;gap:12px;color:#fff;font-weight:500"><span style="color:var(--color-primary)">✓</span>${esc(bullet)}</div>`)}
             </div>
          </div>
          <div style="flex:1">
             <img src="${getHeroImage(tokens, s.imageQuery || s.headline || '', 800, 800)}" style="width:100%;border-radius:20px;border:1px solid rgba(255,255,255,0.1)" />
          </div>
        </div>
      </section>`;

    case 'FeatureTabbed':
      return `<section class="c-feature-tabbed" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-feature-tabbed__inner" style="max-width:1000px;margin:0 auto">
          <h2 style="text-align:center;font-family:var(--font-heading);font-size:40px;font-weight:700;color:#fff;margin-bottom:48px">${esc(s.headline || 'Capabilities')}</h2>
          <div class="c-feature-tabbed__grid" style="display:flex;gap:40px">
            <div style="flex:1;display:flex;flex-direction:column;gap:8px">
              ${mapArray(s.tabs, (tab, i) => `<div style="padding:24px;border-radius:12px;background:${i === 0 ? 'var(--color-surface)' : 'transparent'};border:1px solid ${i === 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)'};cursor:pointer">
                <h4 style="font-size:16px;font-weight:600;color:${i === 0 ? '#fff' : 'rgba(255,255,255,0.5)'};${i === 0 ? 'var(--color-primary)' : '#fff'};margin-bottom:8px">${esc((tab as any).title || 'Tab')}</h4>
                <p style="font-size:14px;color:rgba(255,255,255,0.5);display:${i === 0 ? 'block' : 'none'}">${esc((tab as any).desc || 'Tab description')}</p>
              </div>`)}
            </div>
            <div style="flex:1.5">
               <img src="${getImageUrl(s.headline, 800, 600)}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;border:1px solid rgba(255,255,255,0.08)" />
            </div>
          </div>
        </div>
      </section>`;

    case 'TestimonialGrid':
    case 'TestimonialCarousel':
      return `<section class="${name === 'TestimonialGrid' ? 'c-testimonial-grid' : 'c-testimonial-carousel'}" style="background:#080808;padding:100px 48px;font-family:var(--font-body)">
        <div class="c-testimonial-grid__inner" style="max-width:1200px;margin:0 auto">
          <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,48px);font-weight:700;color:#fff;letter-spacing:-0.02em;text-align:center;margin-bottom:64px">${esc(s.headline || 'What people say')}</h2>
          <div class="${name === 'TestimonialGrid' ? 'c-testimonial-grid__grid' : 'c-testimonial-carousel__grid'}" style="display:grid;grid-template-columns:repeat(${name === 'TestimonialCarousel' ? 1 : 3},1fr);gap:24px">
            ${mapArray(s.items, (item, i) => `
            <div style="background:var(--color-bg);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:32px;${name === 'TestimonialCarousel' && i > 0 ? 'display:none' : ''}">
              <div style="color:var(--color-primary);font-size:32px;margin-bottom:16px;opacity:0.6">"</div>
              <p style="font-size:${name === 'TestimonialCarousel' ? '24px' : '15px'};color:rgba(255,255,255,0.7);line-height:1.8;margin-bottom:24px">${esc(item.quote || 'Amazing product!')}</p>
              <div style="display:flex;align-items:center;gap:12px">
                <img src="${getImageUrl('person', 100, 100)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover" />
                <div>
                  <div style="font-size:14px;font-weight:600;color:#fff">${esc(item.name || 'User')}</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.4)">${esc(item.role || 'Customer')}</div>
                </div>
              </div>
            </div>`)}
          </div>
        </div>
      </section>`;

    case 'Metrics':
      return `<section class="c-metrics" style="background:var(--color-primary);padding:80px 48px;font-family:var(--font-body)">
        <div class="c-metrics__inner" style="max-width:1000px;margin:0 auto;text-align:center">
          <h2 style="font-family:var(--font-heading);font-size:36px;font-weight:700;color:#fff;margin-bottom:8px">${esc(s.headline || 'Our Impact')}</h2>
          <p style="color:rgba(255,255,255,0.7);margin-bottom:56px">${esc(s.subtext || 'The numbers speak for themselves.')}</p>
          <div class="c-metrics__grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:40px">
            ${mapArray(s.items, item => `
            <div>
              <div style="font-family:var(--font-heading);font-size:56px;font-weight:800;color:#fff;line-height:1">${esc(item.number || '0')}${esc(item.suffix || '')}</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:8px;text-transform:uppercase;letter-spacing:0.1em">${esc(item.label || 'Metric')}</div>
            </div>`)}
          </div>
        </div>
      </section>`;

    case 'LogoBar':
      return `<section class="c-logo-bar" style="background:#0a0a0a;padding:60px 48px;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);font-family:var(--font-body)">
        <div class="c-logo-bar__inner" style="max-width:1200px;margin:0 auto;text-align:center">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.3);margin-bottom:36px">${esc(s.headline || 'Trusted by')}</p>
          <div class="logos-row" style="display:flex;justify-content:center;align-items:center;gap:48px;flex-wrap:wrap">
            ${mapArray(s.logos, logo => `<div style="color:rgba(255,255,255,0.25);font-family:var(--font-heading);font-size:18px;font-weight:700;letter-spacing:-0.02em;filter:grayscale(1)">${esc(logo.name || 'COMPANY')}</div>`)}
          </div>
        </div>
      </section>`;

    case 'CTABanner':
      return `<section class="c-cta-banner" style="padding:48px;font-family:var(--font-body)">
        <div class="c-cta-banner__inner" style="max-width:1200px;margin:0 auto;background:linear-gradient(135deg,var(--color-primary),color-mix(in srgb,var(--color-primary) 70%,#000));border-radius:24px;padding:80px 64px;display:flex;justify-content:space-between;align-items:center;gap:48px;position:relative;overflow:hidden">
          <div style="position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
          <div style="position:relative;z-index:10">
            <h2 style="font-family:var(--font-heading);font-size:clamp(28px,3vw,48px);font-weight:800;color:#fff;letter-spacing:-0.02em;margin-bottom:12px">${esc(s.headline || 'Ready to start?')}</h2>
            <p style="font-size:16px;color:rgba(255,255,255,0.7);max-width:480px">${esc(s.subtext || 'Join thousands of satisfied customers.')}</p>
          </div>
          <div class="c-cta-banner__buttons" style="display:flex;gap:16px;flex-shrink:0;position:relative;z-index:10">
            ${s.ctaLabel ? `<a href="${esc(s.ctaUrl || '#')}" style="background:#fff;color:#000;padding:16px 32px;border-radius:var(--radius);font-size:15px;font-weight:700;text-decoration:none;white-space:nowrap">${esc(s.ctaLabel)}</a>` : ''}
            ${s.secondaryCtaLabel ? `<a href="#" style="border:1.5px solid rgba(255,255,255,0.3);color:#fff;background:transparent;padding:16px 32px;border-radius:var(--radius);font-size:15px;text-decoration:none;white-space:nowrap">${esc(s.secondaryCtaLabel)}</a>` : ''}
          </div>
        </div>
      </section>`;

    case 'FAQ':
      return `<section class="c-faq" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-faq__inner" style="max-width:720px;margin:0 auto">
          <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,48px);font-weight:700;color:#fff;letter-spacing:-0.02em;text-align:center;margin-bottom:64px">${esc(s.headline || 'Frequently Asked Questions')}</h2>
          ${mapArray(s.items, item => `
          <div style="border-bottom:1px solid rgba(255,255,255,0.08);padding:24px 0">
            <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
              <span style="font-size:16px;font-weight:500;color:#fff">${esc(item.question || 'Question?')}</span>
              <span style="color:var(--color-primary);font-size:20px;flex-shrink:0;margin-left:24px">+</span>
            </div>
            <p style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.8;margin-top:16px;display:none">${esc(item.answer || 'Answer.')}</p>
          </div>`)}
        </div>
      </section>`;

    case 'PricingTable':
      return `<section class="c-pricing-table" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-pricing-table__inner" style="max-width:1100px;margin:0 auto">
          <div style="text-align:center;margin-bottom:72px">
            ${s.eyebrow ? `<div style="font-size:12px;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px">${esc(s.eyebrow)}</div>` : ''}
            <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,52px);font-weight:700;color:#fff;letter-spacing:-0.02em;margin-bottom:16px">${esc(s.headline || 'Pricing')}</h2>
            <p style="font-size:17px;color:rgba(255,255,255,0.5)">${esc(s.subtext || 'Simple, transparent pricing.')}</p>
          </div>
          <div class="c-pricing-table__grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
            ${mapArray(s.tiers, tier => {
        const hl = tier.highlighted;
        return `<div style="background:${hl ? 'var(--color-primary)' : 'var(--color-bg)'};border:1px solid ${hl ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'};border-radius:20px;padding:40px;position:relative">
                ${hl ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#fff;color:var(--color-primary);font-size:11px;font-weight:700;padding:4px 16px;border-radius:100px;white-space:nowrap">Most Popular</div>` : ''}
                <div style="font-size:14px;font-weight:600;color:${hl ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)'};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px">${esc(tier.name || 'Tier')}</div>
                <div style="font-family:var(--font-heading);font-size:52px;font-weight:800;color:#fff;margin-bottom:4px">${esc(tier.price || '$0')}<span style="font-size:18px;opacity:0.6">/${esc(tier.period || 'mo')}</span></div>
                <p style="font-size:14px;color:${hl ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'};margin-bottom:32px">${esc(tier.desc || 'Ideal for starters.')}</p>
                <a style="display:block;text-align:center;background:${hl ? '#fff' : 'var(--color-primary)'};color:${hl ? 'var(--color-primary)' : '#fff'};padding:14px;border-radius:var(--radius);font-weight:600;font-size:14px;text-decoration:none;margin-bottom:32px">${esc(tier.ctaLabel || 'Get Started')}</a>
                <div style="display:flex;flex-direction:column;gap:12px">
                  ${mapArray(tier.features, f => `<div style="display:flex;align-items:center;gap:10px;font-size:14px;color:${hl ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)'}"><span style="color:${hl ? '#fff' : 'var(--color-primary)'}">✓</span>${esc(f)}</div>`)}
                </div>
              </div>`;
      })}
          </div>
        </div>
      </section>`;

    case 'TeamGrid':
      return `<section class="c-team-grid" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-team-grid__inner" style="max-width:1200px;margin:0 auto">
          <div style="text-align:center;margin-bottom:72px">
            ${s.eyebrow ? `<div style="font-size:12px;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px">${esc(s.eyebrow)}</div>` : ''}
            <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,48px);font-weight:700;color:#fff;letter-spacing:-0.02em">${esc(s.headline || 'Our Team')}</h2>
          </div>
          <div class="c-team-grid__grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px">
            ${mapArray(s.members, m => `
            <div style="text-align:center">
              <img src="${getImageUrl('portrait', 300, 300)}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 16px;display:block;border:2px solid rgba(255,255,255,0.1)" />
              <div style="font-size:16px;font-weight:600;color:#fff;margin-bottom:4px">${esc(m.name || 'Name')}</div>
              <div style="font-size:13px;color:var(--color-primary);margin-bottom:10px">${esc(m.role || 'Role')}</div>
              <p style="font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6">${esc(m.bio || 'Short generic bio.')}</p>
            </div>`)}
          </div>
        </div>
      </section>`;

    case 'ContactForm':
      return `<section class="c-contact-form" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-contact-form__inner" style="max-width:600px;margin:0 auto;text-align:center">
          <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,48px);font-weight:700;color:#fff;letter-spacing:-0.02em;margin-bottom:16px">${esc(s.headline || 'Get in Touch')}</h2>
          <p style="color:rgba(255,255,255,0.5);margin-bottom:48px">${esc(s.subtext || 'We would love to hear from you.')}</p>
          <div class="c-contact-form__fields" style="text-align:left;display:flex;flex-direction:column;gap:16px">
            ${mapArray(s.fields, f => `
            <div>
              <label style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);display:block;margin-bottom:8px">${esc(f.label || 'Field')}</label>
              ${(f as any).type === 'textarea'
          ? `<textarea placeholder="${esc((f as any).placeholder || '')}" rows="4" style="width:100%;background:var(--color-surface);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:14px 16px;color:#fff;font-size:14px;outline:none"></textarea>`
          : `<input type="${esc((f as any).type || 'text')}" placeholder="${esc((f as any).placeholder || '')}" style="width:100%;background:var(--color-surface);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:14px 16px;color:#fff;font-size:14px;outline:none" />`
        }
            </div>`)}
            <button style="width:100%;background:var(--color-primary);color:#fff;border:none;padding:16px;border-radius:var(--radius);font-size:15px;font-weight:600;cursor:pointer;margin-top:8px">${esc(s.submitLabel || 'Submit')}</button>
          </div>
        </div>
      </section>`;

    case 'FooterFull':
    case 'FooterMinimal':
    case 'FooterWithNewsletter':
      return `<footer class="c-footer-${name.toLowerCase().replace('footer', '')}" style="background:#080808;border-top:1px solid rgba(255,255,255,0.06);padding:80px 48px 40px;font-family:var(--font-body)">
        <div class="c-footer-inner" style="max-width:1200px;margin:0 auto">
          ${name === 'FooterWithNewsletter' ? `
            <div style="background:var(--color-bg);border-radius:16px;padding:48px;display:flex;justify-content:space-between;align-items:center;margin-bottom:60px;flex-wrap:wrap;gap:24px">
              <div>
                <h3 style="font-size:24px;font-family:var(--font-heading);font-weight:700;color:#fff;margin-bottom:8px">Subscribe</h3>
                <p style="color:rgba(255,255,255,0.5);font-size:14px">Get the latest updates directly in your inbox.</p>
              </div>
              <div style="display:flex;gap:12px;flex-wrap:wrap">
                <input type="email" placeholder="Email address" style="background:var(--color-surface);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px 16px;color:#fff;outline:none;min-width:260px;flex:1" />
                <button style="background:var(--color-primary);color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">Subscribe</button>
              </div>
            </div>
          ` : ''}
          <div class="c-footer-grid" style="${name === 'FooterMinimal' ? 'display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;flex-wrap:wrap;gap:24px' : 'display:grid;grid-template-columns:280px repeat(3,1fr);gap:60px;margin-bottom:60px'}">
            <div>
              <img src="${esc(s.logoUrl || tokens.logoUrl || '')}" style="height:32px;margin-bottom:${name === 'FooterMinimal' ? '0' : '20px'};object-fit:contain" onerror="this.style.display='none'" />
              ${!(s.logoUrl || tokens.logoUrl) ? `<div style="font-family:var(--font-heading);font-size:18px;font-weight:700;color:#fff;margin-bottom:${name === 'FooterMinimal' ? '0' : '12px'}">${esc(s.siteName || 'Brand')}</div>` : ''}
              ${name !== 'FooterMinimal' && s.tagline ? `<p style="font-size:14px;color:rgba(255,255,255,0.4);line-height:1.7">${esc(s.tagline)}</p>` : ''}
            </div>
            ${name !== 'FooterMinimal' ? mapArray(s.columns, col => `
            <div>
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.3);margin-bottom:20px">${esc((col as any).title || 'Links')}</div>
              <div style="display:flex;flex-direction:column;gap:12px">
                ${mapArray((col as any).links, l => `<a href="${esc(l.url)}" style="font-size:14px;color:rgba(255,255,255,0.5);text-decoration:none">${esc(l.label)}</a>`)}
              </div>
            </div>`) : `
            <div style="display:flex;gap:24px;flex-wrap:wrap">
              ${mapArray(s.links, l => `<a href="${esc(l.url)}" style="font-size:14px;color:rgba(255,255,255,0.5);text-decoration:none">${esc(l.label)}</a>`)}
            </div>
            `}
          </div>
          <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:32px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
            <span style="font-size:13px;color:rgba(255,255,255,0.25)">${esc(s.copyright || `&copy; ${new Date().getFullYear()} All rights reserved.`)}</span>
            <div style="display:flex;gap:16px;flex-wrap:wrap">
              ${mapArray(s.socialLinks, sl => `<a href="${esc(sl.url)}" style="font-size:13px;color:rgba(255,255,255,0.35);text-decoration:none">${esc(sl.platform)}</a>`)}
            </div>
          </div>
        </div>
      </footer>`;

    case 'ContentBlock':
      return `<section class="c-content-block" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-content-block__inner" style="max-width:800px;margin:0 auto">
          <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,40px);font-weight:700;color:#fff;margin-bottom:24px">${esc(s.title || 'Content')}</h2>
          <div style="color:rgba(255,255,255,0.7);font-size:18px;line-height:1.7">${esc(s.content || 'Content block text goes here.')}</div>
        </div>
      </section>`;

    case 'Gallery':
      return `<section class="c-gallery" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-gallery__grid" style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(${s.columns || 3},1fr);gap:24px">
          ${mapArray(s.images, (img, i) => `<img src="${getGalleryImage(tokens, img.alt || 'photo', i, 600, 600)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:16px" alt="${esc(img.alt)}"/>`)}
        </div>
      </section>`;

    case 'BlogFeed':
      return `<section class="c-blog-feed" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-blog-feed__inner" style="max-width:1200px;margin:0 auto">
          <h2 style="font-family:var(--font-heading);font-size:clamp(32px,4vw,48px);font-weight:700;color:#fff;margin-bottom:48px">${esc(s.headline || 'Latest News')}</h2>
          <div class="c-blog-feed__grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px">
            ${mapArray(s.posts, p => `<div style="background:var(--color-bg);border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden"><img src="${getImageUrl(p.title || 'blog', 600, 400)}" style="width:100%;height:200px;object-fit:cover" /><div style="padding:24px"><div style="font-size:12px;color:var(--color-primary);margin-bottom:8px">${esc(p.category || 'News')}</div><h3 style="font-size:20px;font-weight:600;color:#fff;margin-bottom:12px">${esc(p.title || 'Post Title')}</h3><p style="font-size:14px;color:rgba(255,255,255,0.5)">${esc(p.excerpt || 'Excerpt text...')}</p></div></div>`)}
          </div>
        </div>
      </section>`;

    case 'Timeline':
      return `<section class="c-timeline" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-timeline__inner" style="max-width:800px;margin:0 auto;display:flex;flex-direction:column;gap:32px">
          ${mapArray(s.events, e => `<div style="display:flex;gap:24px"><div style="color:var(--color-primary);font-size:18px;font-weight:700;width:100px;flex-shrink:0">${esc(e.year || '2024')}</div><div><h3 style="font-size:20px;font-weight:600;color:#fff;margin-bottom:8px">${esc(e.title || 'Event')}</h3><p style="font-size:15px;color:rgba(255,255,255,0.5)">${esc(e.desc || 'Details of event...')}</p></div></div>`)}
        </div>
      </section>`;

    case 'Values':
      return `<section class="c-values" style="background:var(--color-bg);padding:100px 48px;font-family:var(--font-body)">
        <div class="c-values__grid" style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:48px">
          ${mapArray(s.values, v => `<div><h3 style="font-family:var(--font-heading);font-size:clamp(24px,3vw,28px);font-weight:700;color:#fff;margin-bottom:16px">${esc(v.title || 'Value')}</h3><p style="font-size:16px;color:rgba(255,255,255,0.6);line-height:1.7">${esc(v.desc || 'Description of the value goes here. It should be meaningful.')}</p></div>`)}
        </div>
      </section>`;

    default:
      return `<section class="c-default-block" style="background:var(--color-bg);padding:100px 48px;text-align:center;border:1px dashed rgba(255,255,255,0.2)">
        <h3 style="font-family:var(--font-heading);font-size:20px;color:var(--color-primary)">${esc(name)}</h3>
        <p style="color:#666">Full renderer coming soon</p>
      </section>`;
  }
}
