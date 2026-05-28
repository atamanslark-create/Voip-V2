-- Create admin user
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
    'admin@example.com',
    '$2b$10$IQvb6o/n0VqQl5g9s6YeFOZU8U4QaDABZl8Cmu8IKFx5H8vJqDSw.',  -- password
    'Administrator',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Create demo manager
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
    'manager@example.com',
    '$2b$10$IQvb6o/n0VqQl5g9s6YeFOZU8U4QaDABZl8Cmu8IKFx5H8vJqDSw.',
    'Demo Manager',
    'manager',
    true
) ON CONFLICT (email) DO NOTHING;

-- Create demo telephonist
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
    'telephonist@example.com',
    '$2b$10$IQvb6o/n0VqQl5g9s6YeFOZU8U4QaDABZl8Cmu8IKFx5H8vJqDSw.',
    'Demo Telephonist',
    'telephonist',
    true
) ON CONFLICT (email) DO NOTHING;

-- Create demo SIP lines
INSERT INTO sip_lines (name, number, color, description)
VALUES
    ('Line 1', '101', '#ef4444', 'Main reception line'),
    ('Line 2', '102', '#f97316', 'Support line'),
    ('Line 3', '103', '#eab308', 'Sales line'),
    ('Line 4', '104', '#22c55e', 'Manager line')
ON CONFLICT (number) DO NOTHING;
