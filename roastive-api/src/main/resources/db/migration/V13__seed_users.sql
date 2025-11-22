-- Seed default users (id generated via uuid_generate_v7())

INSERT INTO user_account (user_id, email, password_hash, display_name, status, created_at, updated_at)
VALUES (COALESCE(uuid_generate_v7(), uuid_generate_v4()), 'admin@roastive.local', '$2a$10$2R3o4vGm1y2g0fvF0k8sUe4p9Fh0w8QF9JtQJz6pZQwV7qkAq1Z7S', 'Admin', 'ACTIVE', now(), now())
ON CONFLICT (email) DO NOTHING;

-- Example user matching the login attempt used during testing
INSERT INTO user_account (user_id, email, password_hash, display_name, status, created_at, updated_at)
VALUES (COALESCE(uuid_generate_v7(), uuid_generate_v4()), 'jakalxxx@gmail.com', '$2a$10$2R3o4vGm1y2g0fvF0k8sUe4p9Fh0w8QF9JtQJz6pZQwV7qkAq1Z7S', 'Tester', 'ACTIVE', now(), now())
ON CONFLICT (email) DO NOTHING;


