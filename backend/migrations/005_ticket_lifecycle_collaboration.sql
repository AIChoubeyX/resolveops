ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets
  ADD CONSTRAINT tickets_status_check
  CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed'));

ALTER TABLE ticket_comments
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';

ALTER TABLE ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_visibility_check;
ALTER TABLE ticket_comments
  ADD CONSTRAINT ticket_comments_visibility_check
  CHECK (visibility IN ('public', 'internal'));

CREATE INDEX IF NOT EXISTS idx_ticket_comments_visibility
  ON ticket_comments(ticket_id, visibility, created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_organization_assignee
  ON tickets(organization_id, assignee_id);
