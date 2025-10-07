-- CreateTable
CREATE TABLE "hackathon_feedback_forms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL DEFAULT 'قيّم تجربتك في الهاكاثون',
    "description" TEXT,
    "welcomeMessage" TEXT,
    "thankYouMessage" TEXT,
    "ratingScale" INTEGER NOT NULL DEFAULT 5,
    "coverImage" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#01645e',
    "secondaryColor" TEXT NOT NULL DEFAULT '#3ab666',
    "accentColor" TEXT NOT NULL DEFAULT '#c3e956',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "logoUrl" TEXT,
    "customCss" TEXT,
    "questions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hackathon_feedback_forms_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hackathon_feedbacks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "participantEmail" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "responses" TEXT NOT NULL,
    "suggestions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hackathon_feedbacks_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hackathon_feedbacks_formId_fkey" FOREIGN KEY ("formId") REFERENCES "hackathon_feedback_forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_feedback_forms_hackathonId_key" ON "hackathon_feedback_forms"("hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_feedbacks_hackathonId_participantEmail_key" ON "hackathon_feedbacks"("hackathonId", "participantEmail");
