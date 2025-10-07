-- CreateTable
CREATE TABLE "hackathons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requirements" JSONB,
    "categories" JSONB,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "registrationDeadline" DATETIME NOT NULL,
    "maxParticipants" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "prizes" JSONB,
    "settings" JSONB,
    "certificateTemplate" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "evaluationOpen" BOOLEAN NOT NULL DEFAULT false,
    "judgeSettings" JSONB,
    "emailTemplates" JSONB,
    "customFields" JSONB,
    "location" TEXT,
    "venue" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "socialMedia" TEXT,
    "sponsors" TEXT,
    "partners" TEXT,
    "mentors" TEXT,
    "schedule" TEXT,
    "rules" TEXT,
    "resources" TEXT,
    "faq" TEXT,
    "registrationCount" INTEGER NOT NULL DEFAULT 0,
    "maxTeams" INTEGER NOT NULL DEFAULT 0,
    "currentPhase" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "featuredImage" TEXT,
    "bannerImage" TEXT,
    "logoImage" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "nationality" TEXT,
    "skills" TEXT,
    "experience" TEXT,
    "preferredRole" TEXT,
    "role" TEXT NOT NULL DEFAULT 'participant',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "profilePicture" TEXT,
    "bio" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "portfolio" TEXT,
    "university" TEXT,
    "major" TEXT,
    "graduationYear" TEXT,
    "workExperience" TEXT,
    "lastLogin" DATETIME,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamName" TEXT,
    "projectTitle" TEXT,
    "projectDescription" TEXT,
    "githubRepo" TEXT,
    "teamType" TEXT NOT NULL DEFAULT 'individual',
    "teamRole" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "score" REAL,
    "feedback" TEXT,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "additionalInfo" JSONB,
    "skills" TEXT,
    "experience" TEXT,
    "motivation" TEXT,
    "availability" TEXT,
    "previousParticipation" TEXT,
    "emergencyContact" TEXT,
    "dietaryRestrictions" TEXT,
    "tshirtSize" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "portfolio" TEXT,
    "university" TEXT,
    "major" TEXT,
    "graduationYear" TEXT,
    "workExperience" TEXT,
    "preferredRole" TEXT,
    "teamPreference" TEXT,
    "additionalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT,
    CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "participants_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "participants_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "judges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "judges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "judges_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hackathonId" TEXT,
    "permissions" JSONB,
    "role" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "admins_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamNumber" INTEGER,
    "leaderId" TEXT,
    "members" TEXT,
    "ideaFile" TEXT,
    "ideaTitle" TEXT,
    "ideaDescription" TEXT,
    "projectName" TEXT,
    "projectDescription" TEXT,
    "projectUrl" TEXT,
    "status" TEXT,
    "submissionUrl" TEXT,
    "presentationUrl" TEXT,
    "demoUrl" TEXT,
    "githubUrl" TEXT,
    "finalScore" REAL,
    "rank" INTEGER,
    "isQualified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teams_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judgeId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 5,
    "comments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scores_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "judges" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "scores_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "scores_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "scores_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "evaluation_criteria" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evaluation_criteria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "hackathonId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "evaluation_criteria_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "results_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "form_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "responses" JSONB NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "form_responses_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "global_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hackathon_forms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "fields" TEXT NOT NULL,
    "settings" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hackathon_forms_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hackathon_landing_pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "customDomain" TEXT,
    "htmlContent" TEXT NOT NULL,
    "cssContent" TEXT NOT NULL,
    "jsContent" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "template" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hackathon_landing_pages_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hackathon_form_designs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "template" TEXT NOT NULL DEFAULT 'modern',
    "htmlContent" TEXT,
    "cssContent" TEXT,
    "jsContent" TEXT,
    "settings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hackathon_form_designs_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "judge_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "hackathonId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedBy" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "participants_userId_hackathonId_key" ON "participants"("userId", "hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "judges_userId_hackathonId_key" ON "judges"("userId", "hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_hackathonId_key" ON "admins"("userId", "hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_hackathonId_teamNumber_key" ON "teams"("hackathonId", "teamNumber");

-- CreateIndex
CREATE UNIQUE INDEX "scores_judgeId_teamId_criterionId_hackathonId_key" ON "scores"("judgeId", "teamId", "criterionId", "hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "global_settings_key_key" ON "global_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_forms_hackathonId_key" ON "hackathon_forms"("hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_landing_pages_hackathonId_key" ON "hackathon_landing_pages"("hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_form_designs_hackathonId_key" ON "hackathon_form_designs"("hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "judge_invitations_token_key" ON "judge_invitations"("token");
