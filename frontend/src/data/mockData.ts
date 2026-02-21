export interface Project {
  id: string;
  name: string;
  status: "live" | "draft";
  lastEdited: string;
  liveUrl?: string;
  thumbnail?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "font";
  size: string;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  requiredPlan: "starter" | "pro" | "enterprise";
  thumbnail?: string;
}

export const mockProjects: Project[] = [
  { id: "1", name: "Acme Landing Page", status: "live", lastEdited: "2 hours ago", liveUrl: "acme.sitepilot.app" },
  { id: "2", name: "Product Showcase", status: "draft", lastEdited: "1 day ago" },
  { id: "3", name: "Company Blog", status: "live", lastEdited: "3 days ago", liveUrl: "blog.acme.com" },
];

export const mockTeam: TeamMember[] = [
  { id: "1", name: "John Smith", email: "john@acme.com", role: "owner" },
  { id: "2", name: "Sarah Connor", email: "sarah@acme.com", role: "admin" },
  { id: "3", name: "Mike Johnson", email: "mike@acme.com", role: "editor" },
];

export const mockAssets: Asset[] = [
  { id: "1", name: "hero-banner.jpg", type: "image", size: "2.4 MB", url: "/placeholder.svg", uploadedAt: "2 days ago" },
  { id: "2", name: "logo.png", type: "image", size: "120 KB", url: "/placeholder.svg", uploadedAt: "1 week ago" },
  { id: "3", name: "brand-guide.pdf", type: "document", size: "4.1 MB", url: "#", uploadedAt: "2 weeks ago" },
  { id: "4", name: "promo-video.mp4", type: "video", size: "18 MB", url: "#", uploadedAt: "3 days ago" },
];

export const mockTemplates: Template[] = [
  { id: "1", name: "Blank Canvas", category: "blank", requiredPlan: "starter" },
  { id: "2", name: "Startup Landing", category: "business", requiredPlan: "starter" },
  { id: "3", name: "SaaS Homepage", category: "business", requiredPlan: "starter" },
  { id: "4", name: "Portfolio", category: "creative", requiredPlan: "starter" },
  { id: "5", name: "E-Commerce Store", category: "business", requiredPlan: "pro" },
  { id: "6", name: "Agency Website", category: "business", requiredPlan: "pro" },
  { id: "7", name: "Blog Platform", category: "content", requiredPlan: "starter" },
  { id: "8", name: "Enterprise Portal", category: "business", requiredPlan: "enterprise" },
  { id: "9", name: "Restaurant", category: "local", requiredPlan: "pro" },
];

export const planLimits = {
  starter: { websites: 1, storage: 0.5, aiCredits: 50, pages: 3 },
  pro: { websites: 5, storage: 5, aiCredits: 500, pages: Infinity },
  enterprise: { websites: Infinity, storage: 50, aiCredits: Infinity, pages: Infinity },
};

export const planPricing = {
  starter: { price: 0, label: "Free" },
  pro: { price: 29, label: "$29/mo" },
  enterprise: { price: 99, label: "$99/mo" },
};
