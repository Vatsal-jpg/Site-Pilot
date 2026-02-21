/**
 * Convert a string into a URL-safe slug.
 * "Acme Corp!" → "acme-corp"
 */
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")           // spaces → dashes
        .replace(/[^\w-]+/g, "")        // remove non-word chars
        .replace(/--+/g, "-")           // collapse multiple dashes
        .replace(/^-+/, "")             // trim leading dashes
        .replace(/-+$/, "");            // trim trailing dashes
};

export default slugify;
