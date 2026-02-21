import prisma from "../utils/prisma.js";
import PLAN_LIMITS from "../utils/planLimits.js";

// ─────────────────────────────────────────
// POST /api/assets/upload-url
// ─────────────────────────────────────────
const getUploadUrl = async (req, res) => {
    try {
        const { fileName, fileSize, assetType } = req.body;

        if (!fileName || !fileSize) {
            return res.status(400).json({
                success: false,
                message: "fileName and fileSize are required",
            });
        }

        // 1. Check storage limit
        const tenant = await prisma.tenant.findUnique({
            where: { id: req.user.tenantId },
            select: { storageUsedBytes: true, plan: true },
        });

        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }

        const limit = BigInt(PLAN_LIMITS[tenant.plan].storageLimitBytes);
        const currentUsed = BigInt(tenant.storageUsedBytes);
        const fileSizeBig = BigInt(fileSize);

        if (currentUsed + fileSizeBig > limit) {
            return res.status(403).json({ success: false, message: "Storage limit reached" });
        }

        // 2. Generate B2 upload credentials
        const B2 = (await import("backblaze-b2")).default;

        const b2 = new B2({
            applicationKeyId: process.env.B2_KEY_ID,
            applicationKey: process.env.B2_APP_KEY,
        });

        await b2.authorize();

        const b2Key = `tenants/${req.user.tenantId}/${Date.now()}-${fileName}`;
        const { data: uploadData } = await b2.getUploadUrl({
            bucketId: process.env.B2_BUCKET_ID,
        });

        const b2Url = `https://f005.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${b2Key}`;

        return res.status(200).json({
            success: true,
            uploadUrl: uploadData.uploadUrl,
            authorizationToken: uploadData.authorizationToken,
            b2Key,
            b2Url,
        });
    } catch (error) {
        console.error("Upload URL error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// POST /api/assets/confirm
// ─────────────────────────────────────────
const confirmUpload = async (req, res) => {
    try {
        const { b2Key, b2Url, fileName, sizeBytes, assetType, projectId } = req.body;

        if (!b2Key || !b2Url || !fileName || !sizeBytes) {
            return res.status(400).json({
                success: false,
                message: "b2Key, b2Url, fileName, and sizeBytes are required",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const asset = await tx.asset.create({
                data: {
                    tenantId: req.user.tenantId,
                    projectId: projectId || null,
                    b2Key,
                    b2Url,
                    fileName,
                    sizeBytes: BigInt(sizeBytes),
                    assetType: assetType || "general",
                    uploadedBy: req.user.id,
                },
            });

            await tx.tenant.update({
                where: { id: req.user.tenantId },
                data: { storageUsedBytes: { increment: BigInt(sizeBytes) } },
            });

            return asset;
        });

        return res.status(201).json({
            success: true,
            asset: {
                id: result.id,
                b2Url: result.b2Url,
                fileName: result.fileName,
                sizeBytes: result.sizeBytes.toString(),
            },
        });
    } catch (error) {
        console.error("Confirm upload error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { getUploadUrl, confirmUpload };
