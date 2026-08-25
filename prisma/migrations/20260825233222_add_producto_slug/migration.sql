-- AlterTable
ALTER TABLE "productos" ADD COLUMN "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "productos_slug_key" ON "productos"("slug");
