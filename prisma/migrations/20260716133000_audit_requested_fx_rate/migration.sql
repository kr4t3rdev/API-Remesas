ALTER TABLE "transactions" ADD COLUMN "requestedRate" DECIMAL(10,4);

UPDATE "transactions" SET "requestedRate" = "rate" WHERE "requestedRate" IS NULL;
