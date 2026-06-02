-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bookmarkNoteIds" TEXT[],
ADD COLUMN     "documentIds" TEXT[],
ADD COLUMN     "noteIds" TEXT[];
