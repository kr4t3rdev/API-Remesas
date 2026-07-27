-- Compound (userId, pushToken) uniqueness replaces the global pushToken unique.
-- Prevents silent ownership transfer between users when Expo push tokens are reused
-- (rare but possible on device restore). The upsert service now uses this compound key.

DROP INDEX "push_devices_pushToken_key";

CREATE UNIQUE INDEX "push_devices_userId_pushToken_key" ON "push_devices"("userId", "pushToken");
