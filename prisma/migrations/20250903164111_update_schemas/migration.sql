/*
  Warnings:

  - You are about to drop the column `issuer` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Resume` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `About` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialLinks` to the `About` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `About` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `education` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalInfo` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" ADD COLUMN "phone" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_About" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "socialLinks" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_About" ("createdAt", "description", "id", "updatedAt") SELECT "createdAt", "description", "id", "updatedAt" FROM "About";
DROP TABLE "About";
ALTER TABLE "new_About" RENAME TO "About";
CREATE TABLE "new_Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "credentialUrl" TEXT,
    "imageUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Certificate" ("createdAt", "date", "id", "imageUrl", "title", "updatedAt") SELECT "createdAt", "date", "id", "imageUrl", "title", "updatedAt" FROM "Certificate";
DROP TABLE "Certificate";
ALTER TABLE "new_Certificate" RENAME TO "Certificate";
CREATE TABLE "new_Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personalInfo" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "pdfFileData" TEXT,
    "pdfFileName" TEXT,
    "contentType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Resume" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Resume";
DROP TABLE "Resume";
ALTER TABLE "new_Resume" RENAME TO "Resume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
