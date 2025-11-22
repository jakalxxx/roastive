-- Ensure UUID-related extensions and provide a fallback for uuid_generate_v7()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fallback implementation: use gen_random_uuid() when pg_uuidv7 extension is unavailable
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN gen_random_uuid();
END;
$$;


