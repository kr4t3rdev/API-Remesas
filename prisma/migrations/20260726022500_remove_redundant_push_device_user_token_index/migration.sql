-- pushToken is already globally unique, so the compound constraint is redundant.
DROP INDEX "push_devices_userId_pushToken_key";
