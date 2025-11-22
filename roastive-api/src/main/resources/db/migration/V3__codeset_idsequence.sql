-- code_set
CREATE TABLE IF NOT EXISTS code_set (
    id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    code_type varchar(64) NOT NULL,
    code_key varchar(64) NOT NULL,
    label varchar(128) NOT NULL,
    sort integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    meta jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_code_set_type_key UNIQUE (code_type, code_key)
);
CREATE INDEX IF NOT EXISTS idx_code_set_type_sort ON code_set(code_type, sort);

-- id_sequence
CREATE TABLE IF NOT EXISTS id_sequence (
    name uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    last_value bigint NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);


