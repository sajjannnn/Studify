-- CreateEnum
CREATE TYPE "University" AS ENUM ('DU', 'IPU');

-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('SEM1', 'SEM2', 'SEM3', 'SEM4', 'SEM5', 'SEM6', 'SEM7', 'SEM8');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('UPLOADED', 'GENERATED');

-- CreateEnum
CREATE TYPE "EmbeddingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "type" "DocType" NOT NULL DEFAULT 'UPLOADED',
    "tags" TEXT[],
    "embeddingStatus" "EmbeddingStatus" NOT NULL DEFAULT 'PENDING',
    "university" "University",
    "course" TEXT,
    "semester" "Semester",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
