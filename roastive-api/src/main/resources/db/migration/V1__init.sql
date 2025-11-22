-- Enable extensions for UUID v7 support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pg_uuidv7 is available on PostgreSQL 13+ via extension; ignore if missing in env
DO $$
BEGIN
    EXECUTE 'CREATE EXTENSION IF NOT EXISTS "pg_uuidv7"';
EXCEPTION WHEN others THEN
    -- Extension may not exist; proceed without failing migrations
    RAISE NOTICE 'pg_uuidv7 extension not available; ensure it is installed in target DB.';
END$$;

-- Example base table to validate migration; real tables will be generated later
CREATE TABLE IF NOT EXISTS schema_version_check (
    id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    created_at timestamptz NOT NULL DEFAULT now()
);


