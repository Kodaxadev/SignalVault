import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('../migrations/005_harden_signal_rls.sql', import.meta.url),
  'utf8'
);

describe('005_harden_signal_rls migration', () => {
  it('replaces the broad all-command signal policy with command-specific policies', () => {
    expect(migration).toContain('DROP POLICY IF EXISTS write_auth ON signals');
    expect(migration).toContain('CREATE POLICY signal_insert_auth ON signals');
    expect(migration).toContain('CREATE POLICY signal_update_auth ON signals');
    expect(migration).toContain('CREATE POLICY signal_delete_auth ON signals');
    expect(migration).not.toContain('FOR ALL');
  });

  it('checks inserted author tribe against the current RLS tribe context', () => {
    expect(migration).toContain("author_tribe_id = nullif(current_setting('app.current_tribe_id', true), '')");
  });

  it('keeps public reads visible without tribe context', () => {
    expect(migration).toContain("visibility = 'public'");
  });

  it('requires identity source and resolved-at snapshots when character identity is present', () => {
    expect(migration).toContain('signals_identity_resolved_at_required_for_character');
    expect(migration).toContain('audit_identity_source_required_for_character');
    expect(migration).toContain('audit_identity_resolved_at_required_for_character');
  });

  it('enables row security on deployed-role protected tables', () => {
    expect(migration).toContain('ALTER TABLE signals ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY');
  });
});
