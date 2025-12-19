-- Add additional roles
INSERT INTO roles (id, name, created_at) VALUES 
  (gen_random_uuid(), 'Administrator', NOW()),
  (gen_random_uuid(), 'Content Editor', NOW()),
  (gen_random_uuid(), 'Support Agent', NOW())
ON CONFLICT (name) DO NOTHING;

-- Add additional permissions
INSERT INTO permissions (id, name, description, created_at) VALUES 
  (gen_random_uuid(), 'content:read', 'Read content', NOW()),
  (gen_random_uuid(), 'content:write', 'Create/update content', NOW()),
  (gen_random_uuid(), 'content:delete', 'Delete content', NOW()),
  (gen_random_uuid(), 'support:read', 'Read support tickets', NOW()),
  (gen_random_uuid(), 'support:write', 'Respond to support tickets', NOW())
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to Administrator role (all read/write, no delete)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Administrator'
AND p.name NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;

-- Assign content permissions to Content Editor role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Content Editor'
AND p.name LIKE 'content:%'
ON CONFLICT DO NOTHING;

-- Assign support permissions to Support Agent role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Support Agent'
AND p.name LIKE 'support:%'
ON CONFLICT DO NOTHING;
