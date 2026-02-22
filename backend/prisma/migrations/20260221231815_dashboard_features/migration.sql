-- AlterTable
ALTER TABLE "public"."Asset" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "b2Key" DROP NOT NULL,
ALTER COLUMN "b2Url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
