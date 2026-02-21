/**
 * Hardcoded plan limits — source of truth for gating features.
 * These are NOT stored in the DB; update here when pricing changes.
 */
const PLAN_LIMITS = {
    starter: {
        maxProjects: 2,
        maxPages: 5,
        storageLimitBytes: 524288000,       // 500 MB
        aiCreditsMonthly: 50,
        customDomain: false,
    },
    pro: {
        maxProjects: 5,
        maxPages: 999,
        storageLimitBytes: 5368709120,      // 5 GB
        aiCreditsMonthly: 500,
        customDomain: true,
    },
    enterprise: {
        maxProjects: 50,
        maxPages: 999,
        storageLimitBytes: 53687091200,     // 50 GB
        aiCreditsMonthly: 5000,
        customDomain: true,
    },
};

export default PLAN_LIMITS;
