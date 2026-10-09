-- Email reminders for scheduled uploads: tracks when the reminder was sent.

-- AlterTable
ALTER TABLE "ContentIdea" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

