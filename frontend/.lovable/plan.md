

# SitePilot — Full SaaS Application UI

A professional enterprise SaaS website builder UI with 13 pages, consistent theming, and fully responsive design.

## Theme & Design System
- Light enterprise theme with custom color palette (#090979 primary accent, #F8FAFC background)
- Rounded-xl cards with soft shadows, clean typography, professional spacing
- No dark mode, no gradients, no neon — minimal and production-ready

## Global Components
- **AuthContext & ProtectedRoute** — Simulated auth state management with route protection
- **DashboardLayout** — Shared layout with top navbar (logo, org name, plan badge, profile dropdown) and left sidebar (Dashboard, Projects, Assets, Team, Billing, Settings)
- **Reusable UI** — Toast notifications, Modal, ProgressBar, PlanBadge, UpgradeModal, LoadingSpinner

## Pages

### Page 1 — Landing Page (/)
Marketing page with navbar, hero section ("Build your website with AI in minutes"), 3 feature cards, template preview grid, 3-tier pricing section (Starter/Pro/Enterprise), and footer.

### Page 2 — Signup (/signup)
Centered card with org name, name, email, password fields, plan selector with 3 radio-style cards (Starter default), and link to login.

### Page 3 — Login (/login)
Centered card with email/password fields, forgot password link, and link to signup.

### Page 4 — Dashboard (/dashboard)
Welcome section with date, 4 stat cards (Projects, Storage, AI Credits, Team Members) each with progress bars, and a project grid with status badges (LIVE/DRAFT), edit/view buttons, and three-dot dropdown menus. Empty state when no projects.

### Page 5 — Template Selection (/projects/new)
Step indicator, filter pills, "Blank Canvas" option, template grid with thumbnails, plan badges, preview/select buttons. Locked templates show grey overlay with lock icon.

### Page 6 — Branding Setup (/projects/new/branding)
Two-column layout: left side with business info, color pickers, typography selector, asset uploads, and "Suggest Theme with AI" button. Right side with live mock preview card.

### Page 7 — Builder (/builder/:id)
Top toolbar with device toggle, save/preview/publish buttons. Three-panel layout: left panel (pages list + component library), center canvas (stacked components with reorder/delete), right panel (properties editor with AI improve button). Includes version history drawer, branding modal, and publish confirmation dialog.

### Page 8 — Preview (/preview/:id)
Preview banner at top, full rendered website layout below without any dashboard chrome.

### Page 9 — Assets (/assets)
Storage usage bar, filter tabs, upload button, asset grid with image previews, file info, copy URL, and delete actions.

### Page 10 — Team (/team)
Members table with roles and actions, pending invites section, and invite modal.

### Page 11 — Billing (/billing)
Current plan card, usage summary with progress bars, plan comparison cards with upgrade buttons.

### Page 12 — Settings (/settings)
Profile section, organization section, password update, and danger zone with delete account.

### Page 13 — 404 Page
Simple centered message with "Back to Dashboard" button.

## Notes
- All data is mock/static — no backend integration
- Auth state is simulated with React context
- All interactions (modals, dropdowns, toggles) are fully functional in the UI
- Fully responsive across desktop, tablet, and mobile

