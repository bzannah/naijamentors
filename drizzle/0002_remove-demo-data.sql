-- Remove the fictional demo data that earlier versions seeded.
-- Every demo account used an address on the reserved .demo domain (…@naijamentors.demo and
-- …@mentor.naijamentors.demo), which no real person can own. Deleting those accounts cascades to the
-- demo mentors' profiles and to every conversation, session and message involving them.
DELETE FROM "users" WHERE "email" LIKE '%@naijamentors.demo' OR "email" LIKE '%.naijamentors.demo';
