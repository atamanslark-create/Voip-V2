-- Insert demo users (password: "password" hashed with bcrypt)
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES
  ('admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/LYe', 'Administrator', 'admin', true),
  ('manager@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/LYe', 'Demo Manager', 'manager', true),
  ('telephonist@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/LYe', 'Demo Telephonist', 'telephonist', true)
ON CONFLICT (email) DO NOTHING;

-- Insert demo SIP lines
INSERT INTO sip_lines (name, number, color, description)
VALUES
  ('Line 1', '101', '#ef4444', 'Main reception line'),
  ('Line 2', '102', '#f97316', 'Support line'),
  ('Line 3', '103', '#eab308', 'Sales line'),
  ('Line 4', '104', '#22c55e', 'Manager line')
ON CONFLICT (number) DO NOTHING;
