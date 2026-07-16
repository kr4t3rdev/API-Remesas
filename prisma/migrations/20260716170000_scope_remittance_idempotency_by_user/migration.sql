BEGIN;

CREATE UNIQUE INDEX "remittances_userId_provider_sourceId_key"
ON "remittances"("userId", "provider", "sourceId");

DROP INDEX "remittances_provider_sourceId_key";

COMMIT;
