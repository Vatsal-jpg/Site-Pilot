-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "brandColor" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "palette" JSONB,
ADD COLUMN     "uploadedImages" JSONB;

-- CreateTable
CREATE TABLE "public"."SiteSection" (
    "id" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "variant" TEXT NOT NULL DEFAULT 'dark',
    "slots" JSONB NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "pageId" TEXT NOT NULL,

    CONSTRAINT "SiteSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SitePage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SitePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SiteGeneration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "palette" JSONB,
    "status" TEXT NOT NULL DEFAULT 'generating',
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteGeneration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SiteSection" ADD CONSTRAINT "SiteSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."SitePage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SitePage" ADD CONSTRAINT "SitePage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SiteGeneration" ADD CONSTRAINT "SiteGeneration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SiteGeneration" ADD CONSTRAINT "SiteGeneration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
