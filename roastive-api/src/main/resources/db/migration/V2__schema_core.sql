-- Core tables from schema.prisma (subset) with UUIDv7 defaults

-- roastery
CREATE TABLE IF NOT EXISTS roastery (
    roastery_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_name varchar(120) NOT NULL,
    code varchar(32) NOT NULL UNIQUE,
    status varchar(32) NOT NULL,
    legal_name varchar(160),
    representative_name varchar(120),
    brand_name varchar(160),
    business_reg_no varchar(32) UNIQUE,
    phone varchar(64),
    email varchar(160) UNIQUE,
    website varchar(200),
    timezone varchar(64),
    base_currency varchar(8),
    default_unit varchar(16),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roastery_status ON roastery(status);

-- user_account
CREATE TABLE IF NOT EXISTS user_account (
    user_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    email varchar(190) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    display_name varchar(120),
    status varchar(32) NOT NULL,
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- role
CREATE TABLE IF NOT EXISTS role (
    role_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    role_name varchar(64) NOT NULL UNIQUE,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- role_permission
CREATE TABLE IF NOT EXISTS role_permission (
    permission_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    role_id uuid NOT NULL,
    module varchar(64) NOT NULL,
    action varchar(32) NOT NULL,
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    CONSTRAINT uq_role_permission UNIQUE (role_id, module, action)
);

-- user_role
CREATE TABLE IF NOT EXISTS user_role (
    user_role_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

-- customer
CREATE TABLE IF NOT EXISTS customer (
    customer_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    customer_name varchar(120) NOT NULL,
    code varchar(32) UNIQUE,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- customer_membership
CREATE TABLE IF NOT EXISTS customer_membership (
    membership_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    user_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    role_id uuid NOT NULL,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_cm_user FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_role FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE RESTRICT,
    CONSTRAINT uq_customer_membership UNIQUE (user_id, customer_id)
);

-- roastery_user
CREATE TABLE IF NOT EXISTS roastery_user (
    roastery_user_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role_name varchar(64) NOT NULL,
    status varchar(32) NOT NULL,
    joined_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_ru_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE,
    CONSTRAINT fk_ru_user FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_roastery_user UNIQUE (roastery_id, user_id)
);


