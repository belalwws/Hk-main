-- CreateTable
CREATE TABLE "supervision_form_designs" (
    "id" TEXT NOT NULL,
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
    "formFields" TEXT,
    "settings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervision_form_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervision_form_submissions" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "formData" TEXT NOT NULL,
    "attachments" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "supervision_form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supervision_form_designs_hackathonId_key" ON "supervision_form_designs"("hackathonId");
