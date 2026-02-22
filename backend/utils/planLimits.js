const PLAN_LIMITS = {
    starter: {
        sites: 2,
        pagesPerSite: 3,
        aiCredits: 10,
        storageMB: 100,
        teamMembers: 1,
        customDomains: false,
    },
    pro: {
        sites: 10,
        pagesPerSite: 10,
        aiCredits: 100,
        storageMB: 2048,
        teamMembers: 5,
        customDomains: true,
    },
    enterprise: {
        sites: 999999,
        pagesPerSite: 999999,
        aiCredits: 999999,
        storageMB: 20480,
        teamMembers: 999999,
        customDomains: true,
    },
};

export default PLAN_LIMITS;
