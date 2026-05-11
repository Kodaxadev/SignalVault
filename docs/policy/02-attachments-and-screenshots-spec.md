# Attachments and Screenshots Spec

## Status

Draft policy. Attachments are **not required for v0.1**.

## Purpose

Define whether and how Signal Vault supports screenshots, files, and evidence attachments.

Attachments are useful for intelligence, but they add storage, privacy, moderation, security, and browser-compatibility complexity.

## Product Decision

Do **not** build full attachment support in v0.1.

v0.1 should support:

- plain-text Signal body
- tags
- linked entities
- optional URL/reference fields
- optional transaction digest/reference
- optional "evidence note" text field

Full screenshots/files come later.

## Why Attachments Are Deferred

Attachments introduce:

- storage cost
- file upload compatibility issues in in-game browser
- moderation risk
- privacy risk
- malware/content scanning needs
- CDN/bucket configuration
- access-control complexity
- export/delete complexity
- tribe ownership complexity

The in-game browser compatibility is also unknown until tested.

## Official Gameplay Context

EVE Frontier docs describe Smart Storage Units as in-game structures for storing/dispensing items, with owner-controlled SSU inventory and player-specific ephemeral inventory. Signal Vault must not confuse app file attachments with in-game item storage.

Signal Vault attachments are external app evidence, not game inventory.

## Attachment Types

Potential later types:

```ts
export type AttachmentType =
  | "screenshot"
  | "image"
  | "json_export"
  | "text_log"
  | "transaction_reference"
  | "external_url"
  | "unknown";
```

## v0.1 Evidence Fields

Instead of files, support structured references:

```ts
export type SignalEvidenceRef = {
  id: string;
  kind:
    | "transaction_digest"
    | "object_id"
    | "item_id"
    | "system_label"
    | "external_url"
    | "manual_note";
  label: string;
  value: string;
  addedAt: string;
};
```

Examples:

- transaction digest
- object ID
- item ID
- route/system label
- external map URL
- manual "saw this in-game" note

## Later Attachment Model

```ts
export type SignalAttachment = {
  id: string;
  signalId: string;
  type: AttachmentType;
  fileName: string;
  mimeType: string;
  byteSize: number;
  storageKey: string;
  sha256?: string;
  visibility: SignalVisibility;
  uploadedByWallet?: string;
  uploadedByCharacterId?: string;
  createdAt: string;
  deletedAt?: string;
};
```

## Storage Policy

If implemented later:

- private attachments stored in private bucket/path
- tribe attachments stored in tribe-scoped bucket/path
- public attachments stored in public or signed-URL bucket/path
- signed URLs should expire
- attachments must inherit or be stricter than Signal visibility
- deleting a Signal should soft-delete attachments
- export should include attachment metadata and optionally file blobs

## Security Requirements

Before file uploads ship:

- max file size
- allowlist MIME types
- server-side MIME validation
- malware scanning strategy
- image metadata stripping
- private bucket access
- signed URL expiration
- audit log for upload/delete
- moderation/report flow
- user-facing privacy warning

## Recommended MIME Allowlist Later

```txt
image/png
image/jpeg
image/webp
text/plain
application/json
```

Do not allow:

- executables
- arbitrary archives
- HTML files
- SVG unless sanitized
- scripts
- unknown binary blobs

## Browser Compatibility Requirements

Before enabling upload in in-game browser, test:

- file input works
- camera/screenshot path works if relevant
- upload progress works
- large files do not freeze UI
- failed upload does not delete Signal draft
- upload can be skipped

If in-game browser upload is unreliable:

- allow external browser upload only
- allow in-game evidence text/ref capture only

## Privacy Requirements

Attachment upload UI must warn:

```txt
Attachments may reveal system names, coordinates, chat text, player names, UI state, or operational secrets. Confirm visibility before upload.
```

## Data Ownership

Attachments inherit Signal ownership:

- private Signal → author-owned attachment
- tribe Signal → tribe-owned attachment
- officer Signal → officer-scope attachment
- public Signal → public attachment

Changing Signal visibility should require attachment visibility review.

## Deletion

Remote attachment deletion should be soft delete initially:

```sql
deleted_at timestamptz
deleted_by_wallet text
deleted_by_character_id text
delete_reason text
```

Hard delete may be required for privacy/legal requests.

## Database Schema Later

```sql
create table signal_attachments (
  id uuid primary key,
  signal_id uuid not null references signals(id) on delete cascade,
  attachment_type text not null,
  file_name text not null,
  mime_type text not null,
  byte_size bigint not null,
  storage_key text not null,
  sha256 text,
  visibility text not null,

  uploaded_by_wallet text,
  uploaded_by_character_id text,

  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by_wallet text,
  deleted_by_character_id text,
  delete_reason text
);
```

## MVP Acceptance Criteria

For v0.1:

- no required file upload
- Signal can include evidence refs
- user can paste object IDs / transaction digests / URLs
- DB schema does not require attachment table
- docs explicitly state screenshots/files are deferred

## Later Acceptance Criteria

Before shipping attachments:

- upload works in external browser
- in-game browser compatibility tested
- signed URL access works
- visibility rules enforced
- file size/mime rules enforced
- upload/delete audited
- export/delete policy documented
