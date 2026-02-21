// ── Component type registry ──────────────────────────────────────────────────
// All component types, their default layouts, and default props.
// Hardcoded — no API, no DB.

export interface ComponentType {
    id: string;
    name: string;
    category: "layout" | "hero" | "content" | "media" | "forms";
}

export const COMPONENT_TYPES: ComponentType[] = [
    { id: "navbar", name: "Navigation Bar", category: "layout" },
    { id: "hero", name: "Hero Section", category: "hero" },
    { id: "feature_grid", name: "Feature Grid", category: "content" },
    { id: "gallery", name: "Gallery", category: "media" },
    { id: "text_block", name: "Text Block", category: "content" },
    { id: "testimonials", name: "Testimonials", category: "content" },
    { id: "contact", name: "Contact Form", category: "forms" },
    { id: "footer", name: "Footer", category: "layout" },
];

// ── Layout options per component type ────────────────────────────────────────

export const LAYOUT_OPTIONS: Record<string, Record<string, { value: string | number | boolean; label: string }[]>> = {
    navbar: {
        linksAlign: [
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
        ],
        background: [
            { value: "solid", label: "Solid" },
            { value: "transparent", label: "Transparent" },
            { value: "blur", label: "Blur" },
        ],
        sticky: [
            { value: true, label: "Sticky" },
            { value: false, label: "Static" },
        ],
    },
    hero: {
        style: [
            { value: "centered", label: "Centered" },
            { value: "left-align", label: "Left Aligned" },
            { value: "split", label: "Split" },
        ],
        height: [
            { value: "fullscreen", label: "Full Screen" },
            { value: "half", label: "Half" },
            { value: "auto", label: "Auto" },
        ],
        overlay: [
            { value: "none", label: "None" },
            { value: "dark-40", label: "Dark 40%" },
            { value: "dark-60", label: "Dark 60%" },
            { value: "gradient", label: "Gradient" },
        ],
    },
    feature_grid: {
        columns: [
            { value: 2, label: "2 col" },
            { value: 3, label: "3 col" },
            { value: 4, label: "4 col" },
        ],
        cardStyle: [
            { value: "bordered", label: "Bordered" },
            { value: "shadow", label: "Shadow" },
            { value: "flat", label: "Flat" },
        ],
        alignment: [
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
        ],
    },
    gallery: {
        grid: [
            { value: "2x2", label: "2×2" },
            { value: "3x2", label: "3×2" },
            { value: "4x2", label: "4×2" },
            { value: "masonry", label: "Masonry" },
        ],
        aspect: [
            { value: "square", label: "Square" },
            { value: "wide", label: "Wide" },
            { value: "portrait", label: "Portrait" },
        ],
    },
    text_block: {
        alignment: [
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
        ],
        width: [
            { value: "full", label: "Full Width" },
            { value: "contained", label: "Contained" },
            { value: "narrow", label: "Narrow" },
        ],
    },
    testimonials: {
        style: [
            { value: "cards", label: "Cards" },
            { value: "carousel", label: "Carousel" },
            { value: "list", label: "List" },
        ],
        columns: [
            { value: 2, label: "2 col" },
            { value: 3, label: "3 col" },
        ],
    },
    contact: {
        style: [
            { value: "form-left", label: "Form Left" },
            { value: "form-center", label: "Centered" },
            { value: "form-right", label: "Form Right" },
        ],
        width: [
            { value: "full", label: "Full Width" },
            { value: "contained", label: "Contained" },
        ],
    },
    footer: {
        columns: [
            { value: 2, label: "2 col" },
            { value: 3, label: "3 col" },
            { value: 4, label: "4 col" },
        ],
    },
};

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_LAYOUTS: Record<string, Record<string, string | number | boolean>> = {
    navbar: { linksAlign: "right", background: "solid", sticky: true },
    hero: { style: "centered", height: "fullscreen", overlay: "dark-60" },
    feature_grid: { columns: 3, cardStyle: "bordered", alignment: "center" },
    gallery: { grid: "3x2", aspect: "square" },
    text_block: { alignment: "left", width: "contained" },
    testimonials: { style: "cards", columns: 3 },
    contact: { style: "form-left", width: "contained" },
    footer: { columns: 3 },
};

export const DEFAULT_PROPS: Record<string, Record<string, unknown>> = {
    navbar: {
        logo: "",
        links: ["Home", "About", "Contact"],
        ctaText: "Get Started",
    },
    hero: {
        heading: "Welcome",
        subheading: "Your tagline here",
        buttonText: "Learn More",
        bgImage: "",
    },
    feature_grid: {
        heading: "Why Choose Us",
        items: [
            { icon: "star", title: "Quality", text: "We deliver the best" },
            { icon: "clock", title: "Fast", text: "Quick turnaround" },
            { icon: "heart", title: "Trusted", text: "Loved by customers" },
        ],
    },
    gallery: {
        heading: "Our Work",
        images: [],
    },
    text_block: {
        heading: "About Us",
        content: "Tell your story here...",
    },
    testimonials: {
        heading: "What People Say",
        items: [
            { name: "Jane Doe", role: "CEO", text: "Amazing experience!" },
            { name: "John Smith", role: "CTO", text: "Highly recommended." },
            { name: "Sarah Lee", role: "Designer", text: "Beautiful results." },
        ],
    },
    contact: {
        heading: "Get In Touch",
        fields: ["name", "email", "message"],
        buttonText: "Send Message",
    },
    footer: {
        logo: "",
        links: ["Home", "About", "Contact", "Privacy"],
        copyright: "© 2026 Your Company",
    },
};

// ── Skeleton heights for skeleton loading state ──────────────────────────────

export const SKELETON_HEIGHTS: Record<string, string> = {
    navbar: "h-16",
    hero: "h-96",
    feature_grid: "h-80",
    gallery: "h-64",
    text_block: "h-48",
    testimonials: "h-64",
    contact: "h-96",
    footer: "h-32",
};

// ── Spacing options ──────────────────────────────────────────────────────────

export const SPACING_OPTIONS = [
    { value: "none", label: "None", className: "mt-0" },
    { value: "small", label: "Small", className: "mt-4" },
    { value: "medium", label: "Medium", className: "mt-8" },
    { value: "large", label: "Large", className: "mt-16" },
];
