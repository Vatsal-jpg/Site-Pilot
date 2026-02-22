/**
 * Middleware helper to ensure a tenant owns a specific record.
 * Throws a 404 if not found, or a 403 if it belongs to another tenant.
 * Uses Prisma to fetch the record dynamically.
 */
export const assertTenantOwns = async (prisma, model, id, tenantId) => {
    const record = await prisma[model].findUnique({ where: { id } });

    if (!record) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }

    if (record.tenantId !== tenantId) {
        const err = new Error('Forbidden: You do not own this resource');
        err.status = 403;
        throw err;
    }

    return record;
};
