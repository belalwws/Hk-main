-- CreateTable
CREATE TABLE "admin_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "bio" TEXT,
    "experience" TEXT,
    "expertise" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "website" TEXT,
    "profileImage" TEXT,
    "coverImage" TEXT,
    "motivation" TEXT,
    "availability" TEXT,
    "previousWork" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reviewedAt" DATETIME
);

-- CreateTable
CREATE TABLE "admin_form_designs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "coverImage" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#01645e',
    "secondaryColor" TEXT NOT NULL DEFAULT '#3ab666',
    "accentColor" TEXT NOT NULL DEFAULT '#c3e956',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "title" TEXT,
    "description" TEXT,
    "welcomeMessage" TEXT,
    "successMessage" TEXT,
    "logoUrl" TEXT,
    "customCss" TEXT,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_form_designs_hackathonId_key" ON "admin_form_designs"("hackathonId");
