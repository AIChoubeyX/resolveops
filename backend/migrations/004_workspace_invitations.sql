CREATE TABLE IF NOT EXISTS organization_invitations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  invited_by BIGINT NOT NULL REFERENCES users(id),
  accepted_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_organization_invitations_email
  ON organization_invitations(lower(invited_email), status);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization
  ON organization_invitations(organization_id, status);

ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
