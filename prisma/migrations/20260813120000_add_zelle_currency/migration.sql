-- Add Zelle (ZLL) as a default currency (USD variant, 1 ZLL = 1.04 USD)
INSERT INTO "currencies" ("code", "name", "symbol", "isActive", "createdAt", "updatedAt")
SELECT 'ZLL', 'Zelle (Dólar)', '$', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "currencies" WHERE "code" = 'ZLL');

-- Seed an initial exchange rate for existing users who already have a USD rate,
-- derived as ZLL = USD referenceRate * 1.04 (keeps the 1 ZLL = 1.04 USD invariant)
INSERT INTO "exchange_rates" ("userId", "currencyId", "referenceRate", "buyMargin", "sellMargin", "effectiveDate", "createdAt", "updatedAt")
SELECT usd_rate."userId",
       zll.id,
       usd_rate."referenceRate" * 1.04,
       usd_rate."buyMargin",
       usd_rate."sellMargin",
       NOW(),
       NOW(),
       NOW()
FROM "exchange_rates" usd_rate
JOIN "currencies" usd ON usd.id = usd_rate."currencyId" AND usd."code" = 'USD'
JOIN "currencies" zll ON zll."code" = 'ZLL'
WHERE NOT EXISTS (
  SELECT 1 FROM "exchange_rates" er
  JOIN "currencies" c ON c.id = er."currencyId" AND c."code" = 'ZLL'
  WHERE er."userId" = usd_rate."userId"
);