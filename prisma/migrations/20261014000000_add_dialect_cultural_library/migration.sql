-- Additive migration: does not alter existing users, tutor, booking, payment, or challenge records.
CREATE TABLE "Dialect" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "region" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Dialect_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CulturalResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'STORY',
    "originalText" TEXT,
    "translation" TEXT,
    "transcript" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "difficulty" TEXT NOT NULL DEFAULT 'BEGINNER',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "contributorName" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "rightsStatus" TEXT NOT NULL DEFAULT 'UNCONFIRMED',
    "consentRecorded" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CulturalResource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResourceDialect" (
    "resourceId" TEXT NOT NULL,
    "dialectId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResourceDialect_pkey" PRIMARY KEY ("resourceId", "dialectId")
);

CREATE UNIQUE INDEX "Dialect_slug_key" ON "Dialect"("slug");
CREATE INDEX "Dialect_status_sortOrder_idx" ON "Dialect"("status", "sortOrder");
CREATE UNIQUE INDEX "CulturalResource_slug_key" ON "CulturalResource"("slug");
CREATE INDEX "CulturalResource_status_resourceType_idx" ON "CulturalResource"("status", "resourceType");
CREATE INDEX "CulturalResource_difficulty_ageMin_ageMax_idx" ON "CulturalResource"("difficulty", "ageMin", "ageMax");
CREATE INDEX "ResourceDialect_dialectId_resourceId_idx" ON "ResourceDialect"("dialectId", "resourceId");

ALTER TABLE "ResourceDialect"
    ADD CONSTRAINT "ResourceDialect_resourceId_fkey"
    FOREIGN KEY ("resourceId") REFERENCES "CulturalResource"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResourceDialect"
    ADD CONSTRAINT "ResourceDialect_dialectId_fkey"
    FOREIGN KEY ("dialectId") REFERENCES "Dialect"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
